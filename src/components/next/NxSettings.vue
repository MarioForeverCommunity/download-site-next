<script setup>
// Global settings as a side drawer.
//
// A drawer (rather than the small popover it used to be) because these are real
// preferences, not menu commands: default sort, the File Hub direct-link switch,
// and the hand-off to the legacy design. Mirrors the legacy Global Settings
// dialog's options, in the new design's idiom.
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { getDefaultSort, setDefaultSort, getUseDirectLink } from "../../util/Language.js";
import { NEXT_DESIGN } from "../../util/Design.js";
import DesignSwitch from "../DesignSwitch.vue";
import NxIcon from "./NxIcon.vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  lan: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["close"]);

const text = computed(() => (props.lan === "zh" ? {
  title: "全局设置",
  subtitle: "这些设置会保存在浏览器中",
  sort: "默认排序",
  direct: "资源站使用直链",
  directHint: "下载链接直接指向文件，跳过资源站页面",
  design: "界面设计",
  legacy: "切换到旧版设计",
  close: "关闭",
  sorts: [
    { value: "name_asc", label: "名称正序" },
    { value: "name_desc", label: "名称倒序" },
    { value: "author_asc", label: "作者正序" },
    { value: "author_desc", label: "作者倒序" },
    { value: "date_asc", label: "日期正序" },
    { value: "date_desc", label: "日期倒序" },
  ],
} : {
  title: "Global settings",
  subtitle: "Saved in this browser",
  sort: "Default sort",
  direct: "Use direct links for the File Hub",
  directHint: "Download links point straight at the file, skipping the File Hub page",
  design: "Interface design",
  legacy: "Switch to legacy design",
  close: "Close",
  sorts: [
    { value: "name_asc", label: "Name (A to Z)" },
    { value: "name_desc", label: "Name (Z to A)" },
    { value: "author_asc", label: "Author (A to Z)" },
    { value: "author_desc", label: "Author (Z to A)" },
    { value: "date_asc", label: "Date (oldest first)" },
    { value: "date_desc", label: "Date (newest first)" },
  ],
}));

const defaultSort = getDefaultSort();
const useDirectLink = getUseDirectLink();

// Edited in the drawer, committed on close — same model as the legacy dialog.
const tempSort = ref("date_desc");
const tempDirect = ref(false);

watch(() => props.show, (open) => {
  document.body.classList.toggle("nx-locked", open);
  if (open) {
    tempSort.value = defaultSort.value;
    tempDirect.value = useDirectLink.value;
  } else {
    // commit on close
    setDefaultSort(tempSort.value);
    useDirectLink.value = tempDirect.value;
  }
});

function onKeydown(event) {
  if (event.key === "Escape" && props.show) emit("close");
}

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
        v-if="show"
        class="nx-scrim"
        type="button"
        :aria-label="text.close"
        @click="emit('close')"
      />
    </Transition>
    <Transition name="nx-slide">
      <aside
        v-if="show"
        class="nx-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="text.title"
        style="--nx-drawer-w: min(420px, 100vw);"
      >
        <div class="nx-drawer-head">
          <div style="flex:1; min-width:0;">
            <h2 class="nx-drawer-title">{{ text.title }}</h2>
            <p class="nx-drawer-sub">{{ text.subtitle }}</p>
          </div>
          <button
            class="nx-close"
            type="button"
            :aria-label="text.close"
            @click="emit('close')"
          >
            <NxIcon
              name="close"
              :size="15"
            />
          </button>
        </div>

        <div class="nx-drawer-body">
          <section class="nx-section">
            <div class="nx-section-label">{{ text.sort }}</div>
            <div class="nx-checks">
              <button
                v-for="option in text.sorts"
                :key="option.value"
                type="button"
                class="nx-check"
                :class="{ on: tempSort === option.value }"
                @click="tempSort = option.value"
              >
                <span class="nx-check-box">
                  <NxIcon
                    v-if="tempSort === option.value"
                    name="check"
                    :size="10"
                  />
                </span>
                <span>{{ option.label }}</span>
              </button>
            </div>
          </section>

          <section class="nx-section">
            <div class="nx-section-label">{{ text.direct }}</div>
            <button
              type="button"
              class="nx-check"
              :class="{ on: tempDirect }"
              :aria-pressed="tempDirect"
              @click="tempDirect = !tempDirect"
            >
              <span class="nx-check-box">
                <NxIcon
                  v-if="tempDirect"
                  name="check"
                  :size="10"
                />
              </span>
              <span>{{ text.direct }}</span>
            </button>
            <p style="font-size:11.5px;color:var(--nx-muted);margin-top:6px;line-height:1.5;">
              {{ text.directHint }}
            </p>
          </section>

          <section class="nx-section">
            <div class="nx-section-label">{{ text.design }}</div>
            <DesignSwitch
              :current="NEXT_DESIGN"
              variant="menu"
              :label="text.legacy"
            />
          </section>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
