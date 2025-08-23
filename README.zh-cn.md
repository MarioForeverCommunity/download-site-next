# Mario Forever 作品汇总

[English](README.md) | **简体中文**

本仓库是 [新版 download.marioforever.net](https://download.marioforever.net/) 的源代码，其中包含了原版 Mario Forever 游戏、Mario Forever 同人游戏及 Super Mario Worker Project 作品等相关的数据。

访问 [此处](https://download.marioforever.net/) 来寻找你想要的游戏作品！

## 致谢

本站离不开 Mario Forever 社区中众多贡献者的支持。我们愿向以下人士表示诚挚的感谢：

- [Fisjokas](https://www.youtube.com/@Tomek839839)：在 2022 到 2024 年间提供了大量链接和资源，帮助发现了许多稀有且有价值的作品。
- [七地一天](https://space.bilibili.com/34406150)：在自己的网盘中分享了许多作品，为整个档案提供了重要基础。
- 劝君更尽一碗翔：分享了若干可能已经遗失的作品。
- 超级玛丽迷01：私下提供了一些零散的作品。
- 快乐mario8：提供了一些 2015 年发布的国内作品。
- 绿色的糖果 & 无视我233：在网站早期阶段（2020–2021）收集了许多同人游戏的链接，为本站的建立奠定了基础。

我们感谢上述所有人士，以及许多其他社区成员，无论贡献大小，都帮助保存了 Mario Forever 同人游戏的历史。如果有任何人不慎被遗漏，请见谅，我们同样向他们表示衷心的感谢。

## Q & A

### 和 [资源站](https://file.marioforever.net/) 的区别？

资源站虽然也对作品资源进行了归档并提供了下载链接，但受限于 [OpenList](github.com/OpenListTeam/OpenList) 的机制，只能够检索文件名而非游戏名称，且没办法对作品进行便捷的的筛选、排序、查找历史版本；此外本仓库也收录了一些作品的相关信息，例如发布链接、Wiki 链接和相关视频等等。

此外，资源站中的游戏由 [newlife2017](https://github.com/KHwang9883) 上传维护；而本仓库中，你可以通过 pull request 的方式来帮助完善资源列表，并且以此帮助资源站的完善！

### 为什么没有 Mario Worker Remake 相关内容？

Mario Worker Remake 作品已经有官方、完善的 [数据库](https://marioworkerdatabase.altervista.org/) 进行维护，玩家已经可以较为便捷的搜索和下载游戏；而 Mario Forever 和 Super Mario Worker Project 作品由于发布方式多样、零散，因此我们尝试通过建立作品列表方式便于玩家了解、检索和下载。

## 帮助我们完善列表！

如果存在列表中缺失的作品或版本、错误的信息，或者你想要在作品的相关视频列表中添加你的视频，你可以通过如下方式帮助我们完善作品列表：
- 联系 [newlife2017](https://github.com/KHwang9883) 进行反馈；
- 创建一个 [工单](https://github.com/MarioForeverCommunity/download-site-next/issues)，并描述问题。如果你拥有中文 MF 社区账号，你可以在 [反馈专贴](https://www.marioforever.net/thread-1635-1-1.html) 进行反馈；
- 如果你拥有 GitHub 账号，你可以 [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) 本仓库，更新其中的作品列表并通过提交 [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) 以**直接**为本仓库作出贡献。你并不需要下载 Git 等复杂的软件或者掌握版本管理的专业知识，只需要通过 GitHub 网页的 fork、编辑和 pull request 功能就可以完成这些操作！你所需要做的是阅读下面的说明来了解如何正确的编辑作品列表中的内容。

## 列表修改指南

本仓库包括了 Mario Forever 和 Super Mario Worker Project 的作品列表。两个列表的构成有细微差别，因此请仔细阅读每个列表的文档已了解如何正确地编辑列表。

### Mario Forever 作品列表

Mario Forever 作品列表使用 yaml（这是一种人类便于阅读和编辑的数据格式）编写，位于 `public/lists/list.yaml` 中。部分作品可能有多个版本，每个版本有不同的下载链接，因此单版本和多版本作品的格式略有区别。这是一个单版本作品的示例（*请注意，出于演示目的，一些描述和实际作品信息并不完全相同*）：

```yaml
- game: Mario Forever - A Fabulous Space
  game_alt:
  alias:
  - AFS
  author: gurcd
  author_alt: CD
  type: chinese
  wiki_zh_url:
  wiki_en_url:
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
  source_url:
  source_url_alt:
  file_name: MF A Fabulous Space V3.0（收藏版）.7z
  file_url:
```

这是一个多版本作品的示例：

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

下面是各个字段的含义。由于本站包含中文和英文两个语言的版本，因此我们使用了`_alt`、`_zh`、`_en` 字段来进行多语言支持。

| 字段名称 | 是否必需 | 类型 | 字段描述 |
|---|---|---|---|
| `game` | **是** | 字符串 | 游戏的原始名称。请使用游戏发布时的语言、称呼而避免使用别名、缩写、翻译。 |
| `game_alt` | 否 | 字符串 | 游戏的英文名或在英文中的译名（如果游戏名称为中文）。如果作者提供了游戏的英文名，请尽量使用作者提供的名称。<br>英文页面将会优先显示带有 `_alt` 字段的名称，而原始语言的名称可以通过过滤功能被检索到。 |
| `alias` | 否 | 字符串列表 | 作品的缩写、别名、在其他语言的译名或者容易混淆的名称，便于用户更好检索到这个作品。<br>请注意，请尽量增加有一定数量玩家认可、使用的别名或者作者指定的游戏缩写、译名。 |
| `author` | **是** | 字符串 | 作者的名称。 |
| `author_alt` | 否 | 字符串 | 作者的英文名（如果作者名称为中文）。 |
| `author_alias` | 否 | 字符串 | 仅对国外作品生效，用于替代资源站链接的作者名称。 |
| `description_zh` | 否 | 字符串 | 作品在中文页面中的描述（如果有内容需要在列表网页中说明）。 |
| `description_en` | 否 | 字符串 | 作品在英文页面中的描述（如果有内容需要在列表网页中说明）。 |
| `type` | **是** | 字符串 | 支持两种字段，用于过滤功能检索：<br>`chinese` 由中文 Mario Forever 社区用户制作、发布在中文页面的作品。<br>`international` 由国际 Mario Forever 社区用户制作的作品。 |
| `wiki_zh_url` | 否 | 字符串 | 作品在中文 Mario Forever Wiki 中的链接。 |
| `wiki_en_url` | 否 | 字符串 | 作品在英文 Mario Forever Wiki 中的链接。 |
| `video_zh` | 否 | 字典列表 | 由其他玩家上传的、位于中文网页或主要语言为中文的、作品相关的视频（游玩视频、解说、二次创作等）。<br>有多个表项，每个表项请遵循 `- 视频标题: 视频链接` 的格式。 |
| `video_en` | 否 | 字典列表 | 由其他玩家上传的、位于英文网页或主要语言为英文的、作品相关的视频（游玩视频、解说、二次创作等）。<br>有多个表项，每个表项请遵循 `- 视频标题: 视频链接` 的格式。 |
| `ver` | 否 | 字符串（单版本）<br>版本列表（多版本） | 作品的版本名称。通常地，一个作品不同语言的版本、不同的更新、不同的分支版本（例如困难版和简易版）、一个合集作品的单世界版本被视为一个作品的不同版本。<br>对于单版本或列表中只收录了一个版本的作品，`ver` 可以为空或为当前版本的名称。<br>对于多版本作品，`ver` 需要为一个字典列表，字典名称为版本名，每个字典项的值。 |

下面的字段为针对某一版本的字段。对于单版本作品，请作为一个作品的字段填写；对于多版本作品，请参照示例为版本列表中**每一个版本**的值填写下列信息。

| 字段名称 | 是否必需 | 类型 | 字段描述 |
|---|---|---|---|
| `ver_alt` | 否 | 字符串 | 如果版本名称为中文，可以在这里填写对应版本的英文名称。 |
| `date` | **是** | 日期 | 作品或版本的发布日期。请使用 `YYYY-MM-DD` 格式便于软件解析。 |
| `source_url` | 否 | 字符串 | 作品的**发布链接**（注意不是下载链接），如在论坛的发布贴、YouTube 的发布视频，等等。<br>官方发布视频请填写至此处，请勿在 `video_zh` 或 `video_en` 字段下扩展。<br>如果链接已经失效，你可以在链接前加入半角波浪号 `~` 进行标记（下同）。 |
| `source_url_alt` | 否 | 字符串 | 如果作品同时在中文**和**英文网站上进行发布，请在 `source_url` 填写中文发布链接、source_url_alt 填写英文发布链接，从而让作品列表为不同语言展示对应语言的链接。<br>如果作品只在中文**或**英文网站进行发布，则只填写 `source_url` 字段；如果没有发布链接（如通过即时信息软件、Discord 服务器等渠道发布），则留空。 |
| `download_url` | 否 | 字符串 | 作者提供的**官方下载链接**。 |
| `code` | 否 | 字符串 | 如作品的下载页需要密码，则在此处填写。 |
| `download_url_alt` | 否 | 字符串 | 如果作品同时在中文和英文网站上提供下载链接，请在 `download_url` 填写中文下载链接，`download_url_alt` 填写英文下载链接。 |
| `repacker` | 否 | 字符串 | 如果版本为重打包，则此处需填写该作品文件的打包者。 |
| `repacker_alt` | 否 | 字符串 | `repacker` 打包者的英文名（如果打包者名称为中文）。 |
| `file_name` | 否 | 字符串 | 作品在**资源站**中的文件名。通常由资源站维护者进行填写。对于国外作品，现在此处一般无需添加 `old-versions` 前缀。 |
| `file_url` | 否 | 字符串 | 作品在资源站中的完整链接。通常由资源站维护者进行填写。 |
| `data_download_url` | 否 | 字符串 | 如果作品包含和作品本体分离的数据包（如音乐等），请在此处填写数据包的下载链接。 |
| `data_file_name` | 否 | 字符串 | 数据包在资源站中的文件名。通常由资源站维护者进行填写。 |
| `data_file_url` | 否 | 字符串 | 数据包在资源站中的完整链接。通常由资源站维护者进行填写。 |

### Super Mario Worker Project 作品列表

Super Mario Worker Project 作品列表使用 yaml（这是一种人类便于阅读和编辑的数据格式）编写，位于 `public/lists/list-mw.yaml` 中。由于 SMWP 通常在中文 MF 社区中流行，作品列表中只为中文页面提供 SMWP 作品的显示，而非为中英双语提供支持。下面给出一个 SMWP 作品的示例（*请注意，出于演示目的，一些描述和实际作品信息并不完全相同*）：

```yaml
- game: A Day Out(S2简化版)
  author: 玛丽的死对头
  smwp_ver: v1.7.9
  date: 2023-07-01
  description: 为 Welcome back to Marioworker Bar 2022 中的一个作品的简化版本。
  note: 请使用Welcome back to Marioworker Bar 2022自带的MW游玩
  wiki_zh_url: https://zh.wiki.marioforever.net/wiki/A_Day_Out
  source_url: https://www.marioforever.net/thread-2748-1-1.html
  download_url: https://pan.baidu.com/s/1NQUXTDr8uOmvK384-WWT-g
  code: xbr2
  file_name: A Day Out(S2简化版).smwp
  file_url:
```

下面是各个字段的含义。

| 字段名称 | 是否必须 | 类型 | 字段描述 |
|---|---|---|---|
| `game` | **是** | 字符串 | 作品名称。 |
| `author` | **是** | 字符串 | 作者名称。如果有多个作者请填写 `合作作品`。 |
| `smwp_ver` | 否 | 字符串 | 作品使用的 SMWP 版本号。若作品中包含使用多个 SMWP 版本等复杂情形，可以留空。 |
| `date` | **是** | 日期 | 作品的发布时间。请使用 `YYYY-MM-DD` 格式以便软件解析。 |
| `description` | 否 | 字符串 | 作品**在作品列表中**的描述。 |
| `source_url` | 否 | 字符串 | 作品发布贴、发布视频等的链接。<br>如果链接失效，可以在链接前加半角波浪号 `~` 进行标记（下同）。 |
| `wiki_zh_url` | 否 | 字符串 | 作品在中文 Mario Forever Wiki 中的链接。 |
| `download_url` | 否 | 字符串 | 作品的下载链接。 |
| `code` | 否 | 字符串 | 如作品的下载页需要密码，则在此处填写。 |
| `has_bundled_smwp` | 否 | 布尔值 | 作品是否附带 SMWP。 |
| `has_bgm` | 否 | 布尔值 | 作品是否有替换 BGM。 |
| `file_name` | 否 | 字符串 | 作品在资源站中的文件名。通常由资源站管理者填写。 |
| `file_url` | 否 | 字符串 | 作品在资源站中的完整链接。通常由资源站管理者填写。 |

## 帮助维护、二次开发

欢迎有能力的编程者通过 [pull request](https://github.com/MarioForeverCommunity/download-site-next/pulls) 方式协助完善本项目。为了保证上线网站的稳定性，所有列表更新之外的更改请提交至本项目的 `next` 分支。

本项目使用 MIT 协议开源。你可以在协议允许的范围内进行修改和部署。
