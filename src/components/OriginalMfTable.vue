<script setup>
import { ref, onMounted, watch } from 'vue';
import DownloadIcon from './icons/IconDownload.vue';
import { readList } from '../util/ReadList.js';
import { getFormattedFileSize } from '../util/OpenListApi.js';
import { toResourceDirectUrl } from '../util/GameUtil.js';
import { getUseDirectLink } from '../util/Language.js';

const props = defineProps({
  lan: {
    type: String,
    required: true
  }
});

// 定义基础URL
const baseUrls = {
  'zh': {
    installer: 'https://file.marioforever.net/Mario Forever/Mario Forever 全版本下载/安装版/',
    portable: 'https://file.marioforever.net/Mario Forever/Mario Forever 全版本下载/绿色版/',
    nsmf_installer: 'https://file.marioforever.net/Mario Forever/New Super Mario Forever 下载/%E5%AE%89%E8%A3%85%E7%89%88/'
  },
  'en': {
    installer: 'https://file.marioforever.net/mario-forever/games/original-mf/installer/',
    portable: 'https://file.marioforever.net/mario-forever/games/original-mf/portable/',
    nsmf_installer: 'https://file.marioforever.net/mario-forever/games/softendo/installer/'
  },
  'cdn': {
    installer: 'https://mf-cdn.kevinh.wang/mario-forever/games/original-mf/installer/',
    portable: 'https://mf-cdn.kevinh.wang/mario-forever/games/original-mf/portable/',
    nsmf_installer: 'https://mf-cdn.kevinh.wang/mario-forever/games/softendo/installer/'
  }
};

const versions = ref([]);

// 下载弹框状态
const selectedDownload = ref(null);
const fileSizeLoading = ref(false);
const fileSize = ref(null);

onMounted(async () => {
  try {
    const data = await readList('list-original-mf.yaml');
    versions.value = data;
  } catch (error) {
    console.error('Failed to load original MF versions:', error);
  }
});

// 格式化日期显示
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取下载链接
const getDownloadUrl = (version, type, useCdn = false) => {
  const urls = useCdn ? baseUrls['cdn'] : baseUrls[props.lan];
  if (type === 'installer' && version.installer) {
    const baseUrl = version.nsmf ? urls.nsmf_installer : urls.installer;
    return `${baseUrl}${version.installer}`;
  } else if (type === 'portable' && version.portable) {
    return `${urls.portable}${version.portable}`;
  }
  return null;
};

const useDirectLink = getUseDirectLink();

// 根据直链开关返回资源站链接（开启时转换为直链）
const getDownloadDirectUrl = (version, type) => {
  const url = getDownloadUrl(version, type);
  return useDirectLink.value ? toResourceDirectUrl(url) : url;
};

// 打开下载弹框
const openDownloadModal = (version, type) => {
  selectedDownload.value = { version, type };
  fetchFileSize();
};

// 是否为 toolbar 安装版
const isToolbarInstaller = () => {
  return selectedDownload.value?.version.toolbar && selectedDownload.value?.type === 'installer';
};

// 点击下载按钮时检查 toolbar
const handleDownloadClick = (event) => {
  if (isToolbarInstaller()) {
    const messageZh = '该版本的安装程序包含 Mario Forever Toolbar（广告插件），请在安装过程中取消勾选"Install the Mario Forever Toolbar"选项；建议优先下载绿色版。';
    const messageEn = 'Warning: This version\'s installer includes the "Mario Forever Toolbar". Please make sure to uncheck the "Install the Mario Forever Toolbar" option to avoid installing it.';
    const message = props.lan === 'zh' ? messageZh : messageEn;
    if (!confirm(message)) {
      event.preventDefault();
    }
  }
};

// 获取文件大小（优先从 CDN 获取）
const fetchFileSize = async () => {
  if (!selectedDownload.value) return;

  fileSizeLoading.value = true;
  fileSize.value = null;

  const { version, type } = selectedDownload.value;
  const cdnUrl = getDownloadUrl(version, type, true);
  const resourceUrl = getDownloadUrl(version, type, false);
  const fetchUrl = cdnUrl || resourceUrl;

  if (fetchUrl) {
    fileSize.value = await getFormattedFileSize(fetchUrl);
  }

  fileSizeLoading.value = false;
};

watch(selectedDownload, (newVal) => {
  if (!newVal) {
    fileSize.value = null;
    fileSizeLoading.value = false;
  }
});

// 判断是否是五星级版本
const isFiveStar = (rating) => {
  return rating === '★★★★★';
};
</script>

<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>{{ lan === 'en' ? 'Version' : '版本' }}</th>
          <th>{{ lan === 'en' ? 'Release date' : '发布日期' }}</th>
          <th>{{ lan === 'en' ? 'Rating' : '推荐度' }}</th>
          <th>{{ lan === 'en' ? 'Installer' : '安装版' }}</th>
          <th>{{ lan === 'en' ? 'Portable' : '绿色版' }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(version, index) in versions" :key="index">
          <td>
            <strong v-if="lan === 'zh' && isFiveStar(version.rating) && !version.toolbar">{{ version.ver }}</strong>
            <span v-else>{{ version.ver }}</span>
          </td>
          <td>{{ formatDate(version.date) }}</td>
          <td>
            <span class="rating">{{ version.rating }}</span>
          </td>
          <td>
            <a
              v-if="getDownloadUrl(version, 'installer')"
              class="button"
              @click="openDownloadModal(version, 'installer')"
            ><DownloadIcon class="icon"></DownloadIcon>
              {{ lan == "en" ? "Download" : "下载" }}
            </a>
          </td>
          <td>
            <a
              v-if="getDownloadUrl(version, 'portable')"
              class="button"
              @click="openDownloadModal(version, 'portable')"
            ><DownloadIcon class="icon"></DownloadIcon>
              {{ lan == "en" ? "Download" : "下载" }}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <Transition name="modal">
    <div v-if="selectedDownload" class="modal-bg" @click="selectedDownload = null;">
      <div class="modal-content" @click.stop="">
        <div class="download-title">
          {{ lan === 'en' ? 'Download' : '下载' }} Mario Forever {{ selectedDownload.version.ver }}
          {{ selectedDownload.type === 'installer' ? (lan === 'en' ? 'Installer' : '安装版') : (lan === 'en' ? 'Portable' : '绿色版') }}
        </div>
        <!-- File size info -->
        <div v-if="fileSizeLoading || fileSize" class="file-size-info">
          <span v-if="fileSizeLoading" class="file-size-loading">{{ lan === 'en' ? 'Fetching file size...' : '获取文件大小中...' }}</span>
          <span v-else-if="fileSize" class="file-size-text">{{ lan === 'en' ? 'File size' : '文件大小' }}: {{ fileSize }}</span>
        </div>
        <!-- Download buttons -->
        <div class="button-line">
          <a
            class="download"
            :class="{ 'has-toolbar': isToolbarInstaller() }"
            :href="getDownloadDirectUrl(selectedDownload.version, selectedDownload.type)"
            target="_blank"
            @click="handleDownloadClick"
          >{{ lan === 'en' ? 'Community File Hub' : '社区资源站' }}</a>
          <a
            class="download"
            :class="{ 'has-toolbar': isToolbarInstaller() }"
            :href="getDownloadUrl(selectedDownload.version, selectedDownload.type, true)"
            target="_blank"
            @click="handleDownloadClick"
          >{{ lan === 'en' ? 'CDN (Cloudflare R2)' : '对象存储' }}</a>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  @import "../assets/general.css";
</style>

<style scoped>
  .icon {
    color: #000;
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
    margin: 2px;
  }

  .button {
    border: 1px solid rgba(0, 0, 0, 0);
    padding: 4px;
    border-radius: .25em;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    cursor: pointer;
    display: inline-block;
    color: #000;
    text-decoration: none;
  }

  .button:hover, .button:focus {
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.1) 2px 2px 6px;
    color: rgba(0, 0, 0, 0.65);
  }

  .button:active {
    background-color: #F0F0F1;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.06) 1px 1px 2px;
    color: rgba(0, 0, 0, 0.65);
  }

  .modal-bg {
    position: fixed;
    z-index: 1001;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .modal-enter-active, .modal-leave-active {
    transition: opacity 0.5s ease;
  }

  .modal-enter-from, .modal-leave-to {
    opacity: 0;
  }

  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    max-width: 80vw;
    max-height: 80vh;
    padding: 1em;
    border-radius: .5em;
    overflow-y: auto;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }

  .toolbar-warning {
    margin-top: .5em;
    padding: .5em;
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: .25em;
    font-size: 0.9em;
    color: #856404;
  }

  .download {
    color: white;
    cursor: pointer;
    background-color: #008cff;
    padding: .5em;
    border-radius: .5em;
    margin-right: .5em;
    margin: .25em;
    display: inline-block;
    line-height: 1.5em;
    text-decoration: none;
  }

  .download:hover, .download:focus {
    background-color: #30acff;
    text-decoration: none;
  }

  .download:active {
    background-color: #007cdf;
  }

  .download.has-toolbar {
    background-color: #e67e22;
  }

  .download.has-toolbar:hover,
  .download.has-toolbar:focus {
    background-color: #f39c12 !important;
  }

  .download.has-toolbar:active {
    background-color: #d35400 !important;
  }

  body.dark .download.has-toolbar:hover,
  body.dark .download.has-toolbar:focus {
    background-color: #d35400 !important;
  }

  body.dark .download.has-toolbar:active {
    background-color: #c0392b !important;
  }

  .button-line {
    margin-top: .5em;
  }

  .file-size-info {
    margin-bottom: 8px;
    font-size: 0.9em;
  }

  .file-size-loading {
    color: #888;
  }

  .file-size-text {
    color: #666;
  }

  body.dark .modal-content {
    background-color: #1a1a1a;
    color: #eee;
  }

  body.dark .file-size-loading,
  body.dark .file-size-text {
    color: #aaa;
  }

  body.dark .toolbar-warning {
    background-color: #3a3520;
    border-color: #5a5028;
    color: #d4a843;
  }
</style>
