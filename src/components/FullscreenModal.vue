<script setup>
  import { ref, computed, watch } from 'vue';
  import { getName, getAuthorList, getDataResourceURL } from '../util/GemeUtil.js';
  import { getGameImageSync, getShowcaseImagesSync } from '../util/ImageUtil.js';
  import { loadDescription } from '../util/DescriptionUtil.js';
  import { disableScroll, enableScroll } from '../util/OverlayScrollbarsUtil.js';
  import MarkdownIt from 'markdown-it';

  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    },
    game: {
      type: Object,
      default: null
    },
    lan: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'mf-games'
    }
  });

  const emit = defineEmits(['close']);

  const md = new MarkdownIt();
  const showImagePreview = ref(false);
  const previewImageUrl = ref('');
  const markdownContent = ref('');

  const isMwLevel = computed(() => {
    return props.category === 'mw-levels';
  });

  const gameName = computed(() => {
    if (!props.game) return '';
    return getName(props.game, props.lan);
  });

  const smwpVersion = computed(() => {
    if (!props.game || !props.game.smwp_ver) return null;
    return props.game.smwp_ver;
  });

  const smwpUrl = computed(() => {
    if (!props.game || !props.game.smwp_ver || !props.game.smwp_url) return null;
    return props.game.smwp_url;
  });

  const titleImage = computed(() => {
    if (!props.game) return null;
    return getGameImageSync(props.game, props.category);
  });

  const showcaseImages = computed(() => {
    if (!props.game) return [];
    return getShowcaseImagesSync(props.game, props.category);
  });

  const sourceUrls = computed(() => {
    if (!props.game) return [];
    
    if (isMwLevel.value) {
      if (props.game.currentVer && props.game.currentVer.source_url) {
        return [{ 
          url: props.game.currentVer.source_url, 
          versionDisplay: '',
          invalid: props.game.currentVer.source_url_invalid || false
        }];
      }
      return [];
    }
    
    if (!props.game.ver) return [];
    
    const sourceMap = new Map();
    
    for (const verRaw of props.game.ver) {
      const verKey = Object.keys(verRaw)[0];
      const ver = verRaw[verKey];
      
      const versionKey = (props.lan === 'en' && ver.ver_alt) ? ver.ver_alt : verKey;
      
      let url = null;
      let isInvalid = false;
      
      if (props.lan === 'zh') {
        if (ver.source_url) {
          isInvalid = ver.source_url_invalid || false;
          url = ver.source_url;
        }
      } else {
        if (ver.source_url_alt) {
          isInvalid = ver.source_url_invalid_alt || false;
          url = ver.source_url_alt;
        } else if (ver.source_url) {
          isInvalid = ver.source_url_invalid || false;
          url = ver.source_url;
        }
      }
      
      if (url) {
        if (sourceMap.has(url)) {
          sourceMap.get(url).versions.push(versionKey);
        } else {
          sourceMap.set(url, { url, versions: [versionKey], invalid: isInvalid });
        }
      }
    }
    
    const processVersion = (version) => {
      if (!version) return '';
      const match = version.match(/^(.+?)\s*\(([^)]*)\)$/);
      if (match) {
        const baseVersion = match[1];
        const contentInParentheses = match[2];
        if (!/fix/i.test(contentInParentheses)) {
          version = baseVersion.trim();
        }
      }
      version = version.replace(/\s*(Windows|Linux)\s*/gi, '').trim();
      return version;
    };
    
    const result = Array.from(sourceMap.values());
    
    if (result.length === 1) {
      result[0].versionDisplay = '';
    } else {
      result.forEach(item => {
        const processedVersions = item.versions.map(processVersion).filter(v => v);
        const uniqueVersions = [...new Set(processedVersions)];
        
        if (uniqueVersions.length > 3) {
          item.versionDisplay = `${uniqueVersions[0]} ~ ${uniqueVersions[uniqueVersions.length - 1]}`;
        } else {
          item.versionDisplay = uniqueVersions.join(', ');
        }
      });
    }
    
    return result;
  });

  const repoUrl = computed(() => {
    if (!props.game || !props.game.repo) return null;
    return props.game.repo;
  });

  const authors = computed(() => {
    if (!props.game) return [];
    const authorList = getAuthorList(props.game, props.lan);
    if (typeof authorList === 'string') {
      return [authorList];
    }
    return authorList || [];
  });

  const releaseDate = computed(() => {
    if (!props.game) return null;
    
    if (isMwLevel.value) {
      if (!props.game.date) return null;
      const date = props.game.date;
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year} 年 ${month} 月 ${day} 日`;
    }
    
    if (!props.game.ver) return null;
    
    let earliestDate = null;
    for (const verRaw of props.game.ver) {
      const verKey = Object.keys(verRaw)[0];
      const ver = verRaw[verKey];
      if (ver.date) {
        if (!earliestDate || ver.date < earliestDate) {
          earliestDate = ver.date;
        }
      }
    }
    
    if (!earliestDate) return null;
    
    if (props.lan === 'zh') {
      const year = earliestDate.getFullYear();
      const month = earliestDate.getMonth() + 1;
      const day = earliestDate.getDate();
      return `${year} 年 ${month} 月 ${day} 日`;
    } else {
      const day = earliestDate.getDate();
      const month = earliestDate.toLocaleString('en-US', { month: 'long' });
      const year = earliestDate.getFullYear();
      return `${month} ${day}, ${year}`;
    }
  });

  const latestUpdate = computed(() => {
    if (!props.game || !props.game.ver || props.game.ver.length <= 1) return null;
    
    let latestDate = null;
    let latestVer = null;
    for (const verRaw of props.game.ver) {
      const verKey = Object.keys(verRaw)[0];
      const ver = verRaw[verKey];
      const versionKey = (props.lan === 'en' && ver.ver_alt) ? ver.ver_alt : verKey;
      if (ver.date) {
        if (!latestDate || ver.date > latestDate) {
          latestDate = ver.date;
          latestVer = versionKey;
        }
      }
    }
    
    if (!latestDate) return null;
    
    const processUpdateVersion = (version) => {
      if (!version) return '';
      version = version.replace(/\s*(Windows|Linux)\s*/gi, '').trim();
      const match = version.match(/^(.+?)\s*\((Windows|Linux)\s*\)$/i);
      if (match) {
        version = match[1].trim();
      }
      return version;
    };
    
    const processedVer = processUpdateVersion(latestVer);
    
    if (props.lan === 'zh') {
      const year = latestDate.getFullYear();
      const month = latestDate.getMonth() + 1;
      const day = latestDate.getDate();
      if (processedVer) {
        return `${year} 年 ${month} 月 ${day} 日 (${processedVer})`;
      }
      return `${year} 年 ${month} 月 ${day} 日`;
    } else {
      const day = latestDate.getDate();
      const month = latestDate.toLocaleString('en-US', { month: 'long' });
      const year = latestDate.getFullYear();
      if (processedVer) {
        return `${month} ${day}, ${year} (${processedVer})`;
      }
      return `${month} ${day}, ${year}`;
    }
  });

  const downloadEntries = computed(() => {
    if (!props.game) return [];
    
    if (isMwLevel.value) {
      if (props.game.file_urls && props.game.file_urls.length > 0) {
        return props.game.file_urls.map(item => ({
          version: item.name || '下载',
          url: item.url
        }));
      }
      return [];
    }
    
    if (!props.game.ver) return [];
    
    const entries = [];
    for (const verRaw of props.game.ver) {
      const verKey = Object.keys(verRaw)[0];
      const ver = verRaw[verKey];
      const versionKey = (props.lan === 'en' && ver.ver_alt) ? ver.ver_alt : verKey;
      
      const urlKey = props.lan === 'zh' ? 'file_url_zh' : 'file_url_en';
      if (ver[urlKey]) {
        entries.push({
          version: versionKey || (props.lan === 'zh' ? '下载' : 'Download'),
          url: ver[urlKey]
        });
      }
    }
    
    return entries;
  });

  const hasDataDownload = computed(() => {
    if (!props.game || !props.game.currentVer) return false;
    return props.game.currentVer.data_file_name || props.game.currentVer.data_file_url || 
           props.game.currentVer.data_file_url_zh || props.game.currentVer.data_file_url_en;
  });

  const videos = computed(() => {
    if (!props.game) return [];
    
    if (isMwLevel.value) {
      if (props.game.video) {
        return props.game.video.map(v => {
          const key = Object.keys(v)[0];
          return { title: key, url: v[key] };
        });
      }
      return [];
    }
    
    if (props.lan === 'zh') {
      if (props.game.video_zh) {
        return props.game.video_zh.map(v => {
          const key = Object.keys(v)[0];
          return { title: key, url: v[key] };
        });
      }
    } else {
      if (props.game.video_en) {
        return props.game.video_en.map(v => {
          const key = Object.keys(v)[0];
          return { title: key, url: v[key] };
        });
      }
    }
    
    return [];
  });

  const wikiUrl = computed(() => {
    if (!props.game) return null;
    
    if (isMwLevel.value) {
      return props.game.wiki_zh_url || null;
    }
    
    if (props.lan === 'zh') {
      return props.game.wiki_zh_url || null;
    } else {
      return props.game.wiki_en_url || null;
    }
  });

  const renderedDescription = computed(() => {
    return md.render(markdownContent.value);
  });

  const shortDesc = computed(() => {
    if (!props.game) return null;
    
    const descKey = props.lan === 'zh' ? 'description_zh' : 'description_en';
    if (props.game[descKey]) {
      return props.game[descKey];
    }
    if (props.game.description) {
      return props.game.description;
    }
    return null;
  });

  const loadMarkdownDescription = async () => {
    if (!props.game) {
      markdownContent.value = '';
      return;
    }
    
    const content = await loadDescription(props.game, props.category, props.lan);
    markdownContent.value = content || '';
  };

  watch(() => [props.game, props.lan], () => {
    loadMarkdownDescription();
  }, { immediate: true });

  watch(() => props.show, (newVal) => {
    if (newVal) {
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      disableScroll();
    } else {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      enableScroll();
    }
  });

  const openImagePreview = (url) => {
    previewImageUrl.value = url;
    showImagePreview.value = true;
  };

  const closeImagePreview = () => {
    showImagePreview.value = false;
    previewImageUrl.value = '';
  };
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="fullscreen-modal-bg" @click="emit('close')">
      <div class="fullscreen-modal-content" @click.stop>
        <button class="close-button" @click="emit('close')">&times;</button>
        <div class="modal-body">
          <h1 class="game-title">{{ gameName }}</h1>
          
          <div v-if="isMwLevel && smwpVersion" class="smwp-version">
            <span class="smwp-label">{{'SMWP 版本'}}:</span>
            <span v-if="smwpUrl" class="smwp-value">
              <a :href="smwpUrl" target="_blank">{{ smwpVersion }}</a>
            </span>
            <span v-else class="smwp-value">{{ smwpVersion }}</span>
          </div>
          
          <div v-if="!isMwLevel" class="title-image-container">
            <img v-if="titleImage" :src="titleImage" :alt="gameName" class="title-image" />
            <p v-else class="no-logo">&lt;{{ lan === 'zh' ? '暂无 logo' : 'No logo' }}&gt;</p>
          </div>
          
          <hr class="section-divider" />
          
          <div class="content-section">
            <h3 class="section-title">{{ lan === 'zh' ? '发布链接' : 'Original source' }}</h3>
            <ul v-if="sourceUrls.length > 0" class="source-list">
              <li v-for="(source, index) in sourceUrls" :key="index">
                <span v-if="source.versionDisplay" class="version-label">({{ source.versionDisplay }})</span>
                <span v-if="source.invalid" class="source-link invalid">{{ source.url }}</span>
                <a v-else :href="source.url" target="_blank" class="source-link">{{ source.url }}</a>
                <span v-if="source.invalid" class="invalid-label">({{ lan === 'zh' ? '已失效' : 'Invalid' }})</span>
              </li>
            </ul>
            <p v-else class="no-data">{{ lan === 'zh' ? '暂无发布链接' : 'No source links available' }}</p>
          </div>
          
          <div v-if="repoUrl" class="content-section">
            <h3 class="section-title">{{ lan === 'zh' ? '开源地址' : 'Repository' }}</h3>
            <ul class="repo-list">
              <li>
                <a :href="repoUrl" target="_blank" class="repo-link">{{ repoUrl }}</a>
              </li>
            </ul>
          </div>
          
          <div class="content-section">
            <h3 class="section-title">{{ lan === 'zh' ? `作者` : `Author${authors.length > 1 ? 's' : ''}` }}</h3>
            <ul v-if="authors.length > 0" class="author-list">
              <li v-for="(author, index) in authors" :key="index">{{ author }}</li>
            </ul>
            <p v-else class="no-data">{{ lan === 'zh' ? '暂无作者信息' : 'No author information' }}</p>
          </div>
          
          <div class="content-section">
            <h3 class="section-title">{{ lan === 'zh' ? '发布时间' : 'Release date' }}</h3>
            <ul v-if="releaseDate" class="date-list">
              <li>{{ releaseDate }}</li>
            </ul>
            <p v-else class="no-data">{{ lan === 'zh' ? '暂无发布时间' : 'No release date' }}</p>
          </div>
          
          <div v-if="latestUpdate" class="content-section">
            <h3 class="section-title">{{ lan === 'zh' ? '更新时间' : 'Latest update' }}</h3>
            <ul class="date-list">
              <li>{{ latestUpdate }}</li>
            </ul>
          </div>
          
          <div v-if="wikiUrl" class="content-section">
            <h3 class="section-title">{{ lan === 'zh' ? 'Wiki 链接' : 'Wiki link' }}</h3>
            <ul class="wiki-list">
              <li>
                <a :href="wikiUrl" target="_blank" class="wiki-link">{{ wikiUrl }}</a>
              </li>
            </ul>
          </div>
          
          <div class="content-section">
            <h3 class="section-title">{{ lan === 'zh' ? '图集' : 'Showcases' }}</h3>
            <div v-if="showcaseImages.length > 0" class="showcase-grid">
              <img 
                v-for="(img, index) in showcaseImages" 
                :key="index"
                :src="img.url" 
                :alt="`Showcase ${index + 1}`"
                class="showcase-thumbnail"
                @click="openImagePreview(img.url)"
              />
            </div>
            <p v-else class="no-data">{{ lan === 'zh' ? '暂无图片' : 'No showcase images' }}</p>
          </div>
          
          <div v-if="videos.length > 0" class="content-section">
            <h3 class="section-title">{{ lan === 'zh' ? '视频' : 'Videos' }}</h3>
            <ul class="video-list">
              <li v-for="(video, index) in videos" :key="index">
                <span v-if="video.title" class="video-title">{{ video.title }}:</span>
                <a :href="video.url" target="_blank" class="video-link">{{ video.url }}</a>
              </li>
            </ul>
          </div>
          
          <div class="content-section">
            <h3 class="section-title">{{ lan === 'zh' ? '下载' : 'Downloads' }}</h3>
            <ul v-if="downloadEntries.length > 0" class="download-list">
              <li v-for="(entry, index) in downloadEntries" :key="index" class="download-item">
                <span class="floppy-icon">💾</span>
                <a :href="entry.url" target="_blank" class="download-link">{{ entry.version }}</a>
              </li>
              <li v-if="hasDataDownload" class="download-item">
                <span class="floppy-icon">💾</span>
                <a :href="getDataResourceURL(game, lan)" target="_blank" class="download-link">
                  {{ lan === 'zh' ? '数据包' : 'Data' }}
                </a>
              </li>
            </ul>
            <p v-else class="no-data">{{ lan === 'zh' ? '暂无下载链接' : 'No download links' }}</p>
          </div>
          
          <div v-if="shortDesc" class="content-section">
            <h3 class="section-title">{{ lan === 'zh' ? '简介' : 'ShortDesc' }}</h3>
            <p class="short-desc">{{ shortDesc }}</p>
          </div>
          
          <div v-if="renderedDescription" class="content-section">
            <h3 class="section-title">{{ lan === 'zh' ? '说明' : 'Description' }}</h3>
            <div class="description-content" v-html="renderedDescription"></div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
  
  <Transition name="modal">
    <div v-if="showImagePreview" class="image-preview-bg" @click="closeImagePreview">
      <div class="image-preview-content" @click.stop>
        <button class="close-button" @click="closeImagePreview">&times;</button>
        <img :src="previewImageUrl" :alt="lan === 'zh' ? '预览图片' : 'Preview image'" class="preview-image" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .fullscreen-modal-bg {
    position: fixed;
    z-index: 1001;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fullscreen-modal-content {
    background-color: #fff;
    width: 90vw;
    height: 90vh;
    border-radius: .5em;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    position: relative;
    display: flex;
    flex-direction: column;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }

  .close-button {
    position: absolute;
    top: 0.5em;
    right: 0.5em;
    font-size: 2.3em;
    font-weight: bold;
    color: #666;
    background: none;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
  }

  .close-button:hover {
    color: #000;
  }

  .modal-body {
    padding: 2em;
    overflow-y: auto;
    flex: 1;
    font-size: 0.95em;
  }

  .game-title {
    text-align: center;
    font-size: 2em;
    color: #333;
  }

  .smwp-version {
    text-align: center;
  }

  .smwp-label {
    color: #666;
    margin-right: 0.5em;
  }

  .smwp-value {
    color: #666;
  }

  .smwp-value a {
    text-decoration: none;
  }

  .smwp-value a:hover {
    text-decoration: underline;
  }

  .title-image-container {
    display: flex;
    justify-content: center;
  }

  .title-image {
    width: 100%;
    max-width: 480px;
    max-height: 300px;
    object-fit: contain;
  }

  .no-logo {
    color: #999;
    margin: 0;
  }

  .section-divider {
    border: none;
    border-top: 2px solid #ddd;
    margin: 1.5em 0;
  }

  .content-section {
    margin-bottom: 1em;
  }

  .section-title {
    font-size: 1.2em;
    color: #333;
    margin-bottom: 0.5em;
    border-left: 3px solid #008cff;
    padding-left: 0.5em;
  }

  .source-list,
  .author-list,
  .date-list,
  .video-list,
  .wiki-list {
    list-style: disc;
    padding-left: 1.5em;
    margin: 0;
  }

  .download-list {
    list-style: none;
    padding-left: 0.5em;
    margin: 0;
  }

  .no-data {
    padding: 0.2em 0 0.2em 0.6em;
    line-height: 1.3;
  }

  .source-list li,
  .author-list li,
  .date-list li,
  .download-list li,
  .video-list li,
  .wiki-list li {
    padding: 0.2em 0;
    line-height: 1.3;
  }

  .video-title {
    margin-right: 0.5em;
  }

  .version-label {
    color: #666;
    margin-right: 0.5em;
  }

  .source-link,
  .download-link,
  .video-link,
  .wiki-link,
  .repo-link {
    text-decoration: none;
    word-break: break-all;
  }

  .source-link:hover,
  .video-link:hover,
  .wiki-link:hover,
  .download-link:hover,
  .repo-link:hover {
    text-decoration: underline;
  }

  .source-link.invalid {
    color: #999;
    font-style: italic;
  }

  .source-link.invalid:hover {
    text-decoration: none;
  }

  .invalid-label {
    color: #999;
    font-style: italic;
    margin-left: 0.5em;
  }

  .download-item {
    display: flex;
    align-items: center;
    gap: 0.25em;
  }

  .floppy-icon {
    font-size: 16px;
    flex-shrink: 0;
    line-height: 1;
  }

  .short-desc {
    padding: 0.2em 0 0.2em 0.6em;
    line-height: 1.3;
  }

  .showcase-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    padding-left: 0.6em;
    gap: 1em;
  }

  .showcase-thumbnail {
    width: 100%;
    height: 150px;
    object-fit: cover;
    cursor: pointer;
    border-radius: 0.25em;
    transition: transform 0.2s;
  }

  .showcase-thumbnail:hover {
    transform: scale(1.05);
  }

  .description-content {
    background-color: #d3d3d3;
    border: 2px solid #a9a9a9;
    padding: 1em;
    border-radius: 0.25em;
    line-height: 1.6;
  }

  .description-content :deep(h1),
  .description-content :deep(h2),
  .description-content :deep(h3) {
    margin-top: 1em;
    margin-bottom: 0.5em;
  }

  .description-content :deep(p) {
    margin-bottom: 1em;
  }

  .description-content :deep(a:hover) {
    text-decoration: underline;
  }

  .description-content :deep(code) {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0.2em 0.4em;
    border-radius: 0.2em;
    font-family: monospace;
  }

  .description-content :deep(pre) {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 1em;
    border-radius: 0.25em;
    overflow-x: auto;
  }

  .description-content :deep(pre code) {
    background-color: transparent;
    padding: 0;
  }

  .no-data {
    color: #999;
  }

  .modal-enter-active, .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-from, .modal-leave-to {
    opacity: 0;
  }

  .image-preview-bg {
    position: fixed;
    z-index: 10000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-preview-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
  }

  .preview-image {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
  }

  body.dark .fullscreen-modal-content {
    background-color: #2a2a2a;
  }

  body.dark .close-button {
    color: #aaa;
  }

  body.dark .close-button:hover {
    color: #fff;
  }

  body.dark .game-title {
    color: #eee;
  }

  body.dark .smwp-label {
    color: #aaa;
  }

  body.dark .smwp-value {
    color: #aaa;
  }

  body.dark .section-title {
    color: #eee;
  }

  body.dark .section-divider {
    border-color: #444;
  }

  body.dark .version-label {
    color: #aaa;
  }

  body.dark .source-link,
  body.dark .download-link,
  body.dark .video-link,
  body.dark .wiki-link,
  body.dark .repo-link {
    color: #4da3ff;
  }

  body.dark .source-link.invalid,
  body.dark .invalid-label,
  body.dark .no-data,
  body.dark .no-logo {
    color: #777;
  }

  body.dark .description-content {
    background-color: #3a3a3a;
    border-color: #555;
    color: #ddd;
  }

  body.dark .description-content :deep(code) {
    background-color: rgba(255, 255, 255, 0.1);
  }

  body.dark .description-content :deep(pre) {
    background-color: rgba(255, 255, 255, 0.05);
  }
</style>
