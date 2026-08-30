// Base paths for asset downloads from community resource site (社区资源站)
const ASSET_BASE_PATHS = {
  effect: "https://file.marioforever.net/Mario Forever/引擎/CTF特效/",
  addon: "https://file.marioforever.net/Mario Forever/引擎/拓展资源包/",
  sprite: "https://file.marioforever.net/Mario Forever/游戏素材/",
  tool: "https://file.marioforever.net/Mario Forever/游戏工具/",
  mwtool: "https://file.marioforever.net/Mario Worker/辅助工具/"
}

// 引擎类型基础路径
const ENGINE_BASE_PATH = "https://file.marioforever.net/Mario Forever/引擎/"

// 英文路径（后缀与原对象存储 CDN 一致，域名换为资源站 file.marioforever.net）
const ASSET_BASE_PATHS_EN = {
  effect: "https://file.marioforever.net/mario-forever/engines/clickteam-fusion-effects/",
  addon: "https://file.marioforever.net/mario-forever/engines/resource-packs/",
  sprite: "https://file.marioforever.net/mario-forever/resources/",
  tool: "https://file.marioforever.net/mario-forever/tools/",
  mwtool: "https://file.marioforever.net/mario-worker/tools/"
}

const ENGINE_BASE_PATH_EN = "https://file.marioforever.net/mario-forever/engines/"

/**
 * 根据资源类型、文件名（及可选路径）构建下载链接
 * @param {string} type - 资源类型 (effect/addon/engine/sprite/tool/mwtool)
 * @param {string} fileName - 文件名
 * @param {string} [path=""] - engine 类型下的子路径
 * @param {string} [lan="zh"] - 语言 ("zh"/"en")，en 使用英文路径
 * @returns {string|null} 完整的 URL
 */
export function getAssetFileUrl(type, fileName, path = "", lan = "zh") {
  if (!fileName) return null
  // 与 MF/MW 保持一致：文件名不做 URL 编码，交由客户端处理（含中文/空格）
  if (type === "engine") {
    const pathPart = path ? path + "/" : ""
    const basePath = lan === "en" ? ENGINE_BASE_PATH_EN : ENGINE_BASE_PATH
    return `${basePath}${pathPart}${fileName}`
  }
  const baseUrl = lan === "en" ? ASSET_BASE_PATHS_EN[type] : ASSET_BASE_PATHS[type]
  return baseUrl ? baseUrl + fileName : null
}

/**
 * 获取资源文件的展示名称（去除路径与扩展名）
 * @param {string} fileName - 原始文件名
 * @returns {string} 展示名称
 */
export function getAssetFileDisplayName(fileName) {
  let displayFileName = fileName.split("/").pop()
  displayFileName = displayFileName.replace(/\.[^.]*$/, "")
  return displayFileName
}

/**
 * 为资源条目生成下载链接列表
 * @param {object} assetEntry - 资源条目，需包含 currentVer.file_name 与 type
 * @param {string} [lan="zh"] - 语言 ("zh"/"en")，en 使用英文路径与 path_alt
 * @returns {Array<{name: string, url: string}>} 下载链接列表
 */
export function getAssetResourceURLs(assetEntry, lan = "zh") {
  if (!assetEntry?.currentVer || !assetEntry.currentVer.file_name) {
    return []
  }
  const fileNames = Array.isArray(assetEntry.currentVer.file_name)
    ? assetEntry.currentVer.file_name.filter(fn => fn != null)
    : [assetEntry.currentVer.file_name]

  // 英文路径下 engine 类使用英文子目录 path_alt（缺省回退 path）
  const path = lan === "en"
    ? (assetEntry.path_alt || assetEntry.path || "")
    : (assetEntry.path || "")

  const baseName = lan === "en" ? "Community File Hub" : "社区资源站"

  return fileNames.map((fileName) => {
    const url = getAssetFileUrl(assetEntry.type, fileName, path, lan)
    const displayFileName = getAssetFileDisplayName(fileName)
    return {
      name: fileNames.length > 1 ? `${baseName} (${displayFileName})` : baseName,
      url
    }
  })
}
