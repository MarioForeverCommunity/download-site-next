# download.marioforever.net

**English** | [简体中文](README.zh-cn.md)

> [!NOTE]  
> This page is currently translated by machine from the Chinese version. Please help us improve the quality of the document.

This repository is the source code for [download.marioforever.net](https://download.marioforever.net/) website. It stores and collects information about Mario Forever, its fangames, and Super Mario Worker Project games. [Visit the site](https://download.marioforever.net/) to find the games you want!

Special thanks to [Tomek839839](https://www.youtube.com/@Tomek839839) and [Classic Yoshi 666](https://www.youtube.com/@ClassicYoshi666) for providing several download links!

## Q & A

### What's the difference from file.marioforever.net?

Although file.marioforever.net also archives game resources and provides download links, it is limited by the [AList](https://github.com/alist-org/alist) mechanism, allowing only filename searches instead of game name searches, and lacks convenient filtering, sorting, and historical version searching for games. Additionally, this repository includes related information about several games, such as release links, Wiki links, and related videos.

Moreover, the games in file.marioforever.net are uploaded and maintained by [Newlife2017](https://github.com/KHwang9883); in this repository, you can help improve the resource list through pull requests, thereby contributing to the improvement of file.marioforever.net as well!

### Why isn't there any content related to Mario Worker Remake?

Mario Worker Remake levels are maintained by an official and comprehensive [database](https://marioworkerdatabase.altervista.org/), allowing players to search for and download games quite conveniently. However, Mario Forever and Super Mario Worker Project games are published in various and scattered ways, so we are trying to establish a game list to facilitate players in understanding, searching for, and downloading them.

## Help Us Improve the List!

If there are missing games or versions in the list, incorrect information, or if you want to add your videos to the related video list of a game, you can help us improve the game list in the following ways:
- Contact [Newlife2017](https://github.com/KHwang9883) for feedback;
- [Submit an Issue](https://github.com/MarioForeverCommunity/download-site-next/issues) and be detailed. If you have a Chinese MF community account, you can post in this [thread](https://www.marioforever.net/thread-1635-1-1.html);
- If you have a GitHub account, you can [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) this repository, update the game list, and directly contribute to this repository through a [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request). You don't need to download complex software like Git or have professional knowledge of version control. You can complete these operations using the fork, edit, and pull request functions on GitHub webpage! All you need to do is read the following instructions to learn how to edit the content in the game list correctly.

## Guide for Editing the List

This repository includes lists of Mario Forever and Super Mario Worker Project games. The compositions of the two lists have slight differences, so please carefully read the documentation for each list to understand how to edit them correctly.

### Mario Forever Game List

The Mario Forever game list is written in yaml (a data format that is easy for humans to read and edit) and is located in `public/lists/list.yaml`. Some games may have multiple versions with different download links, so there is a slight difference in the format of single-version and multi-version games. Here is an example of a single-version game (*Please note, for demonstration purposes, some descriptions and actual game information are not exactly the same*):

```yaml
- game: Mario Forever - A Fabulous Space
  game_alt:
  alias:
  - AFS
  author: gurcd
  author_alt: CD
  type: repacked
  wiki_zh_url:
  wiki_en_url:
  ver: v3.0
  ver_alt: v3.0 (withdrawn)
  date: 2017-06-26
  source_url: https://some.website.com
  source_url_alt:
  download_url: https://another.website.com
  code: abcd
  download_url_alt:
  repacker: 克洛伊Prime
  repacker_alt: Koopa4
  source_url:
  source_url_alt:
  file_name: MF A Fabulous Space V3.0（收藏版）.7z
  file_url:
```

Here is an example of a multi-version game:

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
      file_name: old-versions/LNY 2022 v2.0.rar
      file_url:
```

Below are the meanings of each field. Since the site includes both Chinese and English versions, we use `_alt`, `_zh`, `_en` fields for multi-language support.

| Field Name | Required | Type | Field Description |
| --- | --- | --- | --- |
| `game` | **Yes** | String | The original name of the game. Please use the language and name used at the time of the game's release, while avoiding aliases, abbreviations, and translations. |
| `game_alt` | No | String | The English name or translation of the game in English (if the game name is in Chinese). If the author provided an English name for the game, please try to use the name provided by the author. <br>The English page will prioritize the name with the _alt field, and the original language name can be retrieved through the filter function. |
| `alias` | No | String List | Abbreviations, aliases, translations in other languages, or frequently confused names of the game, to facilitate users to better search for this game.  <br>Please try to add aliases or author-specified game abbreviations and translations that are recognized and used by a certain number of players. |
| `author` | **Yes** | String | The name of the author. |
| `author_alt` | No | String | The English name of the author (if the author's name is in Chinese). |
| `description_zh` | No | String | The description of the game on the Chinese page (if there is content that needs to be explained on the list page). |
| `description_en` | No | String | The description of the game on the English page (if there is content that needs to be explained on the list page). |
| `type` | **Yes** | String | Supports three fields for filtering function retrieval: <br>`chinese`: Games made by Chinese players. <br>`international`: Games made by international Mario Forever players. <br>`repacked`: Games that are originally published in either Chinese or international community, with the original download link invalid, and repackaged and uploaded by players other than the author. Note that there are special fields that need to be filled for this type of game. |
| `wiki_zh_url` | No | String | The link of the game in the Chinese Mario Forever Wiki. |
| `wiki_en_url` | No | String | The link of the game in the English Mario Forever Wiki. |
| `video_zh` | No | Dictionary List | Videos related to the game uploaded by other players, located on Chinese pages or mainly in Chinese, such as gameplay videos, commentaries, and secondary creations. <br>There are multiple entries, and each entry should follow the format `- Video Title: Video Link`. |
| `video_en` | No | Dictionary List | Videos related to the game uploaded by other players, located on English pages or mainly in English, such as gameplay videos, commentaries, and secondary creations. <br>There are multiple entries, and each entry should follow the format `- Video Title: Video Link`. |
| `ver` | No | String (Single Version) <br>Version List (Multiple Versions) | The version name of the game. Generally, different language versions of a game, different updates, different branch versions (such as difficult and easy versions), and a single world version of a collection are considered different versions of a game. <br>For single-version or games with only one version included in the list, ver can be empty or the name of the current version. <br>For multi-version games, ver needs to be a dictionary list, with dictionary names as version names, and the value of each dictionary item |

The following fields are for a specific version. For single-version games, please fill in the fields directly for the game; for multi-version games, please refer to the example and fill in the following information for each version in the version list.

| Field Name | Required | Type | Field Description |
| --- | --- | --- | --- |
| `ver_alt` | No | String | If the version name is in Chinese, the corresponding English name of the version can be filled in here. |
| `date` | **Yes** | Date | The release date of the game or version. Please use the "YYYY-MM-DD" format for software parsing. |
| `source_url` | No | String | The **release link** of the game (note not the download link), such as the release post on the forum, the release video on YouTube, etc. <br>Official release videos should be filled in here, and should not be expanded under the video_zh or video_en fields. <br>If the link has expired, you can mark it with a half-width tilde `~` in front of the link (the same for other links below). |
| `source_url_alt` | No | String | If the game is released on both Chinese and English websites, please fill in the Chinese release link in source_url and the English release link in source_url_alt, so that the game list can display links in the corresponding language for different languages. <br>If the game is only released on Chinese or English websites, only fill in the source_url field; if there is no release link (such as released through instant messaging software, Discord servers, etc.), leave it blank. |
| `download_url` | No | String | The **official download link** provided by the author. |
| `code` | No | String | If the game's download page requires a password, please fill it in here. |
| `download_url_alt` | No | String | If the game provides download links on both Chinese and English websites, please fill in the Chinese download link in download_url and the English download link in download_url_alt, otherwise only fill in the download_url field. |
| `repacker` | No | String | If `type` is `repacked`, fill in the repackager of the game's file. |
| `repacker_alt` | No | String | The English name of the `repacker` (if the repackager's name is in Chinese). |
| `file_name` | No | String | The file name of the game in **file.marioforever.net**. Usually filled in by the file.marioforever.net maintainer. |
| `file_url` | No | String | The complete link of the game in the file.marioforever.net. Usually filled in by the file.marioforever.net maintainer. |
| `data_download_url` | No | String | If the game includes a data package separated from the game itself (such as music), please fill in the download link of the data package here. |
| `data_file_name` | No | String | The file name of the data package in the file.marioforever.net. Usually filled in by the file.marioforever.net maintainer. |
| `data_file_url` | No | String | The complete link of the data package in the file.marioforever.net. Usually filled in by the file.marioforever.net maintainer. |

### Super Mario Worker Project Game List

The Super Mario Worker Project game list is written in yaml (a data format that is easy for humans to read and edit) and is located in `public/lists/list-mw.yaml`. Since SMWP is usually popular in the Chinese MF community, the game list only provides the display for the Chinese page, and does not support English. Here is an example of an SMWP game (*Please note, for demonstration purposes, some descriptions and actual game information are not exactly the same*):

```yaml
- game: A Day Out(S2简化版)
  author: 玛丽的死对头
  smwp_ver: v1.7.9
  date: 2023-07-01
  description: 为 Welcome back to Marioworker Bar 2022 中的一个作品的简化版本。
  note: 请使用Welcome back to Marioworker Bar 2022自带的MW游玩
  source_url: https://www.marioforever.net/thread-2748-1-1.html
  download_url: https://pan.baidu.com/s/1NQUXTDr8uOmvK384-WWT-g
  code: xbr2
  file_name: A Day Out(S2简化版).smwp
  file_url:
```

Below are the meanings of each field.

| Field Name | Required | Type | Field Description |
| --- | --- | --- | --- |
| `game` | **Yes** | String | The name of the game. |
| `author` | **Yes** | String | The name of the author. If there are multiple authors, please fill in `合作作品`. |
| `smwp_ver` | No | String | The version number of SMWP used in the game. If the game includes the use of multiple SMWP versions or involves other complex situations, it can be left blank. |
| `date` | **Yes** | Date | The release date of the game. Please use the "YYYY-MM-DD" format for software parsing. |
| `description` | No | String | The description of the game **on the game list**. |
| `note` | No | String | Notes for game for future use, **will not** be displayed on the game list. |
| `source_url` | No | String | The link of the game's release post, release video, etc. <br>If the link is invalid, it can be marked with a half-width tilde `~` in front of the link (the same for other links below). |
| `download_url` | No | String | The download link of the game. |
| `code` | No  | String | If the game's download page requires a password, please fill it in here. |
| `file_name` | No | String | The file name of the game in the file.marioforever.net. Usually filled in by the file.marioforever.net maintainer. |
| `file_url` | No | String | The complete link of the game in the file.marioforever.net. Usually filled in by the file.marioforever.net maintainer. |

## Help Maintain and Further Development

Programmers are welcomed to help in improving this project through [pull requests](https://github.com/MarioForeverCommunity/download-site-next/pulls). To ensure the stability of the online website, all changes except from list updates should be committed to the `next` branch of this project.

This project is open source under the MIT license. You can modify and deploy within the scope allowed by the license.
