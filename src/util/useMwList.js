import { readList } from "./ReadList.js"
import { processFileNamesWithVolumes } from "./GemeUtil.js"

let mwListPromise = null
let mwListCache = null
let mwNameIndex = null

const normalizeDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const normalizeMwEntry = (raw) => {
  const entry = { ...raw }
  entry.category = "mw"
  entry.date = normalizeDate(entry.date)

  function generateResourceUrl(levelEntry, fname) {
    const author = Array.isArray(levelEntry.author) ? "合作作品" : levelEntry.author
    return `https://file.marioforever.net/Mario Worker/${author == "合作作品" ? "合作作品" : `吧友作品/${author}`}/${fname}`
  }

  if (entry.file_url) {
    entry.file_urls = [{
      name: "社区资源站",
      url: entry.file_url
    }]
  } else if (entry.file_name) {
    if (Array.isArray(entry.file_name)) {
      entry.file_urls = []
      const displayNames = processFileNamesWithVolumes(entry.file_name)
      for (let i = 0; i < entry.file_name.length; i++) {
        const fileNameEntry = entry.file_name[i]
        if (fileNameEntry == null) continue
        entry.file_urls.push({
          name: `社区资源站 (${displayNames[i]})`,
          url: generateResourceUrl(entry, fileNameEntry)
        })
      }
    } else {
      entry.file_urls = [{
        name: "社区资源站",
        url: generateResourceUrl(entry, entry.file_name)
      }]
    }
  }

  if (!entry.data_file_url) {
    if (entry.data_file_name) {
      if (Array.isArray(entry.data_file_name)) {
        entry.data_file_urls = []
        const displayNames = processFileNamesWithVolumes(entry.data_file_name)
        for (let j = 0; j < entry.data_file_name.length; j++) {
          const dataFileNameEntry = entry.data_file_name[j]
          if (dataFileNameEntry == null) continue
          entry.data_file_urls.push({
            name: `社区资源站 (${displayNames[j]})`,
            url: generateResourceUrl(entry, dataFileNameEntry)
          })
        }
      } else {
        entry.data_file_urls = [{
          name: "社区资源站",
          url: generateResourceUrl(entry, entry.data_file_name)
        }]
      }
    }
  } else {
    entry.data_file_urls = [{
      name: "社区资源站",
      url: entry.data_file_url
    }]
  }
  entry.currentVer = {
    date: entry.date,
    download_url: entry.download_url,
    source_url: entry.source_url,
    code: entry.code,
    file_name: entry.file_name,
    file_url: entry.file_url,
    data_file_name: entry.data_file_name,
    data_file_url: entry.data_file_url,
    data_download_url: entry.data_download_url,
    data_file_urls: entry.data_file_urls,
    data_code: entry.data_code
  }
  if (entry.currentVer.source_url != null && entry.currentVer.source_url[0] === "~") {
    entry.currentVer.source_url = entry.currentVer.source_url.substring(1)
    entry.currentVer.source_url_invalid = true
  } else {
    entry.currentVer.source_url_invalid = false
  }

  if (entry.currentVer.download_url != null && entry.currentVer.download_url[0] === "~") {
    entry.currentVer.download_url = entry.currentVer.download_url.substring(1)
    entry.currentVer.download_url_invalid = true
  } else {
    entry.currentVer.download_url_invalid = false
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

export const ensureMwList = async () => {
  if (mwListPromise) return mwListPromise
  mwListPromise = readList("list-mw.yaml").then((list) => {
    mwListCache = list.map((entry) => normalizeMwEntry(entry))
    mwNameIndex = new Map()
    for (const entry of mwListCache) {
      for (const n of getCandidateNames(entry)) {
        const key = normalizeKey(n)
        if (!key) continue
        if (!mwNameIndex.has(key)) {
          mwNameIndex.set(key, [entry])
        } else {
          mwNameIndex.get(key).push(entry)
        }
      }
    }
    return mwListCache
  })
  return mwListPromise
}

export const getMwList = () => mwListCache
export const getMwNameIndex = () => mwNameIndex

export const findMwByName = (name) => {
  const target = normalizeKey(name)
  return mwNameIndex?.get(target) || []
}
