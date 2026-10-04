# API Documentation

**English** | [简体中文](API.zh-cn.md)

download.marioforever.net provides a **static JSON API** with complete data for Mario Forever fangames, Super Mario Worker Project levels, Mario Forever Assets, Softendo games, and original Mario Forever versions, including parameters, Community File Hub download links, image paths, and description content.

The API is generated at site build time by `scripts/generate-api.js` from the YAML data under `public/data/`, and is deployed as static files along with the site. Therefore it has **no backend service**, and there are no rate limits, authentication, or query parameters — simply GET the corresponding JSON file with any HTTP client, then filter locally.

## Quick Start

### Base URL

```
https://download.marioforever.net/api/
```

In local development (`bun run dev`), it is `http://localhost:5173/api/`.

### Endpoint Overview

| Endpoint | Content | Entries | Top-level type |
| --- | --- | --- | --- |
| `/api/index.json` | Manifest: lists all endpoints with their entry counts and generation time | — | Object |
| `/api/mf.json` | Mario Forever fangames | ~600 | Array |
| `/api/mw.json` | Super Mario Worker Project levels | ~425 | Array |
| `/api/assets.json` | Mario Forever Assets (engines, addons, sprites, effects, tools) | ~76 | Array |
| `/api/softendo.json` | Softendo / Buziol Games games | ~70 | Array |
| `/api/original-mf.json` | All original Mario Forever versions | ~43 | Array |

Except for `index.json`, the top level of every endpoint is an **array** that can be iterated directly.

### Minimal Example

```bash
curl https://download.marioforever.net/api/mf.json
```

```javascript
const res = await fetch('https://download.marioforever.net/api/mf.json')
const games = await res.json()
console.log(games.length)
```

```python
import requests
games = requests.get('https://download.marioforever.net/api/mf.json').json()
print(len(games))
```

### Read the Manifest First

`index.json` is used to discover endpoints and check data freshness, making it suitable for cache validation. Besides `generatedAt` and `endpoints`, it also contains `name` (the API name) and `notes` (descriptions of the data fields):

```javascript
const manifest = await fetch('https://download.marioforever.net/api/index.json').then(r => r.json())
// manifest.name          -> "download.marioforever.net static API"
// manifest.generatedAt   -> "2026-08-12T05:58:21.797Z"
// manifest.endpoints     -> [{ id, path, file, count, category }, ...]
// manifest.notes         -> [ ...field notes ]

for (const ep of manifest.endpoints) {
  console.log(ep.id, ep.count, ep.path)
}
```

## General Conventions

Before reading the fields of each endpoint, familiarize yourself with the following conventions that apply across all data.

### Download Link Objects

All download links are unified into **link objects** containing the file name and its source:

| Field | Type | Description |
| --- | --- | --- |
| `fileName` | String \| null | The original file name on the Community File Hub |
| `zh` | String \| null | Community File Hub link (Chinese path) |
| `en` | String \| null | Community File Hub link (English path) |

Note that:

- `zh` and `en` point to **the same file**; only the directory naming of the Community File Hub differs (the Chinese site uses Chinese directory names). Pick one based on the user interface language.
- MW levels (`mw.json`) have **no `en`**, because SMWP works only have Chinese Community File Hub paths.
- Links on all endpoints are **not URL-encoded** at generation time: when `fileName` contains Chinese characters or spaces, they are concatenated as-is. Most HTTP clients and browsers handle this automatically; if yours does not, apply `encodeURI()` yourself.

A robust way to pick a link:

```javascript
// Pick the Community File Hub link by language
function pickUrl(item, lan = 'zh') {
  return (lan === 'en' ? item.en : item.zh) || item.zh || null
}
```

### Expired Link Flags

The author's release links (`source`) and official download links (`download`) may have expired. Instead of removing them, the data marks them with boolean fields:

```json
"source":   { "url": "https://...", "urlAlt": null, "invalid": false, "invalidAlt": false },
"download": { "url": "https://...", "urlAlt": null, "code": "abcd", "invalid": true, "invalidAlt": false }
```

- `url` / `urlAlt`: for `source`, `urlAlt` is the release link in the other language; for `download`, `urlAlt` is an alternative download link — both `url` and `urlAlt` are shown on the Chinese and English pages, but for games made by Chinese community members (MF `type: chinese`), the English page swaps their display order (`urlAlt` first), while international games keep the original order
- `invalid` / `invalidAlt`: whether the corresponding link has expired; consider graying it out or marking it when displaying
- `download.code`: the password/extraction code for the cloud drive (if required)

### Images

The `images` object gives the image paths under the work's `public/data/` directory, all as **site-root-relative paths** that must be prefixed with the site domain:

| Field | Type | Description |
| --- | --- | --- |
| `dir` | String | The work's data directory name (may be empty) |
| `all` | String array | All images in the directory |
| `title` | String \| null | Title image (`title.*`) |
| `logo` | String \| null | Logo image (`logo.*`) |
| `showcase` | String array | Screenshots (`showcase_*`), sorted in natural order |

```javascript
const BASE = 'https://download.marioforever.net'
const cover = game.images.title || game.images.logo || game.images.all[0]
const src = cover ? BASE + cover : null   // "/data/mf-games/Fear the Eye/title.webp"
```

### Descriptions

Work descriptions have two sources with different purposes:

- **`inlineDescription`** — a one-sentence short description inlined in the data.
  - MF: a `{ zh, en }` object
  - MW / Assets: a string or `null`
- **`description`** — a long-form Markdown introduction with **content already inlined**, no extra request needed.

```json
"description": {
  "default": "_**⚠This level contains flashing...**_\r\n\r\nSubmission to PK!MF...",
  "zh": null,
  "en": null,
  "files": ["/data/mf-games/Fear the Eye/description.md"]
}
```

| Field | Description |
| --- | --- |
| `default` | Content of `description.md` (language-neutral, use this first) |
| `zh` | Content of `description_zh.md` |
| `en` | Content of `description_en.md` |
| `files` | Source paths of the above files, for tracing back |

Suggested reading order: `default` → current language → the other language:

```javascript
function getDescription(item, lan = 'zh') {
  const d = item.description
  return d.default || (lan === 'zh' ? d.zh : d.en) || d.zh || d.en || null
}
```

What you get is Markdown source that you need to render yourself (this site uses `markdown-it`).

### Dates

All dates are strings in `YYYY-MM-DD` format (e.g. `"2026-08-12"`) and may be `null`. They can be compared and sorted as strings directly, or parsed with `new Date(str)`.

## Endpoint Reference

### `/api/mf.json` — Mario Forever fangames

Top-level fields:

| Field | Type | Description |
| --- | --- | --- |
| `category` | String | Always `"mf"` |
| `name` | String | The game's original name |
| `nameAlt` | String \| null | English name/translation |
| `aliases` | String array | Aliases and abbreviations, for search |
| `author` | String array | Authors (always an array, even with a single author) |
| `authorAlt` | String array \| null | Authors' English names |
| `firstAuthor` | String \| null | The primary author name used to build Community File Hub paths |
| `type` | String | `chinese` (games made by Chinese community members) / `international` (international games) |
| `software` | String | Software used to create the game, game-level: `mmf`/`godot`/`gamemaker`/`flash`/`other`; defaults to `"mmf"` when unspecified |
| `tags` | String array | Tags such as `Single Level`, `Speedrun`, `Horror` |
| `wiki` | Object | `{ zh, en }` Wiki links |
| `homepage` | Object | `{ zh, en, repo }` homepage / source code repository links |
| `inlineDescription` | Object | `{ zh, en }` short description |
| `versions` | Array | All versions, see below |
| `currentVersion` | String array | **List of current (latest) version names**, see below |
| `currentVersionAlt` | String \| null | Top-level `ver_alt` field (English name/alias of the game's first version, usually the same as the current version) |
| `images` | Object | See "Images" |
| `description` | Object | See "Descriptions" |

Each version in `versions`:

| Field | Type | Description |
| --- | --- | --- |
| `version` | String | Version name (may be an empty string, meaning a single-version game) |
| `versionAlt` | String \| null | English version name/alias |
| `date` | String \| null | Release date |
| `current` | Boolean | Whether this version is the current version |
| `software` | String | Software used to create this version: used if explicitly specified, otherwise falls back to the game-level `software` (`"mmf"` if ultimately unspecified) |
| `source` | Object | Release link, see "Expired Link Flags" |
| `download` | Object | Official download link and extraction code (including alternative code `codeAlt`) |
| `dataDownload` | Object | External download link and extraction code for the data package (e.g. music), see below |
| `resource` | Object | Link object for the game itself |
| `dataResource` | Object | Link object for the data package (e.g. music) |
| `repacker` | String \| null | The person who repackaged the files (if this is a repackaged version) |

`dataDownload` structure: `{ url, code, invalid }`, similar to `download` but without alternative links (corresponding only to the data package's `data_download_url`/`data_code`). Note that it coexists with `dataResource` (the Community File Hub mirror) and comes from a different source.

About **`currentVersion` being an array**: a game can have multiple current versions at the same time (e.g. a Windows build and an Android build are both the latest). This field therefore lists all current version names:

```javascript
// Get all current version objects of the game
const currents = game.versions.filter(v => v.current)
// Or match by name
const currents2 = game.versions.filter(v => game.currentVersion.includes(v.version))

// Just one representative version
const primary = game.versions.find(v => v.current) || game.versions[0]
```

`current` resolution rules:
- If versions with explicit `current: true` exist, those versions are the current ones (multiple current versions supported).
- If no version has explicit `current: true`, it falls back to the version with the latest date; however, if that latest-dated version has explicit `current: false`, no automatic marking happens (and the second-newest version will not be treated as current either).

Entries without version data have an empty `currentVersion` array.

**Old-version archiving for international games (`international`)**: the `resource` / `dataResource` links (`zh` / `en`) of non-current versions (resolved `current === false`) get an `old-versions/` prefix before the file name, pointing to archive paths (except repackaged versions and Android `.apk` files); the `fileName` field keeps the original file name.

<details>
<summary>Example entry</summary>

```json
{
  "category": "mf",
  "name": "Mario Forever: Maker Party",
  "nameAlt": null,
  "aliases": ["MFMP", "马造派对"],
  "author": ["绿色的糖果"],
  "authorAlt": ["Green Sweet"],
  "type": "chinese",
  "tags": ["Multiplayer"],
  "wiki": { "zh": null, "en": null },
  "homepage": { "zh": null, "en": null, "repo": null },
  "inlineDescription": { "zh": null, "en": null },
  "firstAuthor": "绿色的糖果",
  "versions": [
    {
      "version": "Windows",
      "versionAlt": null,
      "date": "2026-07-09",
      "current": true,
      "source": {
        "url": "https://www.marioforever.net/thread-3825-1-1.html",
        "urlAlt": null, "invalid": false, "invalidAlt": false
      },
      "download": {
        "url": "https://pan.baidu.com/s/1wK_60l654Kp-zaPEVsWgcg?pwd=mfmp",
        "urlAlt": "https://www.mediafire.com/folder/hgtsobi2ofnn2/mfmp",
        "code": "mfmp", "codeAlt": null, "invalid": false, "invalidAlt": false
      },
      "dataDownload": { "url": null, "code": null, "invalid": false },
      "resource": {
        "fileName": "mfmp_20260709.rar",
        "zh": "https://file.marioforever.net/Mario Forever/国内作品/2026/mfmp_20260709.rar",
        "en": "https://file.marioforever.net/mario-forever/games/chinese-fangames/2026/mfmp_20260709.rar"
      },
      "dataResource": { "fileName": null, "zh": null, "en": null },
      "repacker": null
    }
  ],
  "currentVersion": ["Windows", "Android"],
  "currentVersionAlt": null,
  "images": { "dir": "...", "all": [], "title": null, "logo": null, "showcase": [] },
  "description": { "default": null, "zh": null, "en": null, "files": [] }
}
```

</details>

### `/api/mw.json` — Super Mario Worker Project levels

SMWP works only have Chinese data, so link objects **do not contain `en`**, and there are no bilingual fields like `nameAlt`/`type`.

| Field | Type | Description |
| --- | --- | --- |
| `category` | String | Always `"mw"` |
| `name` | String | The work's name |
| `aliases` | String array | Aliases |
| `author` | String array | Authors (multiple authors mean a collaboration) |
| `smwpVer` | String \| null | The SMWP version used by the work, e.g. `v1.7.12`, `MW 4.4` |
| `date` | String \| null | Release date |
| `hasBgm` | Boolean | Whether it contains custom BGM |
| `hasBundledSmwp` | Boolean | Whether SMWP itself is bundled |
| `inlineDescription` | String \| null | Short description |
| `wiki` | String \| null | Wiki link |
| `homepage` | String \| null | Homepage link |
| `source` / `download` | Object | Release link / download link |
| `resource` | Array | **List** of link objects for the work's files (may be split archives, hence an array) |
| `dataResource` | Array | List of link objects for data package files |
| `smwp` | Object \| null | SMWP download required to run the work `{ zh }` |
| `smwpData` | Object \| null | SMWP music/data package download `{ zh }` |
| `images` / `description` | Object | Same as the general conventions |

`resource` is an array rather than a single object, because a work may have multiple files (a level file plus a practice mode, split archives, etc.):

```javascript
for (const file of level.resource) {
  console.log(file.fileName, file.zh)
}
```

When `hasBundledSmwp` is `true`, `smwp` is `null` (the work bundles the engine, no separate download needed).

<details>
<summary>Example entry</summary>

```json
{
  "category": "mw",
  "name": "A Day Out 一命特别版+全存档练习模式",
  "aliases": ["ADO"],
  "author": ["玛丽的死对头"],
  "smwpVer": "v1.7.8",
  "date": "2026-07-29",
  "hasBgm": false,
  "hasBundledSmwp": false,
  "inlineDescription": null,
  "wiki": "https://zh.wiki.marioforever.net/wiki/Super_Mario_Worker_Maker",
  "homepage": null,
  "source": { "url": "https://www.marioforever.net/thread-3910-1-1.html", "invalid": false },
  "download": { "url": null, "code": null, "invalid": false },
  "resource": [
    {
      "fileName": "A Day Out (Golden Road).smwp",
      "zh": "https://file.marioforever.net/Mario Worker/吧友作品/玛丽的死对头/A Day Out (Golden Road).smwp"
    }
  ],
  "dataResource": [],
  "smwp": {
    "zh": "https://file.marioforever.net/smwp/smwp-1.7.8.7z"
  },
  "smwpData": {
    "zh": "https://file.marioforever.net/smwp/Data.7z"
  }
}
```

</details>

### `/api/assets.json` — Mario Forever Assets

| Field | Type | Description |
| --- | --- | --- |
| `category` | String | Always `"assets"` |
| `name` / `nameAlt` | String | Asset name |
| `aliases` | String array | Aliases |
| `author` | String array | Authors |
| `type` | String | `engine` engine / `addon` extension pack / `sprite` sprite / `effect` visual effect / `tool` tool / `mwtool` Mario Worker tool |
| `path` | String | Subdirectory of engine-type assets (only `type: engine`) |
| `inlineDescription` | String \| null | Short description |
| `repo` | String \| null | Source code repository |
| `variants` | Array | Variant/version list, see below |
| `currentVariant` | String \| null | First variant name |
| `currentVersion` | String \| null | Version number of the first variant |
| `image` | String \| null | Asset image path (site-root-relative) |

Each item in `variants`:

| Field | Type | Description |
| --- | --- | --- |
| `variant` | String \| null | Variant name (e.g. "core", "effects pack"), `null` for single-version assets |
| `version` | String \| null | Version number |
| `date` | String \| null | Release date |
| `source` / `download` | Object | Release link / download link |
| `resource` | Array | List of link objects (a variant may contain multiple files) |

<details>
<summary>Example entry</summary>

```json
{
  "category": "assets",
  "name": "全图工具",
  "author": ["数字1528君"],
  "type": "addon",
  "path": "",
  "variants": [
    {
      "variant": null,
      "version": null,
      "date": "2026-04-04",
      "source": { "url": "https://www.marioforever.net/thread-3828-1-1.html", "invalid": false },
      "download": { "url": null, "code": null, "invalid": false },
      "resource": [
        {
          "fileName": "截图Active(2026.4.4).mfa",
          "zh": "https://file.marioforever.net/Mario Forever/引擎/拓展资源包/%E6%88%AA%E5%9B%BEActive(2026.4.4).mfa",
          "en": "https://file.marioforever.net/mario-forever/engines/resource-packs/%E6%88%AA%E5%9B%BEActive(2026.4.4).mfa"
        }
      ]
    }
  ],
  "currentVariant": null,
  "currentVersion": null,
  "image": null
}
```

</details>

### `/api/softendo.json` — Softendo / Buziol Games

| Field | Type | Description |
| --- | --- | --- |
| `category` | String | Always `"softendo"` |
| `name` | String | Game name |
| `aliases` | String array | Aliases |
| `type` | String | `mario` / `mff` (Mario Forever Flash) / `flash` / `non-mario` / `banesoft` |
| `software` | String \| Array | Software used to create the game, e.g. `gamemaker`, `flash`, `["flash","mmf"]` |
| `genre` | String array | Genres, e.g. `Puzzle`, `Shmup` |
| `initialYear` | Number \| null | The year the game was first released |
| `isNsmf` | Boolean | Whether it is a New Super Mario Forever game (uses special download paths) |
| `versions` | Array | Version list, see below |
| `currentVersion` | String \| null | First version name |
| `years` | Number array | All years involved (ascending) |
| `image` | String \| null | Single cover image (title screen or logo), file name same as the game name, path e.g. `/data/softendo/Sonic in Marioland.webp`; no showcase |

Each item in `versions`:

| Field | Type | Description |
| --- | --- | --- |
| `version` | String | Version name, e.g. `"2018"`, `"Lite 2011"` |
| `year` | Number \| null | Release year |
| `installer` | Array | List of installer link objects (usually 0 or 1 item) |
| `portable` | Array | List of portable link objects |
| `selfextract` | Array | List of self-extracting link objects |

Each item of `portable` / `selfextract` additionally carries a `kind` field indicating the file form: `portable`, `exe`, `swf`, `zip`. Flash games often provide both `swf` and `exe`:

```javascript
for (const v of game.versions) {
  for (const item of [...v.installer, ...v.portable, ...v.selfextract]) {
    console.log(v.version, item.kind ?? 'installer', item.en)
  }
}
```

All three are unified as arrays so the same logic can iterate them; they are empty arrays when a form does not exist.

### `/api/original-mf.json` — Original Mario Forever

The top level is directly a version array (no game level):

| Field | Type | Description |
| --- | --- | --- |
| `version` | String | Version name, e.g. `v4.4`, `Advance v4.41`, `The Lost Map` |
| `date` | String \| null | Release date |
| `rating` | String \| null | Star rating recommendation, e.g. `★★★★☆` |
| `ratingScore` | Number \| null | Numeric representation of the star rating, 1–10 |
| `installer` | Object | Installer, see below |
| `portable` | Object | Portable link object |

`ratingScore` conversion: `★` counts 2 points, `☆` (half star) counts 1, full score 10. This is convenient for sorting and comparison:

| rating | score | | rating | score |
| --- | --- | --- | --- | --- |
| ☆ | 1 | | ★★★ | 6 |
| ★ | 2 | | ★★★☆ | 7 |
| ★☆ | 3 | | ★★★★ | 8 |
| ★★ | 4 | | ★★★★☆ | 9 |
| ★★☆ | 5 | | ★★★★★ | 10 |

Beyond the common link object, `installer` carries two extra boolean flags:

| Field | Type | Description |
| --- | --- | --- |
| `toolbar` | Boolean | Whether the installer bundles the Mario Forever Toolbar (adware). When `true`, consider prompting users to uncheck it during installation, or prefer the portable version |
| `nsmf` | Boolean | Whether the New Super Mario Forever path format is used (affects `installer` links, not `portable`) |

```json
{
  "version": "v5.0",
  "date": "2010-11-24",
  "rating": "★★",
  "ratingScore": 4,
  "installer": {
    "fileName": "Mario Forever 5.0.exe",
    "toolbar": true,
    "nsmf": false,
    "zh": "https://file.marioforever.net/Mario Forever/Mario Forever 全版本下载/安装版/Mario Forever 5.0.exe",
    "en": "https://file.marioforever.net/mario-forever/games/original-mf/installer/Mario Forever 5.0.exe"
  },
  "portable": {
    "fileName": "Mario Forever 5.0.7z",
    "zh": "https://file.marioforever.net/Mario Forever/Mario Forever 全版本下载/绿色版/Mario Forever 5.0.7z",
    "en": "https://file.marioforever.net/mario-forever/games/original-mf/portable/Mario Forever 5.0.7z"
  }
}
```

Some versions have no installer or portable version; in that case `fileName` and both links are `null`, but the object structure remains complete — no null checks needed.

## Usage Examples

### Search for Games

Name, English name, and aliases should all participate in matching:

```javascript
const games = await fetch('https://download.marioforever.net/api/mf.json').then(r => r.json())

function search(list, query) {
  const q = query.trim().toLowerCase()
  return list.filter(g =>
    g.name.toLowerCase().includes(q) ||
    (g.nameAlt || '').toLowerCase().includes(q) ||
    g.aliases.some(a => a.toLowerCase().includes(q)) ||
    g.author.some(a => a.toLowerCase().includes(q))
  )
}

search(games, 'MFMP')
```

### Filter by Tag and Type

```javascript
// Single-level games made by Chinese community members
const singleLevels = games.filter(g =>
  g.type === 'chinese' && g.tags.includes('Single Level')
)
```

### Sort by Release Date

Dates live at the version level; take the date of each game's current version:

```javascript
function latestDate(game) {
  const dates = game.versions.map(v => v.date).filter(Boolean)
  return dates.sort().at(-1) || ''
}

const recent = [...games].sort((a, b) => latestDate(b).localeCompare(latestDate(a))).slice(0, 20)
```

### Collect All Download Options for a Game

```javascript
function collectDownloads(game, lan = 'zh') {
  const out = []
  for (const v of game.versions) {
    // Official download link
    if (v.download.url && !v.download.invalid) {
      out.push({ version: v.version, kind: 'official', url: v.download.url, code: v.download.code })
    }
    // Community File Hub
    for (const res of [v.resource, v.dataResource]) {
      if (!res.fileName) continue
      const site = lan === 'en' ? res.en : res.zh
      if (site) out.push({ version: v.version, kind: 'Community File Hub', url: site })
    }
  }
  return out
}
```

### Count Works by Author

```javascript
const byAuthor = new Map()
for (const g of games) {
  for (const a of g.author) {
    byAuthor.set(a, (byAuthor.get(a) || 0) + 1)
  }
}
const top = [...byAuthor].sort((a, b) => b[1] - a[1]).slice(0, 10)
```

### Merge Multiple Endpoints

```javascript
const BASE = 'https://download.marioforever.net/api'
const [mf, mw, assets] = await Promise.all(
  ['mf', 'mw', 'assets'].map(id => fetch(`${BASE}/${id}.json`).then(r => r.json()))
)
// Every entry carries a category field, so sources remain distinguishable after merging
const all = [...mf, ...mw, ...assets]
```

### Python Example

```python
import requests

BASE = 'https://download.marioforever.net/api'
games = requests.get(f'{BASE}/mf.json').json()

# Find the Community File Hub links of current versions and print the download URLs
for g in games:
    for v in g['versions']:
        if not v['current']:
            continue
        res = v['resource']
        if res['zh']:
            print(g['name'], v['version'] or '(single version)', res['zh'])
```

## Notes

**Caching and updates** — The API is generated at site build time, so the data update frequency matches site deployment. Clients are advised to cache the data and use `generatedAt` from `index.json` to decide whether to refresh, avoiding repeatedly fetching the full data.

**File size** — `mf.json` inlines all description text and is large (several MB). The server has gzip/brotli compression enabled, and normal HTTP clients decompress automatically. If you only need a few fields, trim the data after fetching, or consider loading it only when needed.

**No query parameters** — Static files do not support server-side filtering like `?category=`; all filtering, sorting, and pagination must be done client-side.

**Fields may be null** — The data is maintained collaboratively by the community, and most fields are optional. Always do null checks; do not assume a field always exists.

**Structure may evolve** — This API is not versioned yet. If field structures change, it will be documented in the repository's commit history and this document. For production use, consider pinning your own copy, or watch for repository updates.

**Data source and license** — The data comes from the YAML lists under `public/data/`, maintained jointly by the Mario Forever community. The project is open source under the MIT license; feel free to use it within the scope of the license. When citing the data, please attribute it to download.marioforever.net.

## Local Generation

The API is generated by `scripts/generate-api.js` into `public/api/`:

```bash
bun run generate-api
```

`bun run build` runs this step automatically, in the order: generate image index → generate API → Vite build → compress artifacts.

To add fields or endpoints, modify `scripts/generate-api.js`. Note that its download link building logic mirrors `GameUtil.js`, `SoftendoUtil.js`, and `AssetUtil.js` under `src/util/` as well as `src/components/OriginalMfTable.vue`; keep both sides consistent when changing path rules.
