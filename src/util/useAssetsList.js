import { readList } from "./ReadList.js"
import { parseVer } from "./Misc.js"

let assetsListPromise = null
let assetsListCache = null
let assetsNameIndex = null

const normalizeDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const normalizeAssetEntry = (raw) => {
  const entry = { ...raw }
  if (entry.variants) {
    entry.variants = entry.variants.map((variant) => {
      const variantKey = Object.keys(variant)[0]
      const variantData = variant[variantKey]
      const date = normalizeDate(variantData?.date)
      return {
        [variantKey]: {
          ...variantData,
          date,
          download_url: entry.download_url,
          download_url_alt: entry.download_url_alt,
          code: entry.code,
          code_alt: entry.code_alt,
          source_url: entry.source_url,
          source_url_alt: entry.source_url_alt
        }
      }
    })
    entry.currentVer = parseVer(entry.variants[0])
    entry.currentVerStr = Object.keys(entry.variants[0])[0]
    entry.ver = entry.variants
    entry._variantName = entry.currentVerStr
  } else {
    const date = normalizeDate(entry.date)
    entry.currentVer = {
      ver: entry.ver,
      date,
      file_name: entry.file_name,
      download_url: entry.download_url,
      download_url_alt: entry.download_url_alt,
      code: entry.code,
      code_alt: entry.code_alt,
      source_url: entry.source_url,
      source_url_alt: entry.source_url_alt
    }
    entry.currentVerStr = entry.ver
    entry.ver = entry.ver ? [{ [entry.ver]: entry.currentVer }] : []
  }
  return entry
}

const getCandidateNames = (entry) => {
  const names = []
  if (entry.name) names.push(entry.name)
  if (entry.name_alt) names.push(entry.name_alt)
  const alias = entry.alias
  if (Array.isArray(alias)) {
    for (const a of alias) {
      if (a) names.push(a)
    }
  } else if (typeof alias === "string" && alias) {
    names.push(alias)
  }
  return names
}

const normalizeKey = (value) => {
  return String(value || "").trim().toLowerCase()
}

export const ensureAssetsList = async () => {
  if (assetsListPromise) return assetsListPromise
  assetsListPromise = readList("list-assets.yaml").then((list) => {
    assetsListCache = list.map((entry) => normalizeAssetEntry(entry))
    assetsNameIndex = new Map()
    for (const entry of assetsListCache) {
      for (const n of getCandidateNames(entry)) {
        const key = normalizeKey(n)
        if (!key) continue
        if (!assetsNameIndex.has(key)) {
          assetsNameIndex.set(key, [entry])
        } else {
          assetsNameIndex.get(key).push(entry)
        }
      }
    }
    return assetsListCache
  })
  return assetsListPromise
}

export const getAssetsList = () => assetsListCache
export const getAssetsNameIndex = () => assetsNameIndex

export const findAssetsByName = (name) => {
  const target = normalizeKey(name)
  return assetsNameIndex?.get(target) || []
}

export const resolveVariantRaw = (entry, desiredVariant, desiredVer) => {
  if (!entry?.ver || entry.ver.length === 0) return null
  const desiredVariantKey = desiredVariant ? normalizeKey(desiredVariant) : null
  const desiredVerKey = desiredVer ? normalizeKey(desiredVer) : null

  const candidates = entry.ver.filter((verRaw) => {
    const variantKey = Object.keys(verRaw)[0]
    const variantOk = desiredVariantKey ? normalizeKey(variantKey) === desiredVariantKey : true
    if (!variantOk) return false
    if (!desiredVerKey) return true
    const verObj = parseVer(verRaw)
    return normalizeKey(verObj?.ver) === desiredVerKey
  })

  if (candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0]

  candidates.sort((a, b) => {
    const aObj = parseVer(a)
    const bObj = parseVer(b)
    const aTime = aObj?.date instanceof Date ? aObj.date.getTime() : -1
    const bTime = bObj?.date instanceof Date ? bObj.date.getTime() : -1
    return bTime - aTime
  })
  return candidates[0]
}
