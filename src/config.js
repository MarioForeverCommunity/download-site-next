import packageJson from '../package.json';

// version - Version of the website.
export const siteVersion = `v${packageJson.version}`;

// topBar - Top bar entries
// `link` is link of the entry.
// `name` is name in Chinese.
// `name_alt` is name in English.
// When `show_en` is false, the entry is hidden from the English enviornment.

export const topBar = [
  {
    "link" : "https://discord.com/invite/pfnbfwRhUH",
    "name" : "Discord",
    "name_alt" : "Discord",
    "show_zh" : false,
    "show_en" : true

  },
  {
    "link" : "https://www.marioforever.net/",
    "name" : "社区",
    "name_alt" : "Forum (CN)",
    "show_en" : true
  },
  {
    "link" : "https://file.marioforever.net/",
    "name" : "资源站",
    "name_alt" : "Files",
    "show_en" : true
  },
  {
    "link" : "https://wiki.marioforever.net/",
    "name" : "Wiki",
    "name_alt" : "Wiki",
    "show_en" : true
  },
  {
    "link" : "https://archive.marioforever.net/",
    "name" : "Archive",
    "show_en" : false
  },
  // {
  //   "link" : "https://space.bilibili.com/2136191287",
  //   "name" : "关注B站",
  //   "show_en" : false
  // },
]

// navTop - Navigator entries. 
// `id` is pageId referenced in header component.
// `link` is link of the entry.
// `option` is option name in Chinese.
// `option_alt` is option name in English.
// `title` is title in Chinese.
// `title_alt` is title in English.
// When `show_en` is false, the entry is hidden from the English enviornment.

export const navTop = [
  {
    "id" : "index",
    "link" : "./",
    "option" : "原版 MF 下载",
    "option_alt" : "Original MF Downloads",
    "title" : "Mario Forever 全版本汇总",
    "title_alt" : "Original Mario Forever & MF Remakes Downloads",
    "show_en" : true
  },
  {
    "id" : "mf-games",
    "link" : "./mf-games.html",
    "option" : "MF 作品汇总",
    "option_alt" : "Fangame Downloads",
    "title" : "Mario Forever 同人作品汇总",
    "title_alt" : "Mario Forever Fangames Catalog",
    "show_en" : true
  },
  {
    "id" : "mw-levels",
    "link" : "./mw-levels.html",
    "option" : "SMWP 作品汇总",
    "option_alt" : "SMWP Level Downloads",
    "title" : "Super Mario Worker Project 关卡作品汇总",
    "show_en" : false
  },
  // {
  //   "id" : "smwp-download",
  //   "link" : "https://smwp.marioforever.net/downloads/",
  //   "option" : "SMWP 本体下载",
  //   "option_alt" : "SMWP Downloads",
  //   "show_en" : false
  // }
];

// sourceName - Website name parser of the source button.
// `domain` is the domain to match url.
// `desc_zh` is the name in Chinese (Optional).
// `desc_en` is the name in English.

export const sourceName = [
  {
    "domain" : "tieba.baidu.com",
    "desc_zh" : "百度贴吧",
    "desc_en" : "Baidu Tieba"
  },
  {
    "domain" : "archive.marioforever.net",
    "desc_zh" : "贴吧备份",
    "desc_en" : "Tieba Archive"
  },
  {
    "domain" : "www.marioforever.net",
    "desc_zh" : "MF 社区",
    "desc_en" : "marioforever.net"
  },
  {
    "domain" : "www.youtube.com",
    "desc_en" : "YouTube"
  },
  {
    "domain" : "marioforeverforum.boards.net",
    "desc_zh" : "英文 MF 论坛",
    "desc_en" : "Mario Forever Forum"
  },
  {
    "domain" : "themariovariable.org",
    "desc_zh" : "TMV 个人网站",
    "desc_en" : "TMV's website"
  },
  {
    "domain" : "twitter.com",
    "desc_zh" : "X / Twitter",
    "desc_en" : "X / Twitter"
  },
  {
    "domain" : "x.com",
    "desc_zh" : "X / Twitter",
    "desc_en" : "X / Twitter"
  },
];

// downloadName - Website name parser of the download button.
// `domain` is the domain to match url.
// `desc_zh` is the name in Chinese (Optional).
// `desc_en` is the name in English.

export const downloadName = [
  {
    "domain" : "file.marioforever.net",
    "desc_zh" : "社区资源站",
    "desc_en" : "file.marioforever.net"
  },
  {
    "domain" : "pan.baidu.com",
    "desc_zh" : "百度网盘",
    "desc_en" : "Baidu Netdisk",
    "show_code" : true
  },
  {
    "domain" : /lanzou[a-z].com/,
    "desc_zh" : "蓝奏云",
    "desc_en" : "Lanzou",
    "show_code" : true
  },
  {
    "domain" : "ysepan.com",
    "desc_zh" : "永硕 E 盘",
    "desc_en" : "YSEpan"
  },
  {
    "domain" : "mediafire.com",
    "desc_en" : "MediaFire"
  },
  {
    "domain" : "files.fm",
    "desc_en" : "files.fm"
  },
  {
    "domain" : "mega.nz",
    "desc_en" : "MEGA"
  },
  {
    "domain" : "cdn.discordapp.com",
    "desc_en" : "Discord"
  },
  {
    "domain" : "nx.wtf",
    "desc_en" : "Nextcloud"
  },
  {
    "domain" : "rnx.su",
    "desc_en" : "Nextcloud"
  },
  {
    "domain" : "drive.google.com",
    "desc_en" : "Google Drive"
  },
  {
    "domain" : "dropbox.com",
    "desc_en" : "Dropbox"
  },
  {
    "domain" : "sendspace.com",
    "desc_en" : "Sendspace"
  },
  {
    "domain" : "themariovariable.org",
    "desc_zh" : "TMV 个人网站",
    "desc_en" : "TMV's website"
  },
  {
    "domain" : "easypaste.org",
    "desc_en" : "EasyPaste"
  },
  {
    "domain" : "gamejolt.com",
    "desc_en" : "Game Jolt"
  },
  {
    "domain" : "yadi.sk",
    "desc_en" : "Yandex"
  }
];

// videoName - Website name parser of the video list.
// `domain` is the domain to match url.
// `desc_zh` is the name in Chinese (Optional).
// `desc_en` is the name in English.

export const videoName = [
  {
    "domain" : "bilibili.com",
    "desc_zh" : "哔哩哔哩",
    "desc_en" : "Bilibili"
  },
  {
    "domain" : "youtube.com",
    "desc_en" : "YouTube",
  },
];