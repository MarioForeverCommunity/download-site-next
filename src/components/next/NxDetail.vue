<script setup>
// Record detail drawer.
//
// Replaces the legacy full-screen modal. A drawer keeps the catalog visible
// behind it, so a visitor can compare "this one vs the next one" without losing
// their place; it also makes the URL-backed deep link (?game=slug) cheap to keep.
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import NxIcon from "./NxIcon.vue";
import { formatIsoDate, softwareLabel } from "../../util/next/records.js";
import { getTagColor } from "../../util/TagUtil.js";

const props = defineProps({
  record: {
    type: Object,
    default: null
  },
  lan: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["close"]);

const lightbox = ref(null);
const activeVersion = ref(null);

const isOpen = computed(() => props.record != null);

const theme = ref(document.documentElement.dataset.nxTheme || "light");

watch(() => props.record, (next) => {
  const versions = next && next.versions ? next.versions : [];
  const current = versions.find((v) => v.current) || versions[0] || null;
  activeVersion.value = current ? current.verKey : null;
  lightbox.value = null;
  if (next) {
    // Keep the drawer's own scroll at the top when switching records.
    requestAnimationFrame(() => {
      const body = document.querySelector(".nx-drawer-body");
      if (body) body.scrollTop = 0;
    });
  }
}, { immediate: true });

const version = computed(() => {
  const versions = props.record && props.record.versions ? props.record.versions : [];
  if (versions.length === 0) return null;
  return versions.find((v) => v.verKey === activeVersion.value) || versions[0];
});

const tagColors = computed(() => (props.record ? props.record.tags.map((tag) => ({
  ...tag,
  colors: getTagColor(tag.key, theme.value === "dark"),
})) : []));

const facts = computed(() => {
  const record = props.record;
  if (!record) return [];
  const rows = [];
  const zh = props.lan === "zh";

  if (record.kind === "softendo") {
    rows.push({ label: zh ? "系列" : "Series", value: record.raw && record.raw.type });
    rows.push({ label: zh ? "制作软件" : "Made with", value: Array.isArray(record.software) ? record.software.join(", ") : record.software });
    if (record.languageLabel) rows.push({ label: zh ? "语言" : "Language", value: record.languageLabel });
    rows.push({ label: zh ? "年份" : "Years", value: record.yearLabel });
    return rows;
  }

  if (record.kind === "asset") {
    rows.push({ label: zh ? "作者" : "Author", value: record.author });
    rows.push({ label: zh ? "类型" : "Type", value: record.assetType });
    if (version.value && version.value.label) rows.push({ label: zh ? "变体" : "Variant", value: version.value.label });
    if (record.date) rows.push({ label: zh ? "日期" : "Date", value: formatIsoDate(record.date) });
    return rows;
  }

  rows.push({ label: zh ? "作者" : "Author", value: record.author });
  if (record.kind === "mf") {
    rows.push({ label: zh ? "地区" : "Region", value: record.region === "chinese" ? (zh ? "国内" : "Chinese") : record.region === "international" ? (zh ? "国外" : "International") : "—" });
  }
  if (record.kind === "mw" && record.versionLabel) {
    rows.push({ label: "MW", value: record.versionLabel });
  }
  if (record.software) {
    rows.push({ label: zh ? "制作软件" : "Made with", value: softwareLabel(record.software, props.lan) });
  }
  if (record.platform) {
    rows.push({ label: zh ? "平台" : "Platform", value: record.platform });
  }
  if (record.date) rows.push({ label: zh ? "发布日期" : "Released", value: formatIsoDate(record.date) });
  return rows;
});

const hasDownloads = computed(() => {
  const v = version.value;
  if (!v) return false;
  return (v.downloads && v.downloads.length) || (v.dataDownloads && v.dataDownloads.length);
});

function copyCode(event, code) {
  if (!code) return;
  navigator.clipboard.writeText(code).then(() => {
    const el = event.currentTarget;
    el.dataset.copied = "1";
    setTimeout(() => { delete el.dataset.copied; }, 1600);
  });
}

function onKeydown(event) {
  if (event.key === "Escape") {
    if (lightbox.value) {
      lightbox.value = null;
      return;
    }
    emit("close");
  }
}

watch(isOpen, (open) => {
  document.body.classList.toggle("nx-locked", open);
});

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.classList.remove("nx-locked");
});
</script>

<template>
  <Teleport to="body">
    <Transition name="nx-fade">
      <button
        v-if="isOpen"
        class="nx-scrim"
        type="button"
        :aria-label="lan === 'zh' ? '关闭详情' : 'Close details'"
        @click="emit('close')"
      />
    </Transition>
    <Transition name="nx-slide">
      <aside
        v-if="isOpen"
        class="nx-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="record.name"
      >
        <div class="nx-drawer-head">
          <div style="min-width: 0; flex: 1;">
            <div
              v-if="record.kind === 'asset' && record.assetType"
              class="nx-label"
              style="margin-bottom: 4px;"
            >{{ record.assetType }}</div>
            <h2 class="nx-drawer-title">{{ record.name }}</h2>
            <div class="nx-drawer-sub">
              <span>{{ record.author }}</span>
              <template v-if="record.date">
                <span class="nx-sep">·</span>
                <span class="nx-mono">{{ formatIsoDate(record.date) }}</span>
              </template>
              <template v-if="record.kind === 'softendo' && record.yearLabel">
                <span class="nx-sep">·</span>
                <span class="nx-mono">{{ record.yearLabel }}</span>
              </template>
            </div>
          </div>
          <button
            class="nx-close"
            type="button"
            :aria-label="lan === 'zh' ? '关闭' : 'Close'"
            @click="emit('close')"
          >
            <NxIcon name="close" :size="15" />
          </button>
        </div>

        <div class="nx-drawer-body">
          <!-- screenshots -->
          <div
            v-if="record.images && record.images.length"
            class="nx-section"
          >
            <div class="nx-section-label">{{ lan === "zh" ? "截图" : "SCREENSHOTS" }}</div>
            <div
              class="nx-shots"
              :class="{ 'is-single': record.images.length === 1 }"
            >
              <button
                v-for="(img, index) in record.images.slice(0, 6)"
                :key="img"
                type="button"
                @click="lightbox = img"
              >
                <img
                  :src="img"
                  :alt="`${record.name} ${index + 1}`"
                  loading="lazy"
                />
              </button>
            </div>
          </div>

          <!-- description -->
          <div
            v-if="record.description"
            class="nx-section"
          >
            <div class="nx-section-label">{{ lan === "zh" ? "简介" : "ABOUT" }}</div>
            <p class="nx-drawer-desc">{{ record.description }}</p>
          </div>

          <!-- facts -->
          <div
            v-if="facts.length"
            class="nx-section"
          >
            <div class="nx-section-label">{{ lan === "zh" ? "信息" : "DETAILS" }}</div>
            <dl class="nx-facts">
              <template v-for="fact in facts" :key="fact.label">
                <dt>{{ fact.label }}</dt>
                <dd>{{ fact.value || "—" }}</dd>
              </template>
            </dl>
          </div>

          <!-- tags -->
          <div
            v-if="tagColors.length"
            class="nx-section"
          >
            <div class="nx-section-label">{{ lan === "zh" ? "标签" : "TAGS" }}</div>
            <div class="nx-drawer-tags">
              <span
                v-for="tag in tagColors"
                :key="tag.key"
                class="nx-tag"
                :style="{ color: tag.colors.text, borderColor: tag.colors.border, background: tag.colors.bg }"
              >{{ tag.label }}</span>
            </div>
          </div>

          <!-- versions + downloads -->
          <div
            v-if="record.versions && record.versions.length"
            class="nx-section"
          >
            <div class="nx-section-label">
              {{ lan === "zh" ? "版本与下载" : "VERSIONS & DOWNLOADS" }}
            </div>

            <div
              v-if="record.versions.length > 1"
              class="nx-version-picker"
            >
              <button
                v-for="v in record.versions"
                :key="v.verKey"
                type="button"
                class="nx-pick"
                :class="{ on: v.verKey === activeVersion }"
                @click="activeVersion = v.verKey"
              >
                {{ v.label || v.verKey }}
                <span
                  v-if="v.current"
                  class="nx-pick-cur"
                >{{ lan === "zh" ? "最新" : "latest" }}</span>
              </button>
            </div>

            <div
              v-if="version"
              class="nx-versions"
            >
              <div class="nx-version">
                <div style="min-width: 0;">
                  <div class="nx-version-name">
                    <span>{{ version.label || "—" }}</span>
                    <span
                      v-if="version.repacker"
                      class="nx-dot nx-dot-warn"
                    >{{ lan === "zh" ? "重打包" : "REPACK" }}</span>
                    <span
                      v-if="version.platform"
                      class="nx-dot nx-dot-plain"
                    >{{ version.platform }}</span>
                  </div>
                  <div class="nx-version-meta">
                    <span v-if="version.date">{{ formatIsoDate(version.date) }}</span>
                    <span
                      v-if="version.file"
                      style="display:block; overflow-wrap:anywhere;"
                    >{{ version.file }}</span>
                  </div>
                </div>
              </div>

              <div
                v-if="hasDownloads"
                class="nx-dl-block"
              >
                <div class="nx-dl-row">
                  <a
                    v-for="item in version.downloads"
                    :key="item.url + item.label"
                    class="nx-dl"
                    :class="{ 'is-primary': item.primary, 'is-dead': item.dead }"
                    :href="item.dead ? undefined : item.url"
                    :aria-disabled="item.dead ? 'true' : undefined"
                    target="_blank"
                    rel="noopener"
                  >
                    <NxIcon name="download" :size="13" />
                    {{ item.label }}
                  </a>
                </div>
                <div
                  v-for="item in version.downloads.filter((d) => d.code)"
                  :key="'code-' + item.url"
                  class="nx-dl-code-row"
                >
                  <span class="nx-dl-code-label">{{ lan === "zh" ? "提取码" : "Code" }}</span>
                  <button
                    type="button"
                    class="nx-code"
                    :title="lan === 'zh' ? '复制提取码' : 'Copy code'"
                    @click="copyCode($event, item.code)"
                  >
                    {{ item.code }}
                    <NxIcon name="copy" :size="11" />
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="version && version.dataDownloads && version.dataDownloads.length"
              style="margin-top: 12px;"
            >
              <div class="nx-section-label">{{ lan === "zh" ? "数据包" : "DATA PACKAGE" }}</div>
              <div class="nx-dl-row">
                <a
                  v-for="item in version.dataDownloads"
                  :key="'data-' + item.url"
                  class="nx-dl"
                  :href="item.url"
                  target="_blank"
                  rel="noopener"
                >
                  <NxIcon name="download" :size="13" />
                  {{ item.label }}
                </a>
              </div>
              <div
                v-for="item in version.dataDownloads.filter((d) => d.code)"
                :key="'datacode-' + item.url"
                class="nx-dl-code-row"
              >
                <span class="nx-dl-code-label">{{ lan === "zh" ? "提取码" : "Code" }}</span>
                <button
                  type="button"
                  class="nx-code"
                  @click="copyCode($event, item.code)"
                >
                  {{ item.code }}
                  <NxIcon name="copy" :size="11" />
                </button>
              </div>
            </div>
          </div>

          <!-- MW editor note -->
          <div
            v-if="record.kind === 'mw' && record.smwpVersion"
            class="nx-section"
          >
            <div class="nx-section-label">{{ lan === "zh" ? "运行环境" : "RUNTIME" }}</div>
            <p class="nx-drawer-desc">
              {{ lan === "zh" ? "本作品需要 " : "Requires " }}{{ record.smwpVersion }}
              <template v-if="record.smwpUrl">
                — <a :href="record.smwpUrl" target="_blank" rel="noopener">{{ lan === "zh" ? "下载该版本" : "download it" }}</a>
              </template>
              <template v-if="record.hasBgm">
                <br />{{ lan === "zh" ? "需替换或使用自定义 BGM。" : "Needs replaced or custom BGM." }}
              </template>
            </p>
            <div
              v-if="record.smwpDataUrl"
              class="nx-dl-row"
              style="margin-top: 8px;"
            >
              <a
                class="nx-dl"
                :href="record.smwpDataUrl"
                target="_blank"
                rel="noopener"
              >
                <NxIcon name="download" :size="13" />
                {{ lan === "zh" ? "音乐包" : "Music pack" }}
              </a>
            </div>
          </div>

          <!-- links -->
          <div
            v-if="record.links && (record.links.source || record.links.home || record.links.repo || record.links.wiki)"
            class="nx-section"
          >
            <div class="nx-section-label">{{ lan === "zh" ? "相关链接" : "LINKS" }}</div>
            <div class="nx-dl-row">
              <a
                v-if="record.links.source"
                class="nx-dl"
                :href="record.links.source"
                target="_blank"
                rel="noopener"
              >
                <NxIcon name="link" :size="13" />
                {{ lan === "zh" ? "发布页" : "Source post" }}
              </a>
              <a
                v-if="record.links.home"
                class="nx-dl"
                :href="record.links.home"
                target="_blank"
                rel="noopener"
              >
                <NxIcon name="home" :size="13" />
                {{ lan === "zh" ? "主页" : "Homepage" }}
              </a>
              <a
                v-if="record.links.repo"
                class="nx-dl"
                :href="record.links.repo"
                target="_blank"
                rel="noopener"
              >
                <NxIcon name="github" :size="13" />
                {{ lan === "zh" ? "源代码" : "Repository" }}
              </a>
              <a
                v-if="record.links.wiki"
                class="nx-dl"
                :href="record.links.wiki"
                target="_blank"
                rel="noopener"
              >
                <NxIcon name="wiki" :size="13" />
                Wiki
              </a>
            </div>
          </div>

          <div
            v-if="record.links.video && record.links.video.length"
            class="nx-section"
          >
            <div class="nx-section-label">{{ lan === "zh" ? "相关视频" : "VIDEOS" }}</div>
            <ul class="nx-video-list">
              <li
                v-for="video in record.links.video"
                :key="video.url"
              >
                <a
                  :href="video.url"
                  target="_blank"
                  rel="noopener"
                >
                  <NxIcon name="video" :size="13" />
                  <span>{{ video.title }}</span>
                </a>
                <span class="nx-meta">{{ video.site }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="nx-drawer-foot">
          <span class="nx-meta">
            {{ lan === "zh" ? "按 Esc 关闭" : "Press Esc to close" }}
          </span>
        </div>
      </aside>
    </Transition>

    <Transition name="nx-fade">
      <div
        v-if="lightbox"
        class="nx-lightbox"
        @click="lightbox = null"
      >
        <img
          :src="lightbox"
          alt=""
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .nx-drawer-sub {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 12.5px;
    color: var(--nx-muted);
    margin-top: 4px;
  }

  .nx-sep {
    color: var(--nx-faint);
  }

  .nx-drawer-desc {
    font-size: 13.5px;
    line-height: 1.62;
    color: var(--nx-ink-2);
    white-space: pre-wrap;
  }

  .nx-drawer-desc a {
    color: var(--nx-ink);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .nx-drawer-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .nx-version-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 9px;
  }

  .nx-pick {
    border: 1px solid var(--nx-line);
    background: var(--nx-panel);
    border-radius: 3px;
    padding: 4px 8px;
    font-family: var(--nx-mono);
    font-size: 11.5px;
    color: var(--nx-ink-2);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .nx-pick:hover {
    border-color: var(--nx-ink-2);
  }

  .nx-pick.on {
    background: var(--nx-ink);
    border-color: var(--nx-ink);
    color: #fff;
  }

  .nx-pick-cur {
    font-size: 9px;
    letter-spacing: 0.04em;
    opacity: 0.72;
  }

  .nx-dl-block {
    padding: 10px 11px;
    border-top: 1px solid var(--nx-line-soft);
  }

  .nx-dl-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .nx-code[data-copied="1"] {
    background: var(--nx-cur);
    border-color: var(--nx-cur);
    color: #fff;
  }

  .nx-dl-code-row {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 7px;
  }

  .nx-dl-code-label {
    font-family: var(--nx-mono);
    font-size: 10.5px;
    color: var(--nx-muted);
  }

  .nx-video-list {
    list-style: none;
    display: grid;
    gap: 6px;
  }

  .nx-video-list li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }

  .nx-video-list a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--nx-ink);
    text-decoration: underline;
    text-decoration-color: var(--nx-line);
    text-underline-offset: 2px;
  }

  .nx-video-list a:hover {
    color: var(--nx-accent);
  }

  .nx-drawer-foot {
    flex: none;
    border-top: 1px solid var(--nx-line);
    padding: 8px 20px;
    background: var(--nx-panel-2);
  }
</style>
