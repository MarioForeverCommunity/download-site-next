# download.marioforever.net

**English** | [简体中文](README.zh-cn.md)

> [!NOTE]
> This page is a translation of the Chinese version. If you spot any inaccuracies, please help us improve it.

This repository is the source code for [download.marioforever.net](https://download.marioforever.net/). It collects and organizes information about Mario Forever, its fangames, and Super Mario Worker Project levels. [Visit the site](https://download.marioforever.net/) to find the games you are looking for!

## Credits

This catalog would not exist without the efforts of many contributors in the Mario Forever community. We would like to sincerely thank:

- [Fisjokas](https://www.youtube.com/@Tomek839839) - for providing numerous links and resources between 2022 and 2024 that greatly enriched the catalog and helped uncover many rare, valuable files.
- [Classic Yoshi 666](https://www.youtube.com/@ClassicYoshi666) - for preserving many works in his own archives, which served as an important foundation for this catalog.
- wufeiling (aka 劝君更尽一碗翔) - for sharing several games that might otherwise have been lost.
- SuperMarioFan01 and ChloePrime - for privately providing several scattered game files that helped fill gaps in the catalog.
- Happy Mario 9 - for providing several Chinese fangames released in 2015.
- Green Sweet and WSW - for collecting a number of fangame links during the early days of this site (2020–2021), which helped shape the foundation of the catalog.
- JUE13 - for providing several repackaged versions of fangames.
- TwoSpacesSG and Zik the Green - for providing numerous Softendo legacy games.

We are grateful to everyone listed above, as well as many other community members whose contributions, large or small, have helped preserve the history of Mario Forever fangames. If any contributor was unintentionally omitted, please forgive us - we thank you all the same.

## Q & A

### What is the difference from file.marioforever.net?

Although file.marioforever.net also archives game resources and provides download links, it is limited by the [OpenList](github.com/OpenListTeam/OpenList) mechanism: it only supports filename searches (not game-name searches), and offers no convenient way to filter, sort, or browse historical versions. In addition, this catalog stores related information for many games, such as release links, Wiki links, and related videos.

Moreover, the files on file.marioforever.net are uploaded and maintained by [Newlife2017](https://github.com/KHwang9883). By contributing to this repository through pull requests, you can help improve the resource list here - and, in turn, help improve file.marioforever.net as well!

### Why is there no Mario Worker Remake content?

Mario Worker Remake levels are maintained by an official, comprehensive [database](https://marioworkerdatabase.altervista.org/), where players can search for and download games quite conveniently. Mario Forever and Super Mario Worker Project games, however, are published in varied and scattered ways, so we are building this list to make it easier for players to discover, search for, and download them.

## Help Us Improve the Catalog!

If a game or version is missing, some information is incorrect, or you would like to add your video to a game's related-video list, you can help in any of these ways:

- Contact [Newlife2017](https://github.com/KHwang9883) directly;
- [Open an Issue](https://github.com/MarioForeverCommunity/download-site-next/issues) with the details. If you have an account in the Chinese MF community, you can also post in this [feedback thread](https://www.marioforever.net/thread-1635-1-1.html);
- If you have a GitHub account, you can [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) this repository, update the game list, and contribute directly via a [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request). You do not need to install complex tools like Git or master version control - everything can be done through GitHub's web-based fork, edit, and pull request features! Just read the instructions below to learn how to edit the list correctly.

## Guide for Editing the Lists

This repository contains **four types of lists**: Mario Forever games, Super Mario Worker Project levels, development assets, and Softendo games. Since the field structures differ slightly between them, please read the section for each list carefully before editing.

### Mario Forever Game List

The Mario Forever game list is written in YAML (a human-friendly data format) and lives in `public/data/list-mf.yaml`. Some games have multiple versions with different download links, so single-version and multi-version entries use slightly different formats. Here is a single-version example (*note: for demonstration purposes, some descriptions and fields do not match any real game exactly*):

```yaml
- game: Mario Forever - A Fabulous Space
  game_alt:
  alias:
  - AFS
  tag:
  - Single Level
  author: gurcd
  author_alt: CD
  type: chinese
  software: mmf
  wiki_zh_url:
  wiki_en_url:
  homepage_zh:
  homepage_en:
  ver: v3.0
  ver_alt: v3.0
  date: 2017-06-26
  source_url: https://some.website.com
  source_url_alt:
  download_url: https://another.website.com
  code: abcd
  download_url_alt:
  repacker: 克洛伊Prime
  repacker_alt: Koopa4
  file_name: MF A Fabulous Space V3.0（收藏版）.7z
  file_url:
```

And here is a multi-version example:

```yaml
- game: 'Mario Forever: Lunar New Year 2022 - The Ultimate Voyage'
  game_alt:
  alias:
  - LNY2022
  - LNY 2022
  author: Forever Team
  author_alt:
  description_zh: 由 JoséLPK.CF&MF 主导的 2022 年新年作品。
  description_en: A new year special game lead by JoséLPK.CF&MF.
  type: international
  wiki_zh_url:
  wiki_en_url:
  video_zh:
  - WSW 解说: https://space.bilibili.com/11239472/channel/collectiondetail?sid=544483
  ver:
  - v3.0:
      ver_alt:
      date: 2024-03-17
      source_url: https://www.youtube.com/watch?v=PqlO7k9lYvA
      source_url_alt:
      download_url: https://www.mediafire.com/file/7emepxlejgbblei/MF_LNY_2022_v3.0.rar/file
      code:
      download_url_alt:
      file_name: MF LNY 2022 v3.0.rar
      file_url:
  - v2.0:
      ver_alt:
      date: 2023-01-22
      source_url: https://www.youtube.com/watch?v=lRDHwy7Pj84
      source_url_alt:
      download_url: https://www.mediafire.com/file/mfvo2ot63fuecqq/
      code:
      download_url_alt:
      file_name: LNY 2022 v2.0.rar
      file_url:
```

The fields below are explained next. Because the site is available in both Chinese and English, we use the `_alt`, `_zh`, and `_en` suffixes to support multiple languages.

| Field Name | Required | Type | Field Description |
| --- | --- | --- | --- |
| `game` | **Yes** | String | The game's original name. Use the language and name from the time of release, avoiding aliases, abbreviations, and translations. |
| `game_alt` | No | String | The game's English name or translation (if the game name is in Chinese). If the author provided an English name, prefer it. <br>The English page prioritizes the `_alt` name, while the original-language name can still be found through filtering. |
| `alias` | No | String List | Abbreviations, aliases, translations in other languages, or easily confused names, to help users search for the game. <br>Please only add aliases that a meaningful number of players recognize or that the author specifies. |
| `tag` | No | String List | Tags used for filtering and display, e.g. `Single Level`, `Horror`, `Speedrun`. |
| `author` | **Yes** | String | The author's name. |
| `author_alt` | No | String | The author's English name (if the name is in Chinese). |
| `author_alias` | No | String | The author name used when building Community File Hub paths (international games only). |
| `description_zh` | No | String | The description shown on the Chinese page (when the list page needs extra explanation). |
| `description_en` | No | String | The description shown on the English page (when the list page needs extra explanation). |
| `type` | **Yes** | String | Used by the filter feature. <br>`chinese`: games made by Chinese community members. <br>`international`: games made by international Mario Forever community members. |
| `software` | No | String | The software used to create the game. Defaults to `mmf` if unspecified. Supported values: <br>`mmf`: Multimedia Fusion / Clickteam Fusion <br>`godot`: Godot Engine <br>`gamemaker`: GameMaker <br>`flash`: Flash <br>`other`: Other |
| `wiki_zh_url` | No | String | The game's page in the Chinese Mario Forever Wiki. |
| `wiki_en_url` | No | String | The game's page in the English Mario Forever Wiki. |
| `homepage_zh` | No | String | The game's Chinese homepage link. |
| `homepage_en` | No | String | The game's English homepage link. |
| `video_zh` | No | Dictionary List | Videos about the game uploaded by other players, hosted on Chinese pages or primarily in Chinese (gameplay, commentary, fan creations, etc.). <br>Multiple entries allowed; each entry follows the format `- Video Title: Video Link`. |
| `video_en` | No | Dictionary List | Videos about the game uploaded by other players, hosted on English pages or primarily in English (gameplay, commentary, fan creations, etc.). <br>Multiple entries allowed; each entry follows the format `- Video Title: Video Link`. |
| `repo` | No | String | The game's source code repository URL. |
| `ver` | No | String (Single Version) <br>Version List (Multiple Versions) | The version name(s) of the game. Different language versions, updates, branch versions (e.g. hard and easy), or single-world versions of a collection are all treated as distinct versions. <br>For single-version entries (or when only one version is listed), `ver` may be empty or hold the current version name. <br>For multi-version entries, `ver` is a list of dictionaries keyed by version name, with each value being the version's fields. |

The following fields apply to a specific version. For single-version games, write them directly on the game entry; for multi-version games, fill them in for **each** version inside the version list, as shown in the example above.

| Field Name | Required | Type | Field Description |
| --- | --- | --- | --- |
| `ver_alt` | No | String | If the version name is in Chinese, its English name can be given here. |
| `date` | **Yes** | Date | The release date of the game or version. Use the `YYYY-MM-DD` format for software parsing. |
| `current` | No | Boolean | Mark this version as the "current version". When several versions are equally current (e.g. a Windows build and an Android build), set `true` on all of them. |
| `source_url` | No | String | The **release link** of the game (not the download link), such as a forum release post or a YouTube release video. <br>Official release videos belong here and should not be duplicated under `video_zh` or `video_en`. <br>If a link has expired, prefix it with a half-width tilde `~` (same for the other links below). |
| `source_url_alt` | No | String | If the game is released on both Chinese and English sites, put the Chinese link in `source_url` and the English link in `source_url_alt`, so each language displays its corresponding link. <br>If the game was only released on one site, fill in only `source_url`; leave it empty if there is no release link (e.g. released via messaging apps or Discord). |
| `download_url` | No | String | The **official download link** provided by the author. |
| `code` | No | String | The password/extraction code, if the download page requires one. |
| `code_alt` | No | String | The password/extraction code for the `download_url_alt` page. |
| `download_url_alt` | No | String | Another official download link for the game. Both `download_url` and `download_url_alt` are shown on the Chinese and English pages; for games made by Chinese community members (`type: chinese`), the English page swaps their display order (`download_url_alt` first), while international games keep the original order. |
| `repacker` | No | String | If this version is a repackage, the name of the person who repackaged the files. |
| `repacker_alt` | No | String | The English name of the `repacker` (if the repackager's name is in Chinese). |
| `file_name` | No | String | The file name on the Community File Hub (file.marioforever.net). Usually filled in by the site maintainer. |
| `file_url` | No | String | The full Community File Hub link. Usually filled in by the site maintainer. |
| `data_download_url` | No | String | If the game ships with a separate data package (e.g. music), the download link for it. |
| `data_code` | No | String | The password/extraction code for the data package's download page. |
| `data_file_name` | No | String | The data package's file name on the Community File Hub. Usually filled in by the site maintainer. |
| `data_file_url` | No | String | The data package's full Community File Hub link. Usually filled in by the site maintainer. |

### Super Mario Worker Project Game List

The Super Mario Worker Project game list is written in YAML and lives in `public/data/list-mw.yaml`. Since SMWP is mainly popular within the Chinese MF community, this list only powers the Chinese page and does not offer an English version. Here is an example entry (*note: for demonstration purposes, some descriptions and fields do not match any real entry exactly*):

```yaml
- game: A Day Out(S2简化版)
  author: 玛丽的死对头
  smwp_ver: v1.7.9
  date: 2023-07-01
  description: 为 Welcome back to Marioworker Bar 2022 中的一个作品的简化版本。
  wiki_zh_url: https://zh.wiki.marioforever.net/wiki/A_Day_Out
  source_url: https://www.marioforever.net/thread-2748-1-1.html
  download_url: https://pan.baidu.com/s/1NQUXTDr8uOmvK384-WWT-g
  code: xbr2
  file_name: A Day Out(S2简化版).smwp
  file_url:
```

The fields are explained below.

| Field Name | Required | Type | Field Description |
| --- | --- | --- | --- |
| `game` | **Yes** | String | The name of the level/work. |
| `alias` | No | String List | Abbreviations or aliases, to make the work easier to find. |
| `author` | **Yes** | String | The author's name. Multiple authors are supported (string list). |
| `author_alias` | No | String | The author name used in Community File Hub paths (usually same as `author`, for author names containing non-ASCII/special characters). |
| `smwp_ver` | No | String | The SMWP version used by the work, e.g. `v1.7.12`. May be left empty for complex cases (e.g. multiple SMWP versions). |
| `date` | **Yes** | Date | The release date. Use the `YYYY-MM-DD` format. |
| `description` | No | String | The description shown **on the list page**. |
| `video` | No | Dictionary List | Related videos; each entry follows the format `- Video Title: Video Link`. |
| `source_url` | No | String | The release post, release video, etc. <br>If a link is invalid, prefix it with a half-width tilde `~` (same for the other links below). |
| `wiki_zh_url` | No | String | The work's page in the Chinese Mario Forever Wiki. |
| `homepage` | No | String | The work's homepage link. |
| `download_url` | No | String | The download link. |
| `code` | No | String | The password/extraction code, if the download page requires one. |
| `has_bundled_smwp` | No | Boolean | Whether the work bundles SMWP. |
| `has_bgm` | No | Boolean | Whether the work includes custom BGM. |
| `file_name` | No | String or String List | The file name(s) on the Community File Hub. A single work may have multiple files (e.g. a level file plus a practice mode, or split archives), in which case use a list. Usually filled in by the site maintainer. |
| `file_url` | No | String | The full Community File Hub link. Usually filled in by the site maintainer. |
| `data_download_url` | No | String | The download link for a data package (e.g. music). |
| `data_code` | No | String | The password/extraction code for the data package's download page. |
| `data_file_name` | No | String | The data package's file name on the Community File Hub. Usually filled in by the site maintainer. |
| `data_file_url` | No | String | The data package's full Community File Hub link. Usually filled in by the site maintainer. |

### Assets List

The Assets list is written in YAML and lives in `public/data/list-assets.yaml`. It collects resources for Mario Forever development, including engines, addons, sprites, effects, and tools. Here is an example:

```yaml
- name: Super Mario Ultra Engine
  alias:
  - UE
  author: dasasdhba
  type: engine
  description:
  image: UE.webp
  source_url: https://www.marioforever.net/thread-383-1-1.html
  download_url: https://www.lanzoui.com/b0bd46ji
  code:
  path: 其他MMF引擎
  variants:
  - 本体:
      ver: 200309v1
      date: 2020-03-09
      file_name: Super Mario Ultra Engine 200309v1.7z
  - 特效包:
      ver:
      date: 2019-07-03
      file_name: Ultra Engine 特效包.7z
- name: Rainbow Engine 碰撞检测增强包
  author: dasasdhba
  type: addon
  description:
  image:
  source_url: https://www.marioforever.net/thread-650-1-1.html
  download_url: https://wwbtb.lanzout.com/b0w9p5p4b
  code: 8vf6
  ver:
  date: 2020-08-13
  file_name: RE 碰撞检测增强包.mfa
- name: MW全图机器
  author: 无视我233
  type: mwtool
  description:
  image:
  source_url: https://zh.wsw233.com/tools/mw_gen_map
  download_url:
  code:
  ver:
  date: 2021-10-10
  file_name:
```

The fields are explained below.

| Field Name | Required | Type | Field Description |
| --- | --- | --- | --- |
| `name` | **Yes** | String | The name of the asset. |
| `alias` | No | String List | Abbreviations or aliases of the asset. |
| `author` | **Yes** | String | The author's name. Multiple authors are supported. |
| `type` | **Yes** | String | Asset type: <br>`engine`: Game engines/templates <br>`addon`: Extension packs/addons <br>`sprite`: Graphics/sprites <br>`effect`: Visual effects/shaders <br>`tool`: General tools <br>`mwtool`: Mario Worker tools |
| `description` | No | String | Description of the asset. |
| `image` | No | String | Image file name for the asset. |
| `source_url` | No | String | The release link. <br>If a link is invalid, prefix it with a half-width tilde `~`. |
| `download_url` | No | String | The download link. |
| `download_url_alt` | No | String | An alternative download link. |
| `code` | No | String | Extraction code for the download. |
| `code_alt` | No | String | Extraction code for the alternative download link. |
| `repo` | No | String | Source code repository URL. |
| `ver` | No | String | Version number. |
| `date` | **Yes** | Date | The release date. Use the `YYYY-MM-DD` format. |
| `file_name` | No | String | The file name on the Community File Hub. Usually filled in by the site maintainer. |
| `path` | No | String | Subdirectory path under the engines folder (only for `type: engine`). |

For assets with multiple variants (e.g. different versions or editions), use the `variants` field:

```yaml
variants:
- Variant Name:
    ver: version_number
    date: YYYY-MM-DD
    file_name: filename.ext
```

Each variant can have its own `ver`, `date`, and `file_name`. If not specified in a variant, the parent entry's `download_url`, `code`, and `source_url` are inherited.

### Softendo / Buziol Games List

The Softendo games list is written in YAML and lives in `public/data/list-softendo.yaml`. These are games created by Buziol Games (Softendo). Here is an example:

```yaml
- game: Mario Forever Block Party
  alias:
  - MFBP
  type: mario
  software: gamemaker
  ver:
  - "2018":
      year: 2018
      installer: Mario Forever Block Party (2018).exe
      portable: Mario Forever Block Party (2018).zip
  - "2011":
      year: 2011
      installer: Mario Forever Block Party (2011, with toolbar).exe
      portable: Mario Forever Block Party (2011).zip
- game: Mario Forever Flash
  type: mff
  ver:
  - "2011":
      year: 2011
      installer: Mario Forever Flash (2011, with toolbar).exe
      portable:
        exe: Mario Forever Flash (2011).exe
  - "2009":
      year: 2009
      installer: Mario Forever Flash (2009).exe
      portable:
        exe: Mario Forever Flash (2009).exe
        swf: Mario Forever Flash.swf
- game: New Super Mario Forever
  alias:
  - NSMF
  type: mario
  nsmf: true
  software: gamemaker
  ver:
  - "2015-03-03":
      year: 2015
      installer: New Super Mario Forever (2015-03-03).exe
      portable: New Super Mario Forever (2015-03-03).zip
      image: New Super Mario Forever.webp
```

The fields are explained below.

| Field Name | Required | Type | Field Description |
| --- | --- | --- | --- |
| `game` | **Yes** | String | The name of the game. |
| `alias` | No | String List | Abbreviations or aliases of the game. |
| `type` | **Yes** | String | Game type: `mario` (Mario games), `mff` (Mario Forever Flash), `flash` (other Flash games), `non-mario` (non-Mario games), `banesoft` (Banesoft games). |
| `software` | No | String | The software used to create the game. For `flash`/`mff` types, defaults to `flash`, or `["flash", "mmf"]` when both exe and zip exist. |
| `nsmf` | No | Boolean | Mark as a New Super Mario Forever game (uses special download URLs). |
| `initial_year` | No | Number | The year the game was first released. |
| `ver` | No | Version List | The version list. Each version is a dictionary keyed by version name. |

Version fields:

| Field Name | Required | Type | Field Description |
| --- | --- | --- | --- |
| `year` | **Yes** | Number | Release year. |
| `installer` | No | String | Installer file name. |
| `portable` | No | String or Object | Portable version. Can be a plain file name, or an object with `exe`/`swf`/`zip` keys. Arrays are supported for multiple files. |
| `image` | No | String | Image file name for this specific version. |

## Static JSON API

This site also provides a **static JSON API** containing every work's parameters, Community File Hub download links, image paths, and description content. It is suitable for third-party development, data analysis, or hosting your own mirror.

The API base URL is `https://download.marioforever.net/api/`, with the following endpoints:

| Endpoint | Content |
| --- | --- |
| `/api/index.json` | Manifest listing all endpoints and the generation time |
| `/api/mf.json` | Mario Forever fangames |
| `/api/mw.json` | Super Mario Worker Project levels |
| `/api/assets.json` | Development assets |
| `/api/softendo.json` | Softendo / Buziol Games |
| `/api/original-mf.json` | All original Mario Forever versions |

Since these are static files, a plain GET is all you need - no authentication and no rate limits:

```javascript
const games = await fetch('https://download.marioforever.net/api/mf.json').then(r => r.json())
console.log(games.length)
```

See the [API documentation](API.md) for the full field reference and usage examples.

## Help Maintain and Further Develop

Programmers are welcome to help improve this project through [pull requests](https://github.com/MarioForeverCommunity/download-site-next/pulls). To keep the live site stable, all changes other than list updates should be committed to the `next` branch of this repository.

This project is open source under the MIT license. You are free to modify and deploy it within the scope of the license.
