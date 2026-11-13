import { ref, watch } from "vue";
import { ensureMfList } from "../useMfList.js";
import { ensureAssetsList, findAssetsByName, resolveVariantRaw } from "../useAssetsList.js";
import { readList } from "../ReadList.js";
import { normalizeSoftendoList, getSoftendoGameName } from "../SoftendoUtil.js";
import { loadImageIndex } from "../ImageUtil.js";
import { buildAssetRecords, buildMfRecords, buildSoftendoRecords } from "./records.js";

/**
 * Resolve single named records for the documentation pages.
 *
 * The docs reference specific items by name (`<AssetsEntry name="Cloud Engine" />`,
 * `<MfGamesEntry name="Mario Forever Remake" />`). This module turns those names
 * into the same record shape the catalogs use, so a doc preview and a catalog row
 * show identical facts — no second implementation of "what is this game".
 */
export function useNamedRecord(kind, props, lan) {
  const record = ref(null);
  const loading = ref(true);

  async function load() {
    loading.value = true;
    try {
      await loadImageIndex().catch(() => null);
      if (kind === "asset") {
        record.value = await resolveAsset(props, lan.value);
      } else if (kind === "softendo") {
        record.value = await resolveSoftendo(props, lan.value);
      } else {
        record.value = await resolveMf(props, lan.value);
      }
    } catch (error) {
      console.error(`Failed to resolve ${kind} record:`, error);
      record.value = null;
    } finally {
      loading.value = false;
    }
  }

  watch(lan, load);
  watch(() => [props.name, props.variant, props.ver, props.defaultVer], load);

  load();

  return { record, loading, reload: load };
}

async function resolveMf(props, lan) {
  const list = await ensureMfList();
  const target = String(props.name || "").trim().toLowerCase();
  const matches = list.filter((entry) => {
    const aliases = Array.isArray(entry.alias) ? entry.alias : (entry.alias ? [entry.alias] : []);
    const names = [entry.game, entry.game_alt, ...aliases];
    return names.some((name) => String(name || "").trim().toLowerCase() === target);
  });
  if (matches.length === 0) return null;

  // Prefer a candidate with artwork, then the newest one — the same rule the
  // legacy entry components use to pick between same-named records.
  const records = buildMfRecords(matches, lan);
  const scored = records.map((item) => ({
    item,
    hasImage: item.image ? 1 : 0,
    time: item.date ? item.date.getTime() : -1,
  }));
  scored.sort((a, b) => (b.hasImage - a.hasImage) || (b.time - a.time));
  const chosen = scored[0].item;

  const desired = props.ver || props.defaultVer;
  if (!desired) return chosen;

  const match = chosen.versions.find((v) => v.verKey === desired || v.label === desired);
  if (!match) return chosen;

  return {
    ...chosen,
    date: match.date,
    versionLabel: match.label,
    downloads: match.downloads,
    dataDownloads: match.dataDownloads,
    versions: props.ver ? [match] : chosen.versions,
  };
}

async function resolveAsset(props, lan) {
  // `ensureAssetsList` normalizes variants and inherits the entry-level download
  // fields onto each variant, which is what the legacy `<AssetsEntry>` relies on.
  await ensureAssetsList();
  const found = findAssetsByName(props.name);
  if (found.length === 0) return null;
  const entry = found[0];

  let source = entry;
  if (props.variant || props.ver) {
    const variant = resolveVariantRaw(entry, props.variant, props.ver);
    if (variant) {
      const verKey = Object.keys(variant)[0];
      const verObj = variant[verKey] || {};
      source = {
        ...entry,
        currentVer: { ...verObj },
        currentVerStr: verKey,
        _variantName: verKey,
        ver: [variant],
      };
    }
  }

  return buildAssetRecords([source], lan)[0] || null;
}

async function resolveSoftendo(props, lan) {
  const list = await readList("list-softendo.yaml");
  const normalized = normalizeSoftendoList(list, lan);
  const target = String(props.name || "").trim().toLowerCase();
  const matches = normalized.filter((entry) => {
    const names = [getSoftendoGameName(entry), ...(entry.alias || [])];
    return names.some((name) => String(name || "").trim().toLowerCase() === target);
  });
  if (matches.length === 0) return null;
  return buildSoftendoRecords([matches[0]], lan)[0] || null;
}
