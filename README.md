# download.marioforever.net

**English** | [中文简体](README.zh-cn.md)

> [!NOTE]  
> This page are currently tanslated by AI from the Chinese version. Please help us to improve the document quality.

This repository collects and organizes original Mario Forever versions, Mario Forever fangames, Super Mario Worker Project levels, and related information for Mario Forever players to download!

Visit [here](https://download.marioforever.net/) to find the games you want!

## Q & A

### Difference from the [file.marioforever.net](https://file.marioforever.net/)?

Although file.marioforever.net archives game resources and provides download links, it is limited by the mechanism of [AList](https://github.com/alist-org/alist) and can only search for file names instead of game names. It is also not possible to conveniently filter, sort, and find historical versions of the games. In addition, this repository also includes some related information of the games, such as release links, Wiki links, and related videos, etc.

In addition, the games in the resource site are uploaded and maintained by newlife2017 himself, while in this repository, you can help improve the resource list through pull requests, and thus help improve the resource site!

### Why there is no content related to Mario Worker Remake?

The Mario Worker Remake levels already have an official [database](https://marioworkerdatabase.altervista.org/) where players can search and download games more conveniently; while Mario Forever and Super Mario Worker Project games are scattered, so we try to establish game lists to facilitate MF players to retrieve and download.

## Help us improve the list!

If there are missing games or versions in the list, incorrect information, or if you want to add your video to the list of related videos of a game, you can help us improve the game list in the following ways:
- Contact newlife2017 to feedback;
- If you have a Chinese MF forum account, you can feedback in the [feedback threadd in Chinese forum](https://www.marioforever.net/thread-1635-1-1.html);
- If you have a Github account, you can [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) this repository, update the game list in it, and contribute **directly** to this repository through [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request). You do not need to download complex software like git or familiar with version control: just use Github's online fork, edit, and pull request features to complete these operations! What you need to do is read the following instructions to understand how to correctly edit the game list.

## List Modification Guide

This repository includes the game lists of Mario Forever and Super Mario Worker Project. There are slight differences in the composition of the two lists, so please read the documentation for each list carefully to understand how to correctly edit the list.

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

<table class="tg"><thead>
  <tr>
    <th class="tg-fymr">Field Name</th>
    <th class="tg-fymr">Required</th>
    <th class="tg-fymr">Type</th>
    <th class="tg-fymr">Field Description</th>
  </tr></thead>
<tbody>
  <tr>
    <td class="tg-0pky">game</td>
    <td class="tg-0pky"><strong>Yes</strong></td>
    <td class="tg-0pky">String</td>
    <td class="tg-0pky">The original name of the game. Please use the language and name used at the time of the game's release, while avoiding aliases, abbreviations, and translations.</td>
  </tr>
  <tr>
    <td class="tg-0pky">game_alt</td>
    <td class="tg-0pky">No</td>
    <td class="tg-0pky">String</td>
    <td class="tg-0pky">The English name or translation of the game in English (if the game name is in Chinese). If the author provided an English name for the game, please try to use the name provided by the author.<br>The English page will prioritize the name with the _alt field, and the original language name can be retrieved through the filter function.</td>
  </tr>
  <tr>
    <td class="tg-0pky">alias</td>
    <td class="tg-0pky">No</td>
    <td class="tg-0pky">String List</td>
    <td class="tg-0pky">Abbreviations, aliases, translations in other languages, or frequently confused names of the game, to facilitate users to better search for this game.<br>Please try to add aliases or author-specified game abbreviations and translations that are recognized and used by a certain number of players.</td>
  </tr>
  <tr>
    <td class="tg-0pky">author</td>
    <td class="tg-0pky"><strong>Yes</strong></td>
    <td class="tg-0pky">String</td>
    <td class="tg-0pky">The name of the author.</td>
  </tr>
  <tr>
    <td class="tg-0pky">author_alt</td>
    <td class="tg-0pky">No</td>
    <td class="tg-0pky">String</td>
    <td class="tg-0pky">The English name of the author (if the author's name is in Chinese).</td>
  </tr>
  <tr>
    <td class="tg-0lax">description_zh</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The description of the game on the Chinese page (if  there is content that needs to be explained on the list page).</td>
  </tr>
  <tr>
    <td class="tg-0lax">description_en</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The description of the game on the English page (if there is content that needs to be explained on the list page).</td>
  </tr>
  <tr>
    <td class="tg-0pky">type</td>
    <td class="tg-0pky"><strong>Yes</strong></td>
    <td class="tg-0pky">String</td>
    <td class="tg-0pky">Supports three fields for filtering function retrieval:<br>`chinese`: Games made and released on the Chinese websites.<br>`international`: Games made by international Mario Forever players.<br>`repacked`: Games that are originally published in either Chinese or international community, with the original download link invalid, and repackaged and uploaded by other players. Note that there are special fields that need to be filled for this type of game.</td>
  </tr>
  <tr>
    <td class="tg-0pky">wiki_zh_url</td>
    <td class="tg-0pky">No</td>
    <td class="tg-0pky">String</td>
    <td class="tg-0pky">The link of the game in the Chinese Mario Forever Wiki.</td>
  </tr>
  <tr>
    <td class="tg-0pky">wiki_en_url</td>
    <td class="tg-0pky">No</td>
    <td class="tg-0pky">String</td>
    <td class="tg-0pky">The link of the game in the English Mario Forever Wiki.</td>
  </tr>
  <tr>
    <td class="tg-0pky">video_zh</td>
    <td class="tg-0pky">No</td>
    <td class="tg-0pky">Dictionary List</td>
    <td class="tg-0pky">Videos related to the game uploaded by other players, located on Chinese pages or mainly in Chinese, such as gameplay videos, commentaries, and secondary creations.<br>There are multiple entries, and each entry should follow the format "Video Title: Video Link".</td>
  </tr>
  <tr>
    <td class="tg-0pky">video_en</td>
    <td class="tg-0pky">No</td>
    <td class="tg-0pky">Dictionary List</td>
    <td class="tg-0pky">Videos related to the game uploaded by other players, located on English pages or mainly in English, such as gameplay videos, commentaries, and secondary creations.<br>There are multiple entries, and each entry should follow the format "Video Title: Video Link".</td>
  </tr>
  <tr>
    <td class="tg-0pky">ver</td>
    <td class="tg-0pky">No</td>
    <td class="tg-0pky">String (Single Version)<br>Version List (Multiple Versions)</td>
    <td class="tg-0pky">The version name of the game. Generally, different language versions of a game, different updates, different branch versions (such as difficult and easy versions), and a single world version of a collection are considered different versions of a game.<br>For single-version or games with only one version included in the list, ver can be empty or the name of the current version.<br>For multi-version games, ver needs to be a dictionary list, with dictionary names as version names, and the value of each dictionary item</td>
  </tr>
  <tr>
    <td class="tg-0pky" colspan="4">The following fields are for a specific version. For single-version games, please fill in the fields directly for the game; for multi-version games, please refer to the example and fill in the following information for each version in the version list.</td>
  </tr>
  <tr>
    <td class="tg-0lax">ver_alt</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">If the version name is in Chinese, the corresponding English name of the version can be filled in here.</td>
  </tr>
  <tr>
    <td class="tg-0lax">date</td>
    <td class="tg-0pky"><strong>Yes</strong></td>
    <td class="tg-0lax">Date</td>
    <td class="tg-0lax">The release date of the game or version. Please use the "YYYY-MM-DD" format for software parsing.</td>
  </tr>
  <tr>
    <td class="tg-0lax">source_url</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The <strong>release link</strong> of the game (note not the download link), such as the release post on the forum, the release video on YouTube, etc.<br>Official release videos should be filled in here, and should not be expanded under the video_zh or video_en fields.<br>If the link has expired, you can mark it with a half-width tilde "~" in front of the link (the same below).</td>
  </tr>
  <tr>
    <td class="tg-0lax">source_url_alt</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">If the game is released on both Chinese and English websites, please fill in the Chinese release link in source_url and the English release link in source_url_alt, so that the game list can display links in the corresponding language for different languages.<br>If the game is only released on Chinese or English websites, only fill in the source_url field; if there is no release link (such as released through instant messaging software, Discord servers, etc.), leave it blank.</td>
  </tr>
  <tr>
    <td class="tg-0lax">download_url</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The <strong>official download link</strong> provided by the author.</td>
  </tr>
  <tr>
    <td class="tg-0lax">code</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">If the game's download page or zip package requires a password, please fill it in here.</td>
  </tr>
  <tr>
    <td class="tg-0lax">download_url_alt</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">If the game provides download links on both Chinese and English websites, please fill in the Chinese download link in download_url and the English download link in download_url_alt, otherwise only fill in the download_url field.</td>
  </tr>
  <tr>
    <td class="tg-0lax">file_name</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The file name of the game in <strong>file.marioforever.net</strong>. Usually filled in by the file.marioforever.net maintainer.</td>
  </tr>
  <tr>
    <td class="tg-0lax">file_url</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The complete link of the game in the file.marioforever.net. Usually filled in by the file.marioforever.net maintainer.</td>
  </tr>
  <tr>
    <td class="tg-0lax">data_download_url</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">If the game includes a data package separated from the game itself (such as music), please fill in the download link of the data package here.</td>
  </tr>
  <tr>
    <td class="tg-0lax">data_file_name</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The file name of the data package in the file.marioforever.net. Usually filled in by the file.marioforever.net maintainer.</td>
  </tr>
  <tr>
    <td class="tg-0lax">data_file_url</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The complete link of the data package in the file.marioforever.net. Usually filled in by the file.marioforever.net maintainer.</td>
  </tr>
</tbody></table>

### Super Mario Worker Project Game List

The Super Mario Worker Project game list is written in yaml (a data format that is easy for humans to read and edit) and is located in `public/lists/list-mw.yaml`. Since SMWP is usually popular in the Chinese MF community, the game list only provides the display for the Chinese page, and does not support English. Here is an example of an SMWP game (*Please note, for demonstration purposes, some descriptions and actual game information are not exactly the same*):

```yaml
- game: A Day Out(S2简化版)
  author: 玛丽的死对头
  note: 请使用Welcome back to Marioworker Bar 2022自带的MW游玩
  smwp_ver: v1.7.9
  date: 2023-07-01
  description: 为 Welcome back to Marioworker Bar 2022 中的一个作品的简化版本。
  source_url: https://www.marioforever.net/thread-2748-1-1.html
  download_url: https://pan.baidu.com/s/1NQUXTDr8uOmvK384-WWT-g
  code: xbr2
  file_name: A Day Out(S2简化版).smwp
  file_url:
```

Below are the meanings of each field.

<table class="tg"><thead>
  <tr>
    <th class="tg-0lax">Field Name</th>
    <th class="tg-0lax">Required</th>
    <th class="tg-0lax">Type</th>
    <th class="tg-0lax">Field Description</th>
  </tr></thead>
<tbody>
  <tr>
    <td class="tg-0lax">game</td>
    <td class="tg-0lax"><strong>Yes</strong></td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The name of the game.</td>
  </tr>
  <tr>
    <td class="tg-0lax">author</td>
    <td class="tg-0lax"><strong>Yes</strong></td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The name of the author. If there are multiple authors, please fill in "合作作品".</td>
  </tr>
  <tr>
    <td class="tg-0lax">note</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">Notes for game for future use, <strong>will not</strong> be displayed on the game list.</td>
  </tr>
  <tr>
    <td class="tg-0lax">smwp_ver</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The version number of SMWP used in the game. If the game includes the use of multiple SMWP or involves other complex situations, it can be left blank.</td>
  </tr>
  <tr>
    <td class="tg-0lax">date</td>
    <td class="tg-0lax"><strong>Yes</strong></td>
    <td class="tg-0lax">Date</td>
    <td class="tg-0lax">The release date of the game. Please use the "YYYY-MM-DD" format for software parsing.</td>
  </tr>
  <tr>
    <td class="tg-0lax">description</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The description of the game <strong>on the game list</strong>.</td>
  </tr>
  <tr>
    <td class="tg-0lax">source_url</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The link of the game's release post, release video, etc.<br>If the link is invalid, it can be marked with a half-width tilde "~" in front of the link (the same below).</td>
  </tr>
  <tr>
    <td class="tg-0lax">download_url</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The download link of the game.</td>
  </tr>
  <tr>
    <td class="tg-0lax">code</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">If the game's download page or zip package requires a password, please fill it in here.</td>
  </tr>
  <tr>
    <td class="tg-0lax">file_name</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The file name of the game in the file.marioforever.net. Usually filled in by the file.marioforever.net manager.</td>
  </tr>
  <tr>
    <td class="tg-0lax">file_url</td>
    <td class="tg-0lax">No</td>
    <td class="tg-0lax">String</td>
    <td class="tg-0lax">The complete link of the game in the file.marioforever.net. Usually filled in by the file.marioforever.net manager.</td>
  </tr>
</tbody></table>

## Help Maintain and Secondary Development

Programmers are appreciated to help improving this project through pull request. To ensure the stability of the online website, all changes should be submitted to the `next` branch of this project.

This project is open source under the MIT license. You can modify and deploy within the scope allowed by the license.


