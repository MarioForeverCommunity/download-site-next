# API 文档

download.marioforever.net 提供一套**静态 JSON API**，包含 Mario Forever 同人作品、Super Mario Worker Project 作品、创作资源、Softendo 游戏与原版 Mario Forever 的完整数据，包括各项参数、资源站/对象存储下载链接、作品图片路径与作品描述内容。

API 在站点构建时由 `scripts/generate-api.js` 从 `public/data/` 下的 YAML 数据生成，随站点一起以静态文件形式部署。因此它**没有后端服务**，也不存在速率限制、鉴权或查询参数——你只需用任意 HTTP 客户端 GET 对应的 JSON 文件，再在本地做筛选。

## 快速开始

### 基址

```
https://download.marioforever.net/api/
```

本地开发时（`bun run dev`）为 `http://localhost:5173/api/`。

### 端点一览

| 端点 | 内容 | 条目数 | 顶层类型 |
| --- | --- | --- | --- |
| `/api/index.json` | 清单：列出所有端点及其条目数、生成时间 | — | 对象 |
| `/api/mf.json` | Mario Forever 同人作品 | ~600 | 数组 |
| `/api/mw.json` | Super Mario Worker Project 作品 | ~425 | 数组 |
| `/api/assets.json` | 创作资源（引擎、拓展、素材、特效、工具） | ~76 | 数组 |
| `/api/softendo.json` | Softendo / Buziol Games 游戏 | ~70 | 数组 |
| `/api/original-mf.json` | 原版 Mario Forever 全版本 | ~43 | 数组 |

除 `index.json` 外，每个端点的顶层都是一个**数组**，可直接遍历。

### 最简调用

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

### 先读清单

`index.json` 用于发现端点与检查数据新鲜度，适合做缓存判断。除 `generatedAt` 与 `endpoints` 外，还包含 `name`（API 名称）与 `notes`（对数据字段的说明）：

```javascript
const manifest = await fetch('https://download.marioforever.net/api/index.json').then(r => r.json())
// manifest.name          -> "download.marioforever.net static API"
// manifest.generatedAt   -> "2026-08-12T05:58:21.797Z"
// manifest.endpoints     -> [{ id, path, file, count, category }, ...]
// manifest.notes         -> [ ...字段说明 ]

for (const ep of manifest.endpoints) {
  console.log(ep.id, ep.count, ep.path)
}
```

## 通用约定

阅读各端点字段前，先了解以下贯穿全部数据的约定。

### 下载链接对象

所有下载链接都统一为**链接对象**，包含文件名与三种来源：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `fileName` | 字符串 \| null | 在资源站中的原始文件名 |
| `zh` | 字符串 \| null | 社区资源站（中文路径）链接 |
| `en` | 字符串 \| null | 社区资源站（英文路径）链接 |
| `cdn` | 字符串 \| null | 对象存储（Cloudflare R2）链接，通常速度更快 |

需要注意：

- `zh` 与 `en` 指向**同一份文件**，只是资源站的目录命名不同（中文站用中文目录名）。按用户界面语言择一即可。
- MW 作品（`mw.json`）**没有 `en`**，因为 SMWP 作品只有中文资源站路径。
- `cdn` 可能为 `null`（如目标是目录而非单个文件时不兼容 CDN），此时请回退到 `zh`/`en`。
- 所有端点的链接在生成时都**不做 URL 编码**：`fileName` 含中文与空格时会原样拼接，多数 HTTP 客户端与浏览器会自动处理；若你的客户端不处理，请自行 `encodeURI()`。

一个健壮的取链接写法：

```javascript
// 优先 CDN，其次按语言回退到资源站
function pickUrl(item, lan = 'zh') {
  return item.cdn || (lan === 'en' ? item.en : item.zh) || item.zh || null
}
```

### 失效链接标记

作者提供的发布链接（`source`）与官方下载链接（`download`）可能已失效。数据中不会删除它们，而是用布尔字段标注：

```json
"source":   { "url": "https://...", "urlAlt": null, "invalid": false, "invalidAlt": false },
"download": { "url": "https://...", "urlAlt": null, "code": "abcd", "invalid": true, "invalidAlt": false }
```

- `url` / `urlAlt`：`source` 的 `urlAlt` 为另一语言的发布链接；`download` 的 `urlAlt` 为备用下载链接——中英文页面均会展示 `url` 与 `urlAlt`，但国内作品（MF `type: chinese`）在英文页面会交换两者展示顺序（`urlAlt` 在前），国外作品顺序不变
- `invalid` / `invalidAlt`：对应链接是否已失效，展示时建议置灰或标注
- `download.code`：网盘提取码/密码（若需要）

### 图片

`images` 对象给出该作品 `public/data/` 目录下的图片路径，均为**站点根相对路径**，需拼接站点域名后使用：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `dir` | 字符串 | 该作品的数据目录名（可能为空） |
| `all` | 字符串数组 | 目录下所有图片 |
| `title` | 字符串 \| null | 标题图（`title.*`） |
| `logo` | 字符串 \| null | Logo 图（`logo.*`） |
| `showcase` | 字符串数组 | 截图（`showcase_*`），已按自然序排序 |

```javascript
const BASE = 'https://download.marioforever.net'
const cover = game.images.title || game.images.logo || game.images.all[0]
const src = cover ? BASE + cover : null   // "/data/mf-games/Fear the Eye/title.webp"
```

### 描述

作品描述有两个来源，用途不同：

- **`inlineDescription`** — 列表中的一句话简短说明，直接内联在数据里。
  - MF：`{ zh, en }` 对象
  - MW / Assets：字符串或 `null`
- **`description`** — 长篇 Markdown 详细介绍，**内容已内联**，无需再发请求。

```json
"description": {
  "default": "_**⚠This level contains flashing...**_\r\n\r\nSubmission to PK!MF...",
  "zh": null,
  "en": null,
  "files": ["/data/mf-games/Fear the Eye/description.md"]
}
```

| 字段 | 说明 |
| --- | --- |
| `default` | `description.md` 的内容（语言中立，优先使用） |
| `zh` | `description_zh.md` 的内容 |
| `en` | `description_en.md` 的内容 |
| `files` | 上述文件的源路径，供溯源 |

读取顺序建议 `default` → 当前语言 → 另一语言：

```javascript
function getDescription(item, lan = 'zh') {
  const d = item.description
  return d.default || (lan === 'zh' ? d.zh : d.en) || d.zh || d.en || null
}
```

得到的是 Markdown 源码，需自行渲染（本站使用 `markdown-it`）。

### 日期

所有日期均为 `YYYY-MM-DD` 格式的字符串（如 `"2026-08-12"`），可能为 `null`。可直接字符串比较排序，或 `new Date(str)` 解析。

## 端点详解

### `/api/mf.json` — Mario Forever 同人作品

顶层字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `category` | 字符串 | 固定为 `"mf"` |
| `name` | 字符串 | 作品原始名称 |
| `nameAlt` | 字符串 \| null | 英文名/译名 |
| `aliases` | 字符串数组 | 别名、缩写，便于搜索 |
| `author` | 字符串数组 | 作者（始终为数组，即使只有一人） |
| `authorAlt` | 字符串数组 \| null | 作者英文名 |
| `firstAuthor` | 字符串 \| null | 用于构建资源站路径的主作者名 |
| `type` | 字符串 | `chinese`（国内作品）/ `international`（国外作品） |
| `software` | 字符串 | 制作软件，游戏级别：`mmf`/`godot`/`gamemaker`/`flash`/`other`；未指定时默认 `"mmf"` |
| `tags` | 字符串数组 | 标签，如 `Single Level`、`Speedrun`、`Horror` |
| `wiki` | 对象 | `{ zh, en }` Wiki 链接 |
| `homepage` | 对象 | `{ zh, en, repo }` 主页 / 源码仓库链接 |
| `inlineDescription` | 对象 | `{ zh, en }` 简短说明 |
| `versions` | 数组 | 全部版本，见下 |
| `currentVersion` | 字符串数组 | **当前（最新）版本名列表**，见下 |
| `currentVersionAlt` | 字符串 \| null | 顶层 `ver_alt` 字段（作品首个版本对应的英文名/别名，通常与当前版本一致） |
| `images` | 对象 | 见「图片」 |
| `description` | 对象 | 见「描述」 |

`versions` 中每个版本：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `version` | 字符串 | 版本名（可能为空字符串，表示单版本作品） |
| `versionAlt` | 字符串 \| null | 版本英文名/别名 |
| `date` | 字符串 \| null | 发布日期 |
| `current` | 布尔 | 该版本是否为当前版本 |
| `software` | 字符串 | 该版本的制作软件：显式指定则用之，否则回退到游戏级 `software`（最终未指定时为 `"mmf"`） |
| `source` | 对象 | 发布链接，见「失效链接标记」 |
| `download` | 对象 | 官方下载链接与提取码（含备用提取码 `codeAlt`） |
| `dataDownload` | 对象 | 数据包（如音乐）的外部下载链接与提取码，见下 |
| `resource` | 对象 | 游戏本体的链接对象 |
| `dataResource` | 对象 | 数据包（如音乐）的链接对象 |
| `repacker` | 字符串 \| null | 重打包者（若为重打包版本） |

`dataDownload` 结构：`{ url, code, invalid }`，与 `download` 类似但无备用链接（仅对应数据包的 `data_download_url`/`data_code`）。注意它与 `dataResource`（资源站/对象存储镜像）并存、来源不同。

关于 **`currentVersion` 是数组**：一个作品可以同时有多个「当前版本」（例如同一作品的 Windows 版与 Android 版并列为最新）。因此该字段列出所有当前版本的名称：

```javascript
// 取出该作品的全部当前版本对象
const currents = game.versions.filter(v => v.current)
// 或按名称
const currents2 = game.versions.filter(v => game.currentVersion.includes(v.version))

// 只要一个代表版本
const primary = game.versions.find(v => v.current) || game.versions[0]
```

`current` 解析规则：
- 存在显式 `current: true` 的版本时，这些版本为当前版本（支持多 current）。
- 无任何显式 `current: true` 时，自动回退为日期最新的版本；但若该最新日期版本已显式 `current: false`，则不再自动标记（此时次新版本也不会被视为 current）。

无版本数据的条目 `currentVersion` 为空数组。

**国外作品（`international`）旧版本归档**：非当前版本（解析后 `current === false`）的 `resource` / `dataResource` 链接（`zh` / `en` / `cdn`）会在文件名前加入 `old-versions/` 指向归档路径（重打包版本与安卓 `.apk` 除外）；`fileName` 字段保留原始文件名。

<details>
<summary>示例条目</summary>

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
        "en": "https://file.marioforever.net/mario-forever/games/chinese-fangames/2026/mfmp_20260709.rar",
        "cdn": "https://mf-cdn.kevinh.wang/mario-forever/games/chinese-fangames/2026/mfmp_20260709.rar"
      },
      "dataResource": { "fileName": null, "zh": null, "en": null, "cdn": null },
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

### `/api/mw.json` — Super Mario Worker Project 作品

SMWP 作品只有中文数据，故链接对象**不含 `en`**，且无 `nameAlt`/`type` 等双语字段。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `category` | 字符串 | 固定为 `"mw"` |
| `name` | 字符串 | 作品名称 |
| `aliases` | 字符串数组 | 别名 |
| `author` | 字符串数组 | 作者（多作者即合作作品） |
| `smwpVer` | 字符串 \| null | 作品使用的 SMWP 版本，如 `v1.7.12`、`MW 4.4` |
| `date` | 字符串 \| null | 发布日期 |
| `hasBgm` | 布尔 | 是否含自定义 BGM |
| `hasBundledSmwp` | 布尔 | 是否已附带 SMWP 本体 |
| `inlineDescription` | 字符串 \| null | 简短说明 |
| `wiki` | 字符串 \| null | Wiki 链接 |
| `homepage` | 字符串 \| null | 主页链接 |
| `source` / `download` | 对象 | 发布链接 / 下载链接 |
| `resource` | 数组 | 作品文件的链接对象**列表**（可能分卷，故为数组） |
| `dataResource` | 数组 | 数据包文件的链接对象列表 |
| `smwp` | 对象 \| null | 运行所需的 SMWP 本体下载 `{ zh, cdn }` |
| `smwpData` | 对象 \| null | SMWP 音乐/数据包下载 `{ zh, cdn }` |
| `images` / `description` | 对象 | 同通用约定 |

`resource` 是数组而非单个对象，因为一个作品可能有多个文件（关卡文件 + 练习模式、分卷压缩包等）：

```javascript
for (const file of level.resource) {
  console.log(file.fileName, file.cdn || file.zh)
}
```

`hasBundledSmwp` 为 `true` 时 `smwp` 为 `null`（作品自带引擎，无需另行下载）。

<details>
<summary>示例条目</summary>

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
      "zh": "https://file.marioforever.net/Mario Worker/吧友作品/玛丽的死对头/A Day Out (Golden Road).smwp",
      "cdn": "https://mf-cdn.kevinh.wang/mw-levels/吧友作品/玛丽的死对头/A Day Out (Golden Road).smwp"
    }
  ],
  "dataResource": [],
  "smwp": {
    "zh": "https://file.marioforever.net/smwp/smwp-1.7.8.7z",
    "cdn": "https://mf-cdn.kevinh.wang/smwp/smwp-1.7.8.7z"
  },
  "smwpData": {
    "zh": "https://file.marioforever.net/smwp/Data.7z",
    "cdn": "https://mf-cdn.kevinh.wang/smwp/Data.7z"
  }
}
```

</details>

### `/api/assets.json` — 创作资源

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `category` | 字符串 | 固定为 `"assets"` |
| `name` / `nameAlt` | 字符串 | 资源名称 |
| `aliases` | 字符串数组 | 别名 |
| `author` | 字符串数组 | 作者 |
| `type` | 字符串 | `engine` 引擎 / `addon` 拓展 / `sprite` 素材 / `effect` 特效 / `tool` 工具 / `mwtool` MW 工具 |
| `path` | 字符串 | 引擎类资源的子目录（仅 `type: engine`） |
| `inlineDescription` | 字符串 \| null | 简短说明 |
| `repo` | 字符串 \| null | 源码仓库 |
| `variants` | 数组 | 变体/版本列表，见下 |
| `currentVariant` | 字符串 \| null | 首个变体名 |
| `currentVersion` | 字符串 \| null | 首个变体的版本号 |
| `image` | 字符串 \| null | 资源配图路径（站点根相对） |

`variants` 中每项：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `variant` | 字符串 \| null | 变体名（如「本体」「特效包」），单一版本时为 `null` |
| `version` | 字符串 \| null | 版本号 |
| `date` | 字符串 \| null | 发布日期 |
| `source` / `download` | 对象 | 发布链接 / 下载链接 |
| `resource` | 数组 | 链接对象列表（一个变体可含多个文件） |

<details>
<summary>示例条目</summary>

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
          "en": "https://file.marioforever.net/Mario Forever/引擎/拓展资源包/%E6%88%AA%E5%9B%BEActive(2026.4.4).mfa",
          "cdn": "https://mf-cdn.kevinh.wang/mario-forever/engines/resource-packs/%E6%88%AA%E5%9B%BEActive(2026.4.4).mfa"
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

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `category` | 字符串 | 固定为 `"softendo"` |
| `name` | 字符串 | 游戏名称 |
| `aliases` | 字符串数组 | 别名 |
| `type` | 字符串 | `mario` / `mff`（Mario Forever Flash）/ `flash` / `non-mario` / `banesoft` |
| `software` | 字符串 \| 数组 | 制作软件，如 `gamemaker`、`flash`、`["flash","mmf"]` |
| `genre` | 字符串数组 | 类型，如 `Puzzle`、`Shmup` |
| `initialYear` | 数字 \| null | 首次发布年份 |
| `isNsmf` | 布尔 | 是否为 New Super Mario Forever（使用特殊下载路径） |
| `versions` | 数组 | 版本列表，见下 |
| `currentVersion` | 字符串 \| null | 首个版本名 |
| `years` | 数字数组 | 涉及的所有年份（升序） |
| `image` | 字符串 \| null | 单张封面图（标题界面或 logo），文件名与游戏名相同，路径如 `/data/softendo/Sonic in Marioland.webp`；无 showcase |

`versions` 中每项：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `version` | 字符串 | 版本名，如 `"2018"`、`"Lite 2011"` |
| `year` | 数字 \| null | 发布年份 |
| `installer` | 数组 | 安装版链接对象列表（通常 0 或 1 项） |
| `portable` | 数组 | 绿色版链接对象列表 |
| `selfextract` | 数组 | 自解压版链接对象列表 |

`portable` / `selfextract` 的每项额外含 `kind` 字段，标明文件形态：`portable`、`exe`、`swf`、`zip`。Flash 类游戏常同时提供 `swf` 与 `exe`：

```javascript
for (const v of game.versions) {
  for (const item of [...v.installer, ...v.portable, ...v.selfextract]) {
    console.log(v.version, item.kind ?? 'installer', item.cdn || item.en)
  }
}
```

三者统一为数组，可用同一套逻辑遍历；不存在对应形态时为空数组。

### `/api/original-mf.json` — 原版 Mario Forever

顶层直接是版本数组（无作品层级）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `version` | 字符串 | 版本名，如 `v4.4`、`Advance v4.41`、`The Lost Map` |
| `date` | 字符串 \| null | 发布日期 |
| `rating` | 字符串 \| null | 星级推荐度，如 `★★★★☆` |
| `ratingScore` | 数字 \| null | 星级的数字化表示，1~10 |
| `installer` | 对象 | 安装版，见下 |
| `portable` | 对象 | 绿色版链接对象 |

`ratingScore` 换算规则：`★` 计 2 分，`☆`（半星）计 1 分，满分 10。便于排序与比较：

| rating | score | | rating | score |
| --- | --- | --- | --- | --- |
| ☆ | 1 | | ★★★ | 6 |
| ★ | 2 | | ★★★☆ | 7 |
| ★☆ | 3 | | ★★★★ | 8 |
| ★★ | 4 | | ★★★★☆ | 9 |
| ★★☆ | 5 | | ★★★★★ | 10 |

`installer` 在通用链接对象之外，额外含两个布尔标记：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `toolbar` | 布尔 | 安装程序是否捆绑 Mario Forever Toolbar（广告插件）。为 `true` 时建议提示用户在安装时取消勾选，或优先使用绿色版 |
| `nsmf` | 布尔 | 是否使用 New Super Mario Forever 路径格式（影响 `installer` 的链接，不影响 `portable`） |

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
    "en": "https://file.marioforever.net/mario-forever/games/original-mf/installer/Mario Forever 5.0.exe",
    "cdn": "https://mf-cdn.kevinh.wang/mario-forever/games/original-mf/installer/Mario Forever 5.0.exe"
  },
  "portable": {
    "fileName": "Mario Forever 5.0.7z",
    "zh": "https://file.marioforever.net/Mario Forever/Mario Forever 全版本下载/绿色版/Mario Forever 5.0.7z",
    "en": "https://file.marioforever.net/mario-forever/games/original-mf/portable/Mario Forever 5.0.7z",
    "cdn": "https://mf-cdn.kevinh.wang/mario-forever/games/original-mf/portable/Mario Forever 5.0.7z"
  }
}
```

某些版本没有安装版或绿色版，此时 `fileName` 与三个链接均为 `null`，但对象结构保持完整，无需判空分支。

## 使用示例

### 搜索作品

名称、英文名与别名都应参与匹配：

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

### 按标签与类型筛选

```javascript
// 国内作品中的单关卡作品
const singleLevels = games.filter(g =>
  g.type === 'chinese' && g.tags.includes('Single Level')
)
```

### 按发布日期排序

日期在版本层级，取其当前版本的日期：

```javascript
function latestDate(game) {
  const dates = game.versions.map(v => v.date).filter(Boolean)
  return dates.sort().at(-1) || ''
}

const recent = [...games].sort((a, b) => latestDate(b).localeCompare(latestDate(a))).slice(0, 20)
```

### 取某作品的全部下载方式

```javascript
function collectDownloads(game, lan = 'zh') {
  const out = []
  for (const v of game.versions) {
    // 官方下载链接
    if (v.download.url && !v.download.invalid) {
      out.push({ version: v.version, kind: '官方', url: v.download.url, code: v.download.code })
    }
    // 资源站 / 对象存储
    for (const res of [v.resource, v.dataResource]) {
      if (!res.fileName) continue
      if (res.cdn) out.push({ version: v.version, kind: '对象存储', url: res.cdn })
      const site = lan === 'en' ? res.en : res.zh
      if (site) out.push({ version: v.version, kind: '资源站', url: site })
    }
  }
  return out
}
```

### 统计某作者的作品

```javascript
const byAuthor = new Map()
for (const g of games) {
  for (const a of g.author) {
    byAuthor.set(a, (byAuthor.get(a) || 0) + 1)
  }
}
const top = [...byAuthor].sort((a, b) => b[1] - a[1]).slice(0, 10)
```

### 合并多个端点

```javascript
const BASE = 'https://download.marioforever.net/api'
const [mf, mw, assets] = await Promise.all(
  ['mf', 'mw', 'assets'].map(id => fetch(`${BASE}/${id}.json`).then(r => r.json()))
)
// 每条数据都带 category 字段，合并后仍可区分来源
const all = [...mf, ...mw, ...assets]
```

### Python 示例

```python
import requests

BASE = 'https://download.marioforever.net/api'
games = requests.get(f'{BASE}/mf.json').json()

# 找出带对象存储链接的当前版本，并打印下载地址
for g in games:
    for v in g['versions']:
        if not v['current']:
            continue
        res = v['resource']
        if res['cdn']:
            print(g['name'], v['version'] or '(单版本)', res['cdn'])
```

## 注意事项

**缓存与更新** — API 随站点构建生成，数据更新频率与站点部署一致。建议客户端缓存并通过 `index.json` 的 `generatedAt` 判断是否需要刷新，避免反复拉取完整数据。

**文件体积** — `mf.json` 内联了全部描述文本，体积较大（数 MB）。服务端已启用 gzip/brotli 压缩，正常 HTTP 客户端会自动解压。若只需少量字段，请在获取后自行裁剪，或考虑仅在需要时加载。

**没有查询参数** — 静态文件不支持 `?category=` 之类的服务端筛选，所有筛选、排序、分页都需在客户端完成。

**字段可能为 null** — 数据由社区协作维护，多数字段是可选的。请始终做空值判断，不要假定某字段一定存在。

**结构可能演进** — 本 API 目前未做版本化。若字段结构发生变化，会在仓库提交记录与本文档中说明。生产环境使用建议锁定自建副本，或关注仓库更新。

**数据来源与许可** — 数据来自 `public/data/` 下的 YAML 列表，由 Mario Forever 社区共同维护。项目以 MIT 协议开源，欢迎在协议范围内使用；引用数据时请注明来源为 download.marioforever.net。

## 本地生成

API 由 `scripts/generate-api.js` 生成，输出到 `public/api/`：

```bash
bun run generate-api
```

`bun run build` 会自动执行该步骤，顺序为：生成图片索引 → 生成 API → Vite 构建 → 压缩产物。

如需新增字段或端点，请修改 `scripts/generate-api.js`。注意其中的下载链接构建逻辑镜像了 `src/util/` 下的 `GameUtil.js`、`SoftendoUtil.js`、`AssetUtil.js` 与 `src/components/OriginalMfTable.vue`，修改路径规则时请保持两侧一致。
