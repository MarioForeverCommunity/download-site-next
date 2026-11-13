<script setup>
// Record detail drawer.
//
// Keeps the catalog visible behind it so records can be compared without losing
// place, and keeps the deep link cheap to maintain. The gallery restores what the
// first iteration dropped: the title image plus the full showcase slider, with
// pagination rendered in normal flow beneath the track instead of overlapping it.
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import MarkdownIt from "markdown-it";
import { Carousel, Slide, Navigation } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";
import NxIcon from "./NxIcon.vue";
import { formatIsoDate, softwareLabel } from "../../util/next/records.js";
import { getTagColor } from "../../util/TagUtil.js";
import { getDescriptionSync } from "../../util/ImageUtil.js";

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
const slideIndex = ref(0);
// The legacy full-screen modal rendered a per-record description file
// (description.md / .txt from the data folder) on top of the YAML blurb. The
// drawer restores it: without it, records whose write-up lives in a file showed
// only a one-line summary.
const md = new MarkdownIt({ breaks: true, linkify: true, html: false });
const longDescription = ref("");
const longDescriptionHtml = computed(() => (longDescription.value ? md.render(longDescription.value) : ""));

async function loadLongDescription() {
  longDescription.value = "";
  const record = props.record;
  if (!record || !record.raw) return;
  const category = record.kind === "mw" ? "mw-levels" : "mf-games";
  if (record.kind !== "mf" && record.kind !== "mw") return;

  const url = getDescriptionSync(record.raw, category, props.lan);
  if (!url) return;

  try {
    const response = await axios.get(url);
    const body = typeof response.data === "string" ? response.data : "";
    if (body && !body.trim().startsWith("<!DOCTYPE html>")) {
      longDescription.value = body;
    }
  } catch (_e) {
    longDescription.value = "";
  }
}

watch(() => props.record, () => {
  loadLongDescription();
}, { immediate: true });

// ── version picker ─────────────────────────────────────────
const theme = ref(document.documentElement.dataset.nxTheme || "light");

const isOpen = computed(() => props.record != null);

const text = computed(() => (props.lan === "zh"
  ? {
    screenshots: "截图",
    about: "简介",
    details: "信息",
    tags: "标签",
    versions: "版本与下载",
    data: "数据包",
    runtime: "运行环境",
    links: "相关链接",
    videos: "相关视频",
    author: "作者",
    region: "地区",
    madeWith: "制作软件",
    platform: "平台",
    released: "发布日期",
    type: "类型",
    series: "系列",
    language: "语言",
    years: "年份",
    variant: "变体",
    date: "日期",
    mw: "MW 版本",
    chinese: "国内",
    international: "国外",
    latest: "最新",
    repack: "重打包",
    code: "提取码",
    copy: "点击复制",
    requires: "本作品需要",
    downloadIt: "下载该版本",
    bgmNote: "需替换或使用自定义 BGM。",
    musicPack: "音乐包",
    source: "发布页",
    homepage: "主页",
    repo: "源代码",
    download: "下载",
    esc: "按 Esc 关闭",
  }
  : {
    screenshots: "Screenshots",
    about: "About",
    details: "Details",
    tags: "Tags",
    versions: "Versions & downloads",
    data: "Data package",
    runtime: "Runtime",
    links: "Links",
    videos: "Videos",
    author: "Author",
    region: "Region",
    madeWith: "Made with",
    platform: "Platform",
    released: "Released",
    type: "Type",
    series: "Series",
    language: "Language",
    years: "Years",
    variant: "Variant",
    date: "Date",
    mw: "MW version",
    chinese: "Chinese",
    international: "International",
    latest: "latest",
    repack: "REPACK",
    code: "Code",
    copy: "Click to copy",
    requires: "Requires",
    downloadIt: "download it",
    bgmNote: "Needs replaced or custom BGM.",
    musicPack: "Music pack",
    source: "Source post",
    homepage: "Homepage",
    repo: "Repository",
    download: "Download",
    esc: "Press Esc to close",
  }));

watch(() => props.record, (next) => {
  const versions = next && next.versions ? next.versions : [];
  const current = versions.find((v) => v.latest) || versions[0] || null;
  activeVersion.value = current ? current.verKey : null;
  lightbox.value = null;
  slideIndex.value = 0;
  if (next) {
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

// Gallery = title image first, then every showcase shot. The adapter already
// de-duplicates, so no further filtering is needed here.
const gallery = computed(() => (props.record && props.record.images ? props.record.images : []));

const tagColors = computed(() => (props.record ? props.record.tags.map((tag) => ({
  ...tag,
  colors: getTagColor(tag.key, theme.value === "dark"),
})) : []));

const facts = computed(() => {
  const record = props.record;
  if (!record) return [];
  const t = text.value;
  const rows = [];

  if (record.kind === "softendo") {
    rows.push({ label: t.series, value: record.raw && record.raw.type });
    rows.push({ label: t.madeWith, value: Array.isArray(record.software) ? record.software.join(", ") : softwareLabel(record.software, props.lan) });
    if (record.languageLabel) rows.push({ label: t.language, value: record.languageLabel });
    rows.push({ label: t.years, value: record.yearLabel });
    return rows;
  }

  if (record.kind === "asset") {
    rows.push({ label: t.author, value: record.author });
    rows.push({ label: t.type, value: record.assetTypeLabel });
    if (version.value && version.value.label) rows.push({ label: t.variant, value: version.value.label });
    if (record.date) rows.push({ label: t.date, value: formatIsoDate(record.date) });
    return rows;
  }

  rows.push({ label: t.author, value: record.author });
  if (record.kind === "mf") {
    const region = record.region === "chinese" ? t.chinese
      : record.region === "international" ? t.international : "—";
    rows.push({ label: t.region, value: region });
  }
  if (record.kind === "mw" && record.versionLabel) {
    rows.push({ label: t.mw, value: record.versionLabel });
  }
  if (record.software) {
    rows.push({ label: t.madeWith, value: softwareLabel(record.software, props.lan) });
  }
  if (record.platform) {
    rows.push({ label: t.platform, value: record.platform });
  }
  if (record.date) rows.push({ label: t.released, value: formatIsoDate(record.date) });
  return rows;
});

const hasDownloads = computed(() => {
  const v = version.value;
  if (!v) return false;
  return (v.downloads && v.downloads.length) || (v.dataDownloads && v.dataDownloads.length);
});

const hasLinks = computed(() => {
  const links = props.record && props.record.links;
  if (!links) return false;
  return !!(links.source || links.home || links.repo || links.wiki);
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

// The carousel keeps its own index; mirror it so the custom dots stay in sync.
function onSlideUpdate(index) {
  slideIndex.value = index;
}

function goTo(index) {
  slideIndex.value = index;
}

const carouselRef = ref(null);

function prevSlide() {
  if (carouselRef.value) carouselRef.value.prev();
}

function nextSlide() {
  if (carouselRef.value) carouselRef.value.next();
}

watch(isOpen, (open) => {
  document.body.classList.toggle("nx-locked", open);
});

// Theme changes must recolour the tag chips while the drawer is open.
let themeObserver = null;

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  theme.value = document.documentElement.dataset.nxTheme || "light";
  themeObserver = new MutationObserver(() => {
    theme.value = document.documentElement.dataset.nxTheme || "light";
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-nx-theme"] });
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.classList.remove("nx-locked");
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="nx-fade">
      <button
        v-if="isOpen"
        class="nx-scrim"
        type="button"
        :aria-label="text.esc"
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
              v-if="record.kind === 'asset' && record.assetTypeLabel"
              class="nx-section-label"
              style="margin-bottom: 3px;"
            >{{ record.assetTypeLabel }}</div>
            <h2 class="nx-drawer-title">{{ record.name }}</h2>
            <div class="nx-drawer-sub">
              <span>{{ record.author }}</span>
              <template v-if="record.date">
                <span>·</span>
                <span class="nx-num">{{ formatIsoDate(record.date) }}</span>
              </template>
              <template v-if="record.kind === 'softendo' && record.yearLabel">
                <span>·</span>
                <span class="nx-num">{{ record.yearLabel }}</span>
              </template>
            </div>
          </div>
          <button
            class="nx-close"
            type="button"
            :aria-label="text.esc"
            @click="emit('close')"
          >
            <NxIcon
              name="close"
              :size="15"
            />
          </button>
        </div>

        <div class="nx-drawer-body">
          <!-- gallery: title image + showcase slider, pagination below -->
          <div
            v-if="gallery.length"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.screenshots }}</div>

            <div
              v-if="gallery.length === 1"
              class="nx-shots is-single"
            >
              <button
                type="button"
                @click="lightbox = gallery[0]"
              >
                <img
                  :src="gallery[0]"
                  :alt="record.name"
                  loading="lazy"
                />
              </button>
            </div>

            <template v-else>
              <div class="nx-carousel">
                <Carousel
                  ref="carouselRef"
                  :items-to-show="1"
                  :wrap-around="true"
                  :mouse-drag="false"
                  :model-value="slideIndex"
                  @update:model-value="onSlideUpdate"
                >
                  <Slide
                    v-for="(img, index) in gallery"
                    :key="img + index"
                  >
                    <button
                      type="button"
                      style="display:block;width:100%;height:100%;padding:0;border:0;background:none;cursor:zoom-in;aspect-ratio:16/9;"
                      @click="lightbox = img"
                    >
                      <img
                        :src="img"
                        :alt="`${record.name} ${index + 1}`"
                        loading="lazy"
                        style="width:100%;height:100%;object-fit:contain;background:var(--nx-fill);"
                      />
                    </button>
                  </Slide>
                  <template #addons>
                    <Navigation />
                  </template>
                </Carousel>
              </div>

              <!-- pagination in normal flow: cannot overlap the slides -->
              <div class="nx-carousel-nav">
                <div class="nx-carousel-dots">
                  <button
                    v-for="(img, index) in gallery"
                    :key="`dot-${img}-${index}`"
                    type="button"
                    class="nx-carousel-dot"
                    :class="{ on: index === slideIndex }"
                    :aria-label="`${index + 1}`"
                    @click="goTo(index)"
                  />
                </div>
                <span class="nx-num" style="font-size:10.5px;color:var(--nx-faint);">
                  {{ slideIndex + 1 }} / {{ gallery.length }}
                </span>
                <div class="nx-carousel-arrows">
                  <button
                    type="button"
                    :aria-label="lan === 'zh' ? '上一张' : 'Previous'"
                    @click="prevSlide"
                  >
                    <NxIcon
                      name="chevronLeft"
                      :size="13"
                    />
                  </button>
                  <button
                    type="button"
                    :aria-label="lan === 'zh' ? '下一张' : 'Next'"
                    @click="nextSlide"
                  >
                    <NxIcon
                      name="chevronRight"
                      :size="13"
                    />
                  </button>
                </div>
              </div>
            </template>
          </div>

          <!-- description: the YAML blurb, then the full write-up from the
               record's description file (md/txt) when one exists -->
          <div
            v-if="record.description || longDescriptionHtml"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.about }}</div>
            <p
              v-if="record.description"
              style="font-size:12.5px;line-height:1.65;color:var(--nx-ink-2);white-space:pre-wrap;"
            >
              {{ record.description }}
            </p>
            <div
              v-if="longDescriptionHtml"
              class="nx-detail-md"
              v-html="longDescriptionHtml"
            />
          </div>

          <!-- facts -->
          <div
            v-if="facts.length"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.details }}</div>
            <dl class="nx-facts">
              <template
                v-for="fact in facts"
                :key="fact.label"
              >
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
            <div class="nx-section-label">{{ text.tags }}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              <span
                v-for="tag in tagColors"
                :key="tag.key"
                class="nx-tag"
                :style="{ color: tag.colors.text, borderColor: tag.colors.border, background: tag.colors.bg }"
              >{{ tag.label }}</span>
            </div>
          </div>

          <!-- versions & downloads -->
          <div
            v-if="record.versions && record.versions.length"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.versions }}</div>

            <div
              v-if="record.versions.length > 1"
              class="nx-picker"
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
                  v-if="v.latest"
                  class="nx-pick-cur"
                >{{ text.latest }}</span>
              </button>
            </div>

            <div
              v-if="version"
              class="nx-versions"
            >
              <div class="nx-version">
                <div class="nx-version-name">
                  <span>{{ version.label || "—" }}</span>
                  <span
                    v-if="version.repacker"
                    class="nx-dot nx-dot-warn"
                  >{{ text.repack }}</span>
                  <span
                    v-if="version.platform"
                    class="nx-dot nx-dot-plain"
                  >{{ version.platform }}</span>
                </div>
                <div class="nx-version-meta">
                  <span v-if="version.date">{{ formatIsoDate(version.date) }}</span>
                  <span
                    v-if="version.file"
                    style="display:block;"
                  >{{ version.file }}</span>
                </div>

                <div
                  v-if="hasDownloads"
                  class="nx-dl-row"
                >
                  <a
                    v-for="item in version.downloads"
                    :key="item.url + item.label"
                    class="nx-dl"
                    :class="{ 'is-primary': item.primary, 'is-dead': item.dead, 'is-warn': item.toolbar }"
                    :href="item.dead ? undefined : item.url"
                    :aria-disabled="item.dead ? 'true' : undefined"
                    target="_blank"
                    rel="noopener"
                  >
                    <NxIcon
                      name="download"
                      :size="12"
                    />
                    {{ item.label }}
                  </a>
                </div>

                <div
                  v-for="item in (version.downloads || []).filter((d) => d.code)"
                  :key="`code-${item.url}`"
                  class="nx-code-row"
                >
                  <span class="nx-code-label">{{ text.code }}</span>
                  <button
                    type="button"
                    class="nx-code"
                    :title="text.copy"
                    @click="copyCode($event, item.code)"
                  >
                    {{ item.code }}
                    <NxIcon
                      name="copy"
                      :size="10"
                    />
                  </button>
                </div>
              </div>
            </div>

            <template
              v-if="version && version.dataDownloads && version.dataDownloads.length"
            >
              <div
                class="nx-section-label"
                style="margin-top: 12px;"
              >{{ text.data }}</div>
              <div class="nx-dl-row" style="margin-top: 0;">
                <a
                  v-for="item in version.dataDownloads"
                  :key="`data-${item.url}`"
                  class="nx-dl"
                  :href="item.url"
                  target="_blank"
                  rel="noopener"
                >
                  <NxIcon
                    name="download"
                    :size="12"
                  />
                  {{ item.label }}
                </a>
              </div>
              <div
                v-for="item in version.dataDownloads.filter((d) => d.code)"
                :key="`datacode-${item.url}`"
                class="nx-code-row"
              >
                <span class="nx-code-label">{{ text.code }}</span>
                <button
                  type="button"
                  class="nx-code"
                  :title="text.copy"
                  @click="copyCode($event, item.code)"
                >
                  {{ item.code }}
                  <NxIcon
                    name="copy"
                    :size="10"
                  />
                </button>
              </div>
            </template>
          </div>

          <!-- MW runtime note -->
          <div
            v-if="record.kind === 'mw' && record.smwpVersion"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.runtime }}</div>
            <p style="font-size:12.5px;line-height:1.6;color:var(--nx-ink-2);">
              {{ text.requires }} {{ record.smwpVersion }}
              <template v-if="record.smwpUrl">
                — <a
                  :href="record.smwpUrl"
                  target="_blank"
                  rel="noopener"
                  style="color:var(--nx-accent);"
                >{{ text.downloadIt }}</a>
              </template>
              <template v-if="record.hasBgm">
                <br>{{ text.bgmNote }}
              </template>
            </p>
            <div
              v-if="record.smwpDataUrl"
              class="nx-dl-row"
            >
              <a
                class="nx-dl"
                :href="record.smwpDataUrl"
                target="_blank"
                rel="noopener"
              >
                <NxIcon
                  name="download"
                  :size="12"
                />
                {{ text.musicPack }}
              </a>
            </div>
          </div>

          <!-- links -->
          <div
            v-if="hasLinks"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.links }}</div>
            <div class="nx-dl-row" style="margin-top:0;">
              <a
                v-if="record.links.source"
                class="nx-dl"
                :href="record.links.source"
                target="_blank"
                rel="noopener"
              >
                <NxIcon
                  name="link"
                  :size="12"
                />
                {{ text.source }}
              </a>
              <a
                v-if="record.links.home"
                class="nx-dl"
                :href="record.links.home"
                target="_blank"
                rel="noopener"
              >
                <NxIcon
                  name="home"
                  :size="12"
                />
                {{ text.homepage }}
              </a>
              <a
                v-if="record.links.repo"
                class="nx-dl"
                :href="record.links.repo"
                target="_blank"
                rel="noopener"
              >
                <NxIcon
                  name="github"
                  :size="12"
                />
                {{ text.repo }}
              </a>
              <a
                v-if="record.links.wiki"
                class="nx-dl"
                :href="record.links.wiki"
                target="_blank"
                rel="noopener"
              >
                <NxIcon
                  name="info"
                  :size="12"
                />
                Wiki
              </a>
            </div>
          </div>

          <!-- videos -->
          <div
            v-if="record.links && record.links.video && record.links.video.length"
            class="nx-section"
          >
            <div class="nx-section-label">{{ text.videos }}</div>
            <ul style="display:grid;gap:5px;">
              <li
                v-for="video in record.links.video"
                :key="video.url"
                style="display:flex;align-items:center;gap:7px;font-size:12px;"
              >
                <NxIcon
                  name="video"
                  :size="12"
                />
                <a
                  :href="video.url"
                  target="_blank"
                  rel="noopener"
                  style="color:var(--nx-accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
                >{{ video.title }}</a>
                <span style="color:var(--nx-faint);font-size:10.5px;">{{ video.site }}</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </Transition>

    <Transition name="nx-fade">
      <button
        v-if="lightbox"
        class="nx-lightbox"
        type="button"
        @click="lightbox = null"
      >
        <img
          :src="lightbox"
          alt=""
        />
      </button>
    </Transition>
  </Teleport>
</template>
