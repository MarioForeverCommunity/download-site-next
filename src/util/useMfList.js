import { readList } from "./ReadList.js"
import { parseVer } from "./Misc.js"

let mfListPromise = null
let mfListCache = null
let mfNameIndex = null

const normalizeDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const normalizeMfEntry = (raw) => {
  const entry = { ...raw }
  entry.category = "mf"

  if (entry.ver == null) {
    entry.ver = ""
  }

  if (entry.type === "international" && entry.author_alias) {
    entry.first_author = entry.author_alias
  } else if (typeof entry.author === "object") {
    entry.first_author = entry.author[0]
  } else {
    entry.first_author = entry.author
  }

  if (typeof entry.ver !== "object") {
    const date = normalizeDate(entry.date)
    entry.currentVerStr = entry.ver
    entry.currentVerStrAlt = entry.ver_alt
    entry.ver = [{
      [entry.ver]: {
        code: entry.code,
        date,
        download_url: entry.download_url,
        download_url_alt: entry.download_url_alt,
        file_name: entry.file_name,
        file_url: entry.file_url,
        source_url: entry.source_url,
        source_url_alt: entry.source_url_alt,
        ver_alt: entry.ver_alt,
        data_download_url: entry.data_download_url,
        data_file_name: entry.data_file_name,
        data_file_url: entry.data_file_url
      }
    }]
  } else {
    entry.currentVerStr = Object.keys(entry.ver[0])[0]
    const firstVerObj = parseVer(entry.ver[0])
    entry.currentVerStrAlt = firstVerObj ? firstVerObj.ver_alt : null
    for (const verRaw of entry.ver) {
      const verKey = Object.keys(verRaw)[0]
      const verObj = verRaw[verKey]
      if (verObj && verObj.date) {
        verObj.date = normalizeDate(verObj.date)
      }
    }
  }

  for (const verRaw of entry.ver) {
    const verKey = Object.keys(verRaw)[0]
    const verObj = verRaw[verKey]
    if (!verObj) continue

    if (verObj.file_url) {
      verObj.file_url_zh = verObj.file_url
      verObj.file_url_en = verObj.file_url
    } else if (verObj.file_name) {
      if (verObj.file_name.toLowerCase().endsWith(".apk")) {
        verObj.file_url_zh = `https://file.marioforever.net/Mario Forever/安卓游戏/${entry.first_author}/${verObj.file_name}`
        verObj.file_url_en = `https://file.marioforever.net/mario-forever/games/mobile-fangames/${entry.first_author}/${verObj.file_name}`
      } else if (verObj.repacker) {
        verObj.file_url_zh = `https://file.marioforever.net/Mario Forever/重打包作品/${verObj.file_name}`
        verObj.file_url_en = `https://file.marioforever.net/mario-forever/games/repackaged-fangames/${verObj.file_name}`
      } else if (entry.type === "chinese") {
        const year = verObj.date instanceof Date ? verObj.date.toISOString().split("-")[0] : ""
        verObj.file_url_zh = `https://file.marioforever.net/Mario Forever/国内作品/${year}/${verObj.file_name}`
        verObj.file_url_en = `https://file.marioforever.net/mario-forever/games/chinese-fangames/${year}/${verObj.file_name}`
      } else if (entry.type === "international") {
        verObj.file_url_zh = `https://file.marioforever.net/Mario Forever/国外作品/${entry.first_author}/${verObj.file_name}`
        verObj.file_url_en = `https://file.marioforever.net/mario-forever/games/international-fangames/${entry.first_author}/${verObj.file_name}`
      }
    }

    if (verObj.data_file_url) {
      verObj.data_file_url_zh = verObj.data_file_url
      verObj.data_file_url_en = verObj.data_file_url
    } else if (verObj.data_file_name) {
      if (verObj.data_file_name.toLowerCase().endsWith(".apk") || verObj.file_name?.toLowerCase().endsWith(".apk")) {
        verObj.data_file_url_zh = `https://file.marioforever.net/Mario Forever/安卓游戏/${entry.first_author}/${verObj.data_file_name}`
        verObj.data_file_url_en = `https://file.marioforever.net/mario-forever/games/mobile-fangames/${entry.first_author}/${verObj.data_file_name}`
      } else if (verObj.repacker) {
        verObj.data_file_url_zh = `https://file.marioforever.net/Mario Forever/重打包作品/${verObj.data_file_name}`
        verObj.data_file_url_en = `https://file.marioforever.net/mario-forever/games/repacked-fangames/${verObj.data_file_name}`
      } else if (entry.type === "chinese") {
        const year = verObj.date instanceof Date ? verObj.date.toISOString().split("-")[0] : ""
        verObj.data_file_url_zh = `https://file.marioforever.net/Mario Forever/国内作品/${year}/${verObj.data_file_name}`
        verObj.data_file_url_en = `https://file.marioforever.net/mario-forever/games/chinese-fangames/${year}/${verObj.data_file_name}`
      } else if (entry.type === "international") {
        verObj.data_file_url_zh = `https://file.marioforever.net/Mario Forever/国外作品/${entry.first_author}/${verObj.data_file_name}`
        verObj.data_file_url_en = `https://file.marioforever.net/mario-forever/games/international-fangames/${entry.first_author}/${verObj.data_file_name}`
      }
    }

    if (verObj.source_url != null && verObj.source_url[0] === "~") {
      verObj.source_url = verObj.source_url.substring(1)
      verObj.source_url_invalid = true
    } else {
      verObj.source_url_invalid = false
    }

    if (verObj.source_url_alt != null && verObj.source_url_alt[0] === "~") {
      verObj.source_url_alt = verObj.source_url_alt.substring(1)
      verObj.source_url_invalid_alt = true
    } else {
      verObj.source_url_invalid_alt = false
    }

    if (verObj.download_url != null && verObj.download_url[0] === "~") {
      verObj.download_url = verObj.download_url.substring(1)
      verObj.download_url_invalid = true
    } else {
      verObj.download_url_invalid = false
    }

    if (verObj.download_url_alt != null && verObj.download_url_alt[0] === "~") {
      verObj.download_url_alt = verObj.download_url_alt.substring(1)
      verObj.download_url_invalid_alt = true
    } else {
      verObj.download_url_invalid_alt = false
    }
  }

  entry.currentVer = parseVer(entry.ver[0])
  if (entry.currentVer && entry.currentVer.date) {
    entry.currentVer.date = normalizeDate(entry.currentVer.date)
  }

  return entry
}

const getCandidateNames = (entry) => {
  const names = []
  if (entry.game) names.push(entry.game)
  if (entry.game_alt) names.push(entry.game_alt)
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

export const ensureMfList = async () => {
  if (mfListPromise) return mfListPromise
  mfListPromise = readList("list-mf.yaml").then((list) => {
    mfListCache = list.map((entry) => normalizeMfEntry(entry))
    mfNameIndex = new Map()
    for (const entry of mfListCache) {
      for (const n of getCandidateNames(entry)) {
        const key = normalizeKey(n)
        if (!key) continue
        if (!mfNameIndex.has(key)) {
          mfNameIndex.set(key, [entry])
        } else {
          mfNameIndex.get(key).push(entry)
        }
      }
    }
    return mfListCache
  })
  return mfListPromise
}

export const getMfList = () => mfListCache
export const getMfNameIndex = () => mfNameIndex

export const findMfByName = (name) => {
  const target = normalizeKey(name)
  return mfNameIndex?.get(target) || []
}

export const resolveVerRaw = (entry, desiredVerStr) => {
  if (!entry?.ver || entry.ver.length === 0) return null
  if (!desiredVerStr) return entry.ver[0]

  const desired = normalizeKey(desiredVerStr)
  const exact = entry.ver.find((verRaw) => normalizeKey(Object.keys(verRaw)[0]) === desired)
  if (exact) return exact

  const byAlt = entry.ver.find((verRaw) => {
    const verObj = parseVer(verRaw)
    return verObj?.ver_alt && normalizeKey(verObj.ver_alt) === desired
  })
  return byAlt || entry.ver[0]
}
