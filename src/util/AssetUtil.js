// Base paths for asset downloads from community resource site (社区资源站)
const ASSET_BASE_PATHS = {
  effect: "https://file.marioforever.net/Mario Forever/引擎/CTF特效/",
  addon: "https://file.marioforever.net/Mario Forever/引擎/拓展资源包/",
  sprite: "https://file.marioforever.net/Mario Forever/游戏素材/",
  tool: "https://file.marioforever.net/Mario Forever/游戏工具/",
  mwtool: "https://file.marioforever.net/Mario Worker/辅助工具/"
}

// 对象存储（CDN）基础路径
const ASSET_CDN_BASE_PATHS = {
  effect: "https://mf-cdn.kevinh.wang/mario-forever/engines/clickteam-fusion-effects/",
  addon: "https://mf-cdn.kevinh.wang/mario-forever/engines/resource-packs/",
  sprite: "https://mf-cdn.kevinh.wang/mario-forever/resources/",
  tool: "https://mf-cdn.kevinh.wang/mario-forever/tools/",
  mwtool: "https://mf-cdn.kevinh.wang/mario-worker/tools/"
}

// 引擎类型基础路径
const ENGINE_BASE_PATH = "https://file.marioforever.net/Mario Forever/引擎/"
const ENGINE_CDN_BASE_PATH = "https://mf-cdn.kevinh.wang/mario-forever/engines/"

/**
 * 根据资源类型、文件名（及可选路径）构建下载链接
 * @param {string} type - 资源类型 (effect/addon/engine/sprite/tool/mwtool)
 * @param {string} fileName - 文件名
 * @param {string} [path=""] - engine 类型下的子路径
 * @param {boolean} [useCdn=false] - 是否使用对象存储（CDN）
 * @returns {string|null} 完整的 URL
 */
export function getAssetFileUrl(type, fileName, path = "", useCdn = false) {
  if (!fileName) return null
  const encodedFileName = encodeURIComponent(fileName)
  if (type === "engine") {
    const encodedPath = path ? encodeURIComponent(path) + "/" : ""
    const basePath = useCdn ? ENGINE_CDN_BASE_PATH : ENGINE_BASE_PATH
    return `${basePath}${encodedPath}${encodedFileName}`
  }
  const baseUrl = useCdn ? ASSET_CDN_BASE_PATHS[type] : ASSET_BASE_PATHS[type]
  return baseUrl ? baseUrl + encodedFileName : null
}

/**
 * 获取资源文件的展示名称（去除路径与扩展名，并尝试解码）
 * @param {string} fileName - 原始文件名
 * @returns {string} 展示名称
 */
export function getAssetFileDisplayName(fileName) {
  let displayFileName = fileName.split("/").pop()
  displayFileName = displayFileName.replace(/\.[^.]*$/, "")
  try {
    displayFileName = decodeURIComponent(displayFileName)
  } catch (error) {
    console.error("Failed to decode URI component:", displayFileName, error)
  }
  return displayFileName
}

/**
 * 为资源条目生成下载链接列表
 * @param {object} assetEntry - 资源条目，需包含 currentVer.file_name 与 type
 * @param {boolean} [useCdn=false] - 是否使用对象存储（CDN）
 * @returns {Array<{name: string, url: string}>} 下载链接列表
 */
export function getAssetResourceURLs(assetEntry, useCdn = false) {
  if (!assetEntry?.currentVer || !assetEntry.currentVer.file_name) {
    return []
  }
  const fileNames = Array.isArray(assetEntry.currentVer.file_name)
    ? assetEntry.currentVer.file_name.filter(fn => fn != null)
    : [assetEntry.currentVer.file_name]

  return fileNames.map((fileName) => {
    const url = getAssetFileUrl(assetEntry.type, fileName, assetEntry.path || "", useCdn)
    const displayFileName = getAssetFileDisplayName(fileName)
    const baseName = useCdn ? "对象存储" : "社区资源站"
    return {
      name: fileNames.length > 1 ? `${baseName} (${displayFileName})` : baseName,
      url
    }
  })
}
