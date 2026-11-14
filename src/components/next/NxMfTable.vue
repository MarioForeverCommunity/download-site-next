<script setup>
// Original Mario Forever version table, redesigned.
//
// Behaviour preserved from OriginalMfTable.vue: the toolbar-adware confirmation
// before opening an installer, the community-file-hub direct-link switch, and the
// distinction between installer and portable builds. Presentation changed: the
// rating becomes a five-mark meter, downloads are explicit inline actions instead
// of a modal, and the table reads as a data ledger rather than prose.
import { ref, computed, onMounted } from "vue";
import NxIcon from "./NxIcon.vue";
import { readList } from "../../util/ReadList.js";
import { toResourceDirectUrl } from "../../util/GameUtil.js";
import { getUseDirectLink } from "../../util/Language.js";

const props = defineProps({
  lan: {
    type: String,
    required: true
  }
});

const BASE_URLS = {
  zh: {
    installer: "https://file.marioforever.net/Mario Forever/Mario Forever 全版本下载/安装版/",
    portable: "https://file.marioforever.net/Mario Forever/Mario Forever 全版本下载/绿色版/",
    nsmf_installer: "https://file.marioforever.net/Mario Forever/New Super Mario Forever 下载/安装版/",
  },
  en: {
    installer: "https://file.marioforever.net/mario-forever/games/original-mf/installer/",
    portable: "https://file.marioforever.net/mario-forever/games/original-mf/portable/",
    nsmf_installer: "https://file.marioforever.net/mario-forever/games/softendo/installer/",
  },
};

const useDirectLink = getUseDirectLink();
const versions = ref([]);

const rows = computed(() => versions.value.map((version) => {
  const marks = String(version.rating || "").replace(/[^★☆]/g, "");
  const filled = marks.split("").filter((c) => c === "★").length;
  return { ...version, filled };
}));

function formatDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function urlFor(version, type) {
  const urls = BASE_URLS[props.lan] || BASE_URLS.en;
  if (type === "installer" && version.installer) {
    const base = version.nsmf ? urls.nsmf_installer : urls.installer;
    return `${base}${version.installer}`;
  }
  if (type === "portable" && version.portable) {
    return `${urls.portable}${version.portable}`;
  }
  return null;
}

function directUrl(version, type) {
  const url = urlFor(version, type);
  return useDirectLink.value ? toResourceDirectUrl(url) : url;
}

function confirmToolbar(version, event) {
  if (!version.toolbar) return;
  const message = props.lan === "zh"
    ? "该版本的安装程序包含 Mario Forever Toolbar（广告插件），请在安装过程中取消勾选“Install the Mario Forever Toolbar”选项；建议优先下载绿色版。"
    : "This installer bundles the \"Mario Forever Toolbar\" adware. Uncheck \"Install the Mario Forever Toolbar\" during setup; the portable build is recommended.";
  if (!window.confirm(message)) event.preventDefault();
}

onMounted(async () => {
  try {
    versions.value = await readList("list-original-mf.yaml");
  } catch (error) {
    console.error("Failed to load original MF versions:", error);
  }
});
</script>

<template>
  <div class="nx-mf-table">
    <div class="nx-list">
      <div class="nx-mf-row nx-mf-head">
        <span>{{ lan === "zh" ? "版本" : "VERSION" }}</span>
        <span>{{ lan === "zh" ? "发布日期" : "RELEASED" }}</span>
        <span>{{ lan === "zh" ? "推荐度" : "RATING" }}</span>
        <span class="nx-mf-actions-head">{{ lan === "zh" ? "下载" : "DOWNLOAD" }}</span>
      </div>

      <div
        v-for="version in rows"
        :key="version.ver"
        class="nx-mf-row"
      >
        <span class="nx-mf-ver">{{ version.ver }}</span>
        <span class="nx-mono nx-mf-date">{{ formatDate(version.date) }}</span>
        <span
          class="nx-mf-rating"
          :title="version.rating"
        >
          <span
            v-for="n in 5"
            :key="n"
            class="nx-mf-star"
            :class="{ on: n <= version.filled }"
          >★</span>
        </span>
        <span class="nx-mf-actions">
          <a
            v-if="urlFor(version, 'installer')"
            class="nx-dl nx-dl-sm nx-dl-installer"
            :class="{ 'is-warn': version.toolbar }"
            :href="directUrl(version, 'installer')"
            target="_blank"
            rel="noopener"
            :title="version.toolbar ? (lan === 'zh' ? '含广告插件' : 'Includes adware') : undefined"
            @click="confirmToolbar(version, $event)"
          >
            <NxIcon name="download" :size="12" />
            {{ lan === "zh" ? "安装版" : "Installer" }}
          </a>
          <a
            v-if="urlFor(version, 'portable')"
            class="nx-dl nx-dl-sm nx-dl-portable"
            :href="directUrl(version, 'portable')"
            target="_blank"
            rel="noopener"
          >
            <NxIcon name="download" :size="12" />
            {{ lan === "zh" ? "绿色版" : "Portable" }}
          </a>
        </span>
      </div>
    </div>

    <p class="nx-mf-note">
      <NxIcon name="warning" :size="13" />
      <span>{{ lan === "zh"
        ? "标为「含广告插件」的安装版会捆绑 Mario Forever Toolbar，安装时请取消勾选，或改用绿色版。"
        : "Installers marked with adware bundle the Mario Forever Toolbar. Uncheck it during setup, or use the portable build." }}</span>
    </p>
  </div>
</template>

<style scoped>
  .nx-mf-table {
    /* breathing room between the preceding paragraph and the version ledger */
    margin-top: 20px;
  }

  .nx-mf-row {
    display: grid;
    grid-template-columns: 116px 100px 76px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    padding: 7px 14px;
    border-bottom: 1px solid var(--nx-line-soft);
    font-size: 13px;
  }

  .nx-mf-row:last-child {
    border-bottom: 0;
  }

  .nx-mf-head {
    background: var(--nx-panel-2);
    border-bottom: 1px solid var(--nx-line);
    font-family: var(--nx-mono);
    font-size: 10.5px;
    letter-spacing: 0.05em;
    color: var(--nx-muted);
  }

  .nx-mf-actions-head {
    text-align: left;
  }

  .nx-mf-ver {
    font-family: var(--nx-mono);
    font-size: 12.5px;
    font-weight: 500;
    color: var(--nx-ink);
  }

  .nx-mf-date {
    color: var(--nx-muted);
  }

  .nx-mf-rating {
    display: inline-flex;
    gap: 1px;
    font-size: 10.5px;
    line-height: 1;
    color: var(--nx-line);
  }

  .nx-mf-star.on {
    color: #a9781a;
  }

  :root[data-nx-theme="dark"] .nx-mf-star.on {
    color: #d9a94a;
  }

  .nx-mf-actions {
    display: flex;
    gap: 5px;
    justify-content: flex-start;
    /* the buttons must not be squeezed by the grid row's line box, which was
       clipping their bottom border */
    align-items: center;
    min-height: 24px;
  }

  .nx-dl-sm {
    /* min-height rather than height: a fixed height inside a grid row with a
       taller line box let the bottom border be cut off */
    height: auto;
    min-height: 24px;
    padding: 0 7px;
    font-size: 11.5px;
    line-height: 22px;
    flex: none;
  }

  .nx-dl.is-warn {
    border-color: color-mix(in srgb, var(--nx-warn) 45%, var(--nx-line));
    color: var(--nx-warn);
  }

  /* A plain installer is blue, a portable build green: on a dense ledger the
     colour is the quickest way to tell the two apart. An installer that bundles
     the toolbar keeps its warning colour, so that case is excluded. */
  .nx-dl-installer:not(.is-warn) {
    border-color: color-mix(in srgb, #1f6fd0 42%, var(--nx-line));
    color: #1f6fd0;
  }

  .nx-dl-installer:not(.is-warn):hover {
    border-color: #1f6fd0;
    color: #17539b;
  }

  .nx-dl-portable {
    border-color: color-mix(in srgb, #00a83c 42%, var(--nx-line));
    color: #007a2b;
  }

  .nx-dl-portable:hover {
    border-color: #00a83c;
    color: #005e21;
  }

  :root[data-nx-theme="dark"] .nx-dl-installer:not(.is-warn) {
    border-color: color-mix(in srgb, #7cb0ea 45%, var(--nx-line));
    color: #7cb0ea;
  }

  :root[data-nx-theme="dark"] .nx-dl-portable {
    border-color: color-mix(in srgb, #63c295 45%, var(--nx-line));
    color: #63c295;
  }

  .nx-mf-note {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 9px;
    font-size: 11.5px;
    color: var(--nx-muted);
    line-height: 1.5;
  }

  @media (max-width: 720px) {
    .nx-mf-row {
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas:
        "ver actions"
        "date actions"
        "rating actions";
      gap: 2px 10px;
      padding: 9px 12px;
    }

    .nx-mf-head {
      display: none;
    }

    .nx-mf-ver {
      grid-area: ver;
    }

    .nx-mf-date {
      grid-area: date;
    }

    .nx-mf-rating {
      grid-area: rating;
    }

    .nx-mf-actions {
      grid-area: actions;
      flex-direction: column;
    }
  }
</style>
