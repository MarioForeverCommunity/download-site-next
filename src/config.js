import packageJson from '../package.json';
import { tFor } from './i18n/index.js';

// version - Version of the website.
export const siteVersion = `v${packageJson.version}`;

/**
 * 设置浏览器标签页标题：页面名称 | 站点名称。
 *
 * 站点名称按界面语言从 i18n 文案取（`app.siteName`），因此新增语言时无需改动此处。
 *
 * @param {string} name - 页面名称（navTop 中的 title / title_alt）
 * @param {string} lan - 界面语言代码（新版为 `zh-Hans` / `zh-Hant` / `en` …，旧版仍为 `zh` / `en`）
 */
export function setPageTitle(name, lan) {
  const site = tFor(lan, "app.siteName");
  document.title = `${name} | ${site}`;
}

// topBar - Top bar entries
// `link` is link of the entry.
// `name` is name in Chinese.
// `name_alt` is name in English.
// `name_zh_new` / `name_zh_hant_new` / `name_en_new`: the fuller labels the
// redesigned UI's rail prints (it names the destination, the legacy header keeps
// the short name). They are read by NxShell's `<base>_<locale>_new` lookup, not
// by `localizedField()`. `name_zh_hant_new` is optional: without it the
// Traditional interface falls back to the authored Simplified `name_zh_new`
// (navigation labels are never machine-converted), so provide it for proper
// Traditional wording.
// `show_zh_hant: false` hides the entry in the Traditional Chinese interface only
// (mainland-only accounts); the legacy header ignores it.
// When `show_en` is false, the entry is hidden from the English enviornment.

export const topBar = [
  {
    "link" : "https://marioforever.space/",
    "name" : "Forum (EN)",
    "name_alt" : "Forum (EN)",
    "name_en_new": "Mario Forever Space",
    "show_zh" : false,
    "show_en" : true
  },
  {
    "link" : "https://www.marioforever.net/",
    "name" : "社区",
    "name_alt" : "Forum (CN)",
    "name_zh_new": "Mario Forever 社区",
    "name_zh_hant_new": "Mario Forever 社群",
    "name_en_new": "Chinese Mario Forever Forum",
    "show_en" : true
  },
  {
    "link" : "https://discord.com/invite/pfnbfwRhUH",
    "name" : "MF Discord",
    "name_alt" : "MF Discord",
    "name_en_new": "Mario Forever Café Discord Server",
    "show_zh" : false,
    "show_en" : true
  },
  {
    "link" : "https://discord.gg/VwgV6GmwXv",
    "name" : "Cloud Lounge",
    "name_alt" : "Cloud Lounge",
    "name_en_new": "Cloud Lounge Discord Server",
    "show_zh" : false,
    "show_en" : true
  },
  {
    "link" : "https://download.marioforever.net/",
    "name" : "作品目录",
    "show_en" : false,
    "show_new": false
  },
  {
    "link" : "https://file.marioforever.net/",
    "name" : "资源站",
    "name_zh_new": "Mario Forever 社区资源站",
    "name_zh_hant_new": "Mario Forever 社群資源網站",
    "name_alt" : "File Hub",
    "name_en_new": "Mario Forever Community File Hub",
    "show_en" : true
  },
  {
    "link" : "https://wiki.marioforever.net/",
    "name" : "Wiki",
    "name_alt" : "Wiki",
    "name_zh_new": "Mario Forever 百科",
    "name_zh_hant_new": "Mario Forever Wiki",
    "name_en_new": "Mario Forever Wiki",
    "show_en" : true
  },
  {
    "link" : "https://mwcup.marioforever.net/",
    "name" : "MW杯",
    "name_zh_new": "Mario Worker 杯官网",
    "show_zh_hant": false,
    "show_en" : false,
  },
  {
    "link" : "https://pkmf.marioforever.net/",
    "name" : "PK!MF",
    "name_zh_new": "PK!MF 活动主页",
    "show_zh_hant": false,
    "show_en" : false
  },
  {
    "link" : "https://archive.marioforever.net/",
    "name" : "Archive",
    "show_en" : false,
    "show_new": false
  },
  {
    "link" : "https://space.bilibili.com/2136191287",
    "name" : "关注B站",
    "name_zh_new": "关注 Mario Forever 社区 B 站账号",
    "show_zh_hant": false,
    "show_en" : false
  },
  {
    "link" : "https://www.iesdouyin.com/share/user/MS4wLjABAAAA3TG0EnFZ-ygxUqXw839P7T6Mewh5_KNbaSFviJUtHzwQbx4aTaX3q3RLvqIHPE6_",
    "name_zh_new": "关注 Mario Forever 社区抖音账号",
    "show_zh_hant": false,
    "show_en" : false
  },
  {
    "link" : "https://github.com/MarioForeverCommunity/download-site-next",
    "name" : "Source Code",
    "name_alt" : "Source Code",
    "show_zh" : false,
    "show_en" : true,
    "show_new": false
  },
]

// navTop - Navigator entries.
// `id` is pageId referenced in header component.
// `link` is link of the entry.
// `option` is option name in Chinese (the legacy header's short form).
// `option_zh_new`: optional fuller name for the redesigned UI's Simplified
// Chinese rail only ("Mario Forever 作品目录" vs "MF 作品目录"); the legacy
// design and all other locales ignore it.
// `option_alt` is option name in English.
// `title` is title in Chinese.
// `title_alt` is title in English.
// Optional per-locale overrides come after the Chinese/English pair, in the order
// of the language menu: `option_zh_hant` / `title_zh_hant`, then `option_pl` /
// `title_pl`. They are read by the redesigned UI's localizedField(); the legacy UI
// ignores them. Chinese is the bare field, so a Traditional Chinese visitor sees
// the Simplified value as authored unless `_zh_hant` is provided — navigation
// labels are deliberately not machine-converted.
// When `show_en` is false, the entry is hidden from the English enviornment.

export const navTop = [
  {
    "id" : "index",
    "link" : "./",
    "option" : "MF 资源导航",
    "option_zh_new": "Mario Forever 资源导航",
    "option_zh_hant" : "原版 Mario Forever 下載",
    "option_alt" : "Original MF Downloads",
    "option_pl" : "Oryginalne gry Mario Forever",
    "title" : "Mario Forever 资源导航",
    "title_zh_hant" : "原版 Mario Forever 和重製版下載",
    "title_alt" : "Original Mario Forever & MF Remakes Downloads",
    "title_pl" : "Oryginalne gry Mario Forever i ich remake’i",
    "show_en" : true
  },
  {
    "id" : "mf-games",
    "link" : "./mf-games.html",
    "option" : "MF 作品目录",
    "option_zh_new" : "Mario Forever 作品目录",
    "option_zh_hant" : "Mario Forever 遊戲目錄",
    "option_alt" : "MF Fangames Catalog",
    "option_pl" : "Katalog gier MF",
    "title" : "Mario Forever 同人作品目录",
    "title_zh_hant" : "Mario Forever 同人遊戲目錄",
    "title_alt" : "Mario Forever Fangames Catalog",
    "title_pl" : "Katalog fanowskich gier Mario Forever",
    "show_en" : true
  },
  {
    "id" : "engines",
    "link" : "./engines.html",
    "option" : "引擎",
    "option_zh_hant" : "Mario Forever 製作範本",
    "option_alt" : "MF Engines",
    "option_pl" : "Silniki MF",
    "title" : "Mario Forever 制作模板（引擎）导航",
    "title_zh_hant" : "Mario Forever 製作範本（引擎）導覽",
    "title_alt" : "Mario Forever Engines Downloads",
    "title_pl" : "Silniki i szablony Mario Forever",
    "show_zh" : false,
    "show_en" : true
  },
  {
    "id" : "mario-worker",
    "link" : "./mario-worker.html",
    "option" : "MW 资源导航",
    "option_zh_hant" : "關卡編輯器下載",
    "option_alt" : "Level Editors",
    "option_pl" : "Edytory poziomów",
    "title" : "Mario Worker 资源导航",
    "title_zh_hant" : "Mario Forever 關卡編輯器 (Mario Worker) 下載",
    "title_alt" : "Mario Forever Level Editors (Mario Worker) Downloads",
    "title_pl" : "Edytory poziomów Mario Forever (Mario Worker)",
    "show_zh" : false,
    "show_en" : true
  },
  {
    "id" : "mw-levels",
    "link" : "./mw-levels.html",
    "option" : "MW 作品目录",
    "option_zh_new": "Mario Worker 作品目录",
    "option_zh_hant" : "Mario Worker 作品目錄",
    "option_alt" : "MW Level Downloads",
    "option_pl" : "Katalog poziomów MW",
    "title" : "Mario Worker 关卡作品目录",
    "title_zh_hant" : "Mario Worker 關卡作品目錄",
    "title_alt" : "Mario Worker Levels Catalog",
    "title_pl" : "Katalog poziomów Mario Worker",
    "show_en" : false
  },
  {
    "id" : "assets",
    "link" : "./assets.html",
    "option" : "创作资源目录",
    "option_zh_hant" : "創作資源目錄",
    "option_alt": "MF Resources & Assets",
    "option_pl" : "Zasoby dla twórców",
    "title" : "Mario Forever 创作资源目录",
    "title_zh_hant" : "Mario Forever 創作資源目錄",
    "title_alt" : "Mario Forever Resources & Assets Catalog",
    "title_pl" : "Katalog zasobów Mario Forever",
    "show_en" : false
  },
  {
    "id" : "softendo",
    "link" : "./softendo.html",
    "option" : "Softendo 游戏目录",
    "option_zh_hant" : "Softendo 遊戲目錄",
    "option_alt" : "Softendo Games",
    "option_pl" : "Gry Softendo",
    "title" : "Softendo (Buziol Games) 游戏目录",
    "title_zh_hant" : "Softendo (Buziol Games) 遊戲目錄",
    "title_alt" : "Catalog of Games Associated with Softendo (Buziol Games)",
    "title_pl" : "Katalog gier Softendo (Buziol Games)",
    "show_en" : true
  },
];

// sourceName - Website name parser of the source button.
// `domain` is the domain to match url.
// `desc_zh` is the name in Chinese (Optional).
// `desc_zh_hant` is the name in Traditional Chinese (Optional). Without it the
// `desc_zh` value is converted by opencc on a Traditional interface
// (src/util/next/records.js); provide it when the converted wording is off.
// `desc_en` is the name in English.

export const sourceName = [
  {
    "domain" : "tieba.baidu.com",
    "desc_zh" : "百度贴吧",
    "desc_zh_hant" : "百度貼吧",
    "desc_en" : "Baidu Tieba"
  },
  {
    "domain" : "archive.marioforever.net",
    "desc_zh" : "贴吧备份",
    "desc_zh_hant" : "百度貼吧備份",
    "desc_en" : "Tieba Archive"
  },
  {
    "domain" : "marioforever.net",
    "desc_zh" : "Mario Forever 社区",
    "desc_zh_hant" : "Mario Forever 社群",
    "desc_zh_abbr" : "MF 社区",
    "desc_en" : "marioforever.net"
  },
  {
    "domain" : "marioforever.space",
    "desc_en" : "Mario Forever Space"
  },
  {
    "domain" : "youtube.com",
    "desc_en" : "YouTube"
  },
  {
    "domain" : "marioforeverforum.boards.net",
    "desc_en" : "Mario Forever Forum"
  },
  {
    "domain" : "themariovariable.org",
    "desc_zh" : "TMV 个人网站",
    "desc_zh_hant" : "TMV 個人網站",
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
  {
    "domain" : "bilibili.com",
    "desc_zh" : "哔哩哔哩",
    "desc_zh_abbr" : "B 站",
    "desc_zh_hant" : "嗶哩嗶哩",
    "desc_en" : "Bilibili"
  },
  {
    "domain" : "gamejolt.com",
    "desc_en" : "GameJolt"
  },
  {
    "domain" : "github.com",
    "desc_en" : "GitHub"
  }
];

// downloadName - Website name parser of the download button.
// `domain` is the domain to match url.
// `desc_zh` is the name in Chinese (Optional).
// `desc_zh_hant` is the name in Traditional Chinese (Optional), see `sourceName`.
// `desc_en` is the name in English.

export const downloadName = [
  {
    "domain" : "file.marioforever.net",
    "desc_zh" : "社区资源站",
    "desc_zh_hant" : "社群資源網站",
    "desc_en" : "Community File Hub"
  },
  {
    "domain" : /(pan|yun)\.baidu\.com/,
    "desc_zh" : "百度网盘",
    "desc_zh_hant" : "百度網盤",
    "desc_en" : "Baidu Netdisk",
    "show_code" : true
  },
  {
    "domain" : /lanzou[a-z].com/,
    "desc_zh" : "蓝奏云",
    "desc_zh_hant" : "藍奏雲",
    "desc_en" : "Lanzou",
    "show_code" : true
  },
  {
    "domain" : /(ysepan|ys168|ysupan)\.com/,
    "desc_zh" : "永硕 E 盘",
    "desc_zh_hant" : "永碩 E 盤",
    "desc_en" : "YSEpan",
    "show_code" : true
  },
  {
    "domain" : "pan.quark.cn",
    "desc_zh" : "夸克网盘",
    "desc_zh_hant" : "夸克",
    "desc_en" : "Quark",
    "show_code" : true
  },
  {
    "domain": "qfile.qq.com",
    "desc_zh": "QQ 闪传",
    "desc_zh_hant" : "QQ 閃傳",
    "desc_en": "QQ File Transfer"
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
    "domain" : "rnx.su",
    "desc_en" : "Nextcloud (Meteo Dream)"
  },
  {
    "domain" : "nx.wtf",
    "desc_en" : "Cloudreve (Meteo Dream)"
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
    "desc_zh_hant" : "TMV 個人網站",
    "desc_en" : "TMV's website"
  },
  {
    "domain" : "wsw233.com",
    "desc_zh" : "秘帆文件站",
    "desc_zh_hant" : "秘帆檔案網站",
    "desc_en" : "WSW Zone",
    "show_code" : true
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
  },
  {
    "domain" : /123(pan|\d{3})\.(com|cn)/,
    "desc_zh" : "123 云盘",
    "desc_zh_hant" : "123 雲盤",
    "desc_en" : "123Pan",
    "show_code" : true
  },
  {
    "domain": "1drv.ms",
    "desc_en": "OneDrive"
  },
  {
    "domain" : "github.com",
    "desc_en" : "GitHub"
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
    "desc_zh_hant" : "嗶哩嗶哩",
    "desc_en" : "Bilibili"
  },
  {
    "domain" : "youtube.com",
    "desc_en" : "YouTube",
  },
];
