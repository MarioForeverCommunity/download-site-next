// 站点更新履历（中英双语）
// - version：站点版本号（对应 git tag，去掉 v 前缀）；date 为该 tag 所在提交的日期
// - features / improvements / fixes / misc：新功能 / 优化 / 修复 / 其他，按版本从新到旧排列
// - features_en / improvements_en / fixes_en / misc_en：对应英文条目；缺失时前端回退显示中文
// - 条目仅收录站点本身的改动，不收录数据（data / list / yaml）更新记录
export const changelog = [
  {
    version: "3.0.0-beta.3",
    date: "2026-11-17",
    features: [
      "新版作品详情面板右上角新增分享按钮（位于关闭按钮左侧）：点击即复制该作品在所属目录中的链接，并在页面底部弹出「作品链接已复制」提示",
      "新版与旧版的作品目录（MF、MW、创作资源、Softendo）新增分页，每页条数可在全局设置中选择 25 / 50 / 100 / 200 或全部显示，列表与卡片视图共用；通过分享链接或「随机游戏」打开的记录会自动翻到其所在页",
      "目录分页的当前页码会同步到地址栏（`?page=`）：刷新页面或复制链接后可回到同一页，第 1 页不写该参数，并与 `design`、`id` 等其他参数共存"
    ],
    features_en: [
      "A share button at the top right of the redesigned record drawer, just left of close: it copies the record's link in its own catalog and shows a \"Link copied\" popup at the bottom of the page",
      "The catalogs (MF, MW, assets, Softendo) are paginated in both designs, with the page size chosen in Global settings (25 / 50 / 100 / 200 or show all) shared by the list and card views; records opened from a shared link or the random button jump to their page",
      "The current catalog page is mirrored in the address bar (`?page=`), so reloading or sharing the link returns to the same page; the parameter is omitted on the first page and coexists with `design`, `id` and other parameters in both designs"
    ],
    improvements: [
      "分页按钮配色统一：新版当前页使用主题色填充，旧版页码按钮与该版筛选栏的「标签筛选」按钮一致（浅色白底、深色深灰底）",
      "所有页面的浏览器标题统一为「页面名称 | 站点名称」：中文后缀为「Mario Forever 作品目录站」，英文后缀为「Mario Forever Download Portal」",
      "预加载中文界面新版侧栏的 Logo（logo_new.png），侧栏 Logo 出现时不再闪空"
    ],
    improvements_en: [
      "Pagination colours are unified: the redesigned catalogs fill the current page with the theme colour, while the legacy pager matches the legacy filter bar's Tags button (white in the light theme, dark grey in the dark theme)",
      "Every page's browser title now reads \"page name | site name\", with \"Mario Forever 作品目录站\" in Chinese and \"Mario Forever Download Portal\" in English",
      "The Chinese interface's new rail logo (logo_new.png) is preloaded, so the rail no longer flashes empty before the mark appears"
    ],
    fixes: [
      "修复打开带版本参数的作品链接时无法展开对应版本面板的问题：从某个版本行分享出去的链接现在会打开该作品，并自动选中链接中的版本",
      "修复创作资源目录中同名变体被合并为同一条记录、无法分别打开的问题",
      "修复作品卡片与作品详情中的截图轮播不自动播放的问题：多图轮播每 3 秒切换到下一张，手动翻页后重新计时",
      "修复勾选「每个版本单独列出」后平台与制作软件筛选未精确到版本的问题：筛选 Windows 不再带出同一作品的 Linux 版本，版本级的制作软件也单独生效",
      "修复展开带截图轮播的作品详情时会播放一次「最后一张滑到第一张」入场动画的问题：轮播现在瞬时定位，只有手动翻页与自动播放带动画"
    ],
    fixes_en: [
      "Fixed version-scoped record links opening without expanding the matching build: a link shared from a version row now opens the record with that version selected",
      "Fixed same-named asset variants being merged into one record and unable to open individually",
      "Fixed the screenshot carousel not autoplaying in entry cards and the record drawer: multi-image sliders now advance every 3 seconds, restarting the timer after a manual change",
      "Fixed the platform and made-with filters matching every build of a game once versions were listed separately: filtering Windows no longer brings up the Linux build, and a version-level engine filters on its own",
      "Fixed the screenshot carousel playing a last-to-first entrance animation when a record drawer with a slider opened: the strip now positions itself instantly, animating only deliberate page changes and autoplay"
    ],
    misc: [
      "补齐了大部分 Mario Forever 和 Mario Worker 作品的图片和介绍"
    ],
    misc_en: [
      "Added screenshots and descriptions for most Mario Forever and Mario Worker works"
    ]
  },
  {
    version: "3.0.0-beta.2",
    date: "2026-11-15",
    improvements: [
      "移动端顶栏与作品目录的结果栏改为随页面滚动固定：浏览长列表时搜索框、排序与视图切换始终可用；结果栏紧贴顶栏下方，两者互不重叠",
      "界面设计与全局设置改为浏览器本地存储：设计模式、语言、列表 / 卡片视图、默认排序与资源站直链开关在关闭浏览器后依然保持，站点更新改变默认值时也不会覆盖访客已做的选择",
      "MF 作品列表未展开全部版本时，移动端标题下的小字不再显示版本号；勾选「每个版本单独列出」后恢复显示",
      "作品目录的列表与卡片标题在悬停时改用主题色，提示整行 / 整张卡片都可以打开详情",
      "旧版界面的作品目录（MF、MW、创作资源、Softendo）卡片与文档页作品卡片改用图片懒加载，列表模式下的悬停预览图也只在悬停时请求：封面随滚动进入可视区域或悬停时才加载，长目录不再一次性加载全部图片"
    ],
    improvements_en: [
      "On phones the topbar and the catalog's results bar stay pinned while the page scrolls, so the searches, sorting and the view switch remain reachable through long lists; the results bar sits directly under the topbar without overlapping it",
      "The interface design and global settings now live in local storage: design, language, list/card view, default sort and the File Hub direct-link switch survive browser restarts, and a later release that changes a default no longer overrides a choice a visitor already made",
      "With MF versions collapsed, the small line under a phone row no longer repeats the version number; it returns once \"list every version separately\" is on",
      "Catalog list and card titles take the accent colour on hover, signalling that the whole row or card opens the record",
      "The legacy design's catalog cards (MF, MW, assets, Softendo), documentation entry cards and the list view's hover preview now lazy-load their artwork: covers are requested as they scroll into view or when the tooltip opens, so long catalogs no longer fetch every image at once"
    ],
    fixes: [
      "修复桌面端窄屏下侧栏长链接换行后行高未随之增加、与相邻条目上下间距过紧的问题"
    ],
    fixes_en: [
      "Fixed long rail labels wrapping onto a second line on narrow desktops without the row growing, which left the text cramped against the rows above and below"
    ],
    misc: [
      "补齐了绝大部分 Mario Forever 作品的图片"
    ],
    misc_en: [
      "Added screenshots for the vast majority of Mario Forever fangames"
    ]
  },
  {
    version: "3.0.0-beta.1",
    date: "2026-11-15",
    features: [
      "新版界面新增右下角「回到顶部」按钮：页面滚动后出现，点击平滑回到顶部，遮罩与抽屉打开时不干扰操作"
    ],
    features_en: [
      "A back-to-top button in the bottom-right corner of the redesigned UI: it appears once the page is scrolled and returns smoothly to the top, staying out of the way while overlays are open"
    ],
    improvements: [
      "抽屉与侧栏改用动态视口高度并留出底部安全间距，底栏展开时不再遮挡内容；抽屉内滚动不再带动主区域",
      "作品列表：中文界面不再显示英文副标题；移动端把作者、版本、日期合并为标题下的小字（MW 版本带 SMWP 前缀）；勾选「每个版本单独列出」时不再重复显示「N 个版本」",
      "作品列表与卡片视图的图片统一为 4:3，卡片轮播支持触控左右滑动，并按容器宽度缩放以完整显示当前图片",
      "侧边栏加宽：桌面端由 208px 调整为 244px，与移动端抽屉一致；861–1024px 区间由 176px 调整为 208px",
      "中文版侧边栏换用新版 Logo，并在 Logo 旁显示「作品目录站 / Download Portal」；侧栏较窄时缩小 Logo 而不挤压文字",
      "原版 MF 下载表格的推荐度改用站点主题色，安装版 / 绿色版按钮增加悬停底色",
      "MW 作品的占位图改用 MarioWorker 标识，并放大占位图在缩略图中的比例",
      "列表 / 卡片视图的选择会被记住，切换目录、刷新页面或在新旧版界面之间切换后保持",
      "全局设置中的默认排序与资源站直链开关改为即时生效，无需刷新页面",
      "MW 关卡目录恢复「标记」列；卡片与详情抽屉中的「自带 MW / BGM」标记改用与列表一致的配色",
      "创作资源目录恢复「类型」列：以彩色标识区分引擎 / 拓展 / 特效 / 素材 / 工具 / MW 工具，列表与卡片同步显示，卡片中标识位于日期右侧",
      "Softendo 目录的「系列」列改用彩色标识（Mario / MFF / Flash / Non-Mario / Banesoft），列表与卡片一致",
      "Softendo 目录新增「制作软件」筛选，可按 Flash、Clickteam Fusion、GameMaker、其他筛选，并与系列、语言筛选叠加",
      "Softendo 作品详情的「系列」改用正式名称（如 Mario Forever Flash），不再显示内部标识",
      "作品详情：「版本与下载」与「数据包」合并为同一外框，文件名后逐个标注文件大小，MF、MW、创作资源保持一致",
      "作品详情：发布页移入「版本与下载」并随版本切换，按钮标注来源站点，中英文分别优先显示主发布页 / 备用发布页；列表的发布页图标同样按版本与语言取链接",
      "勾选「每个版本单独列出」时，详情只展示该版本的下载与发布页，列表、卡片与详情优先使用对应版本的 title 截图，顶部显示版本号，日期标签改为「发布日期」",
      "MW 目录恢复发布页、MW 下载、音乐包与数据包按钮（改用与旧版一致的归一化数据）；MW 详情标题对多作者作品显示「合作作品」，信息区仍列出全部作者",
      "MW「运行环境」的 SMWP 版本下载改为按钮，BGM 提示移至按钮下方；版本信息行只显示数值，不再出现「日期 / 文件名 / 文件大小」等文字标签",
      "MW 作品详情：「MW 版本」前加注 SMWP（MW 4.0 / 4.4 除外），不再显示「标签」一节；自带 MW 的作品，运行环境提示改为「本作品自带」",
      "MF 作品详情（中文）恢复旧版下载弹框的「游玩说明」：按安装程序 / .exe / .apk / macOS / Linux / 压缩包给出运行提示，手机端另有对应说明",
      "作品详情：作者信息旁新增「查看该作者的全部作品」，点击后用第一作者名筛选目录（国内 MF 作品由此也能查看同作者作品）；有资源站作者目录的作品另提供「浏览作者资源站目录」链接，MW 多作者作品则改为筛选「合作作品」",
      "MW 目录的作者搜索支持「合作作品」，输入该词即可一次筛出全部多作者关卡",
      "侧边栏底部新增「关于本站」页面"
    ],
    improvements_en: [
      "Drawers and the rail size to the dynamic viewport and reserve bottom safe-area space, so a browser's bottom bar no longer covers content; scrolling inside a drawer no longer moves the page behind it",
      "Catalog list: the Chinese interface no longer shows the English secondary title; on phones the author, version and date collapse into one small line under the title (MW versions carry the SMWP prefix); the \"N versions\" badge is gone once every version is listed separately",
      "Catalog list and card images are now 4:3; the card slider supports touch swiping and scales to the container so the current picture is always fully visible",
      "The rail is wider: 244px on desktop (was 208px), matching the phone drawer, and 208px in the 861-1024px range (was 176px)",
      "The logo now appears with \"Download Portal\" beside it; at the narrowest rail the mark shrinks instead of squeezing the wording",
      "The original MF download table's rating uses the site accent colour, and the installer and portable buttons gain a hover tint",
      "MW records without artwork now use the MarioWorker mark as their placeholder, drawn larger inside the tile",
      "The chosen list/card view is remembered across catalogs, reloads and the two interface designs",
      "The default sort and the File Hub direct-link switch in Global settings now apply immediately, without reloading the page",
      "The MW levels catalog shows its Mark column again, and the bundled-MW / BGM pills in cards and the detail drawer now use the same colours as the list",
      "The assets catalog shows its Type column again, with a coloured marker per type (engine, addon, effect, sprite, tool, MW tool) in both the list and cards; on cards the marker sits to the right of the date",
      "The Softendo catalog's Series column now uses the same coloured markers (Mario / MFF / Flash / Non-Mario / Banesoft) in the list and on cards",
      "The Softendo catalog gains a Made with filter for Flash, Clickteam Fusion, GameMaker and Other, which stacks with the series and language filters",
      "In a Softendo record's drawer, Series now shows the formal name (e.g. Mario Forever Flash) instead of the internal slug",
      "The detail drawer's Versions & downloads and Data package blocks share one frame, with each file name followed by its own size across MF, MW, assets",
      "The release post moved into Versions & downloads and follows the selected version; buttons name the hosting site, the primary or alternate post leads according to the language, and the list icon uses the same per-version, per-language link",
      "With \"list every version separately\" on, the drawer shows only that build's downloads and release post, while list, cards and drawer prefer that version's title screenshot, the version number appears at the top and the date label becomes Released",
      "The MW catalog regains its release post, MW download, music pack and data package buttons by using the same normalised data as the legacy design; the drawer labels multi-author levels as a collaboration while the facts section still lists every author",
      "In MW's Runtime block the SMWP version download is a button and the BGM note follows the buttons; the version line shows values only, without Date / File name / File size labels",
      "MW details now prefix the MW version with SMWP (MW 4.0 / 4.4 excepted), no longer show the Tags section, and say the level \"Comes with\" its MW when one is bundled",
      "The MF detail drawer restores the legacy download modal's play instructions for Chinese readers, with notes for installers, .exe, .apk, macOS, Linux and archives plus a phone-specific hint",
      "Detail drawers offer \"View all their works\" beside the author, filtering the catalog by the first author's name (now including domestic MF works); records with a File Hub author folder also link \"Open the author's folder (File Hub)\", while multi-author MW levels filter the collaboration label instead",
      "The MW catalog's author search accepts 合作作品, listing every multi-author level in one step",
      "A new About & Contact page at the bottom of the rail"
    ],
    fixes: [
      "修复有简介的作品在文档页不显示截图的问题：简介与图片原先互斥，导致带简介的条目（如 Mario Forever v4.4 Fixed Speedrun Edition、Spectrum Engine）只剩文字",
      "修复窄屏侧栏抽屉打开时切换页面偶尔被弹回原页面的问题：抽屉收起与路由跳转争用同一条浏览器历史记录，目标页打开后随即被撤销",
      "修复收回作品详情后地址栏仍保留 ?id= 参数的问题：关闭抽屉时的历史回退会恢复打开时写入的地址",
      "修复新版各页「最后更新」在数据更新后不刷新的问题：改为与旧版一致，运行时查询 GitHub 最新提交，数据单独部署、不重新构建时也能显示正确日期",
      "修复原版 MF 下载表格把 3.5 星显示成 3 星的问题：末尾的半星现在以较淡的主题色单独显示",
      "修复作品详情中下载按钮重复显示提取码的问题，并在提取码徽标前标注「提取码 / Code」",
      "修复 MW 工具类创作资源的占位图：改用 MarioWorker 标识",
      "修复桌面端详情抽屉打开时页面滚动条仍可见、可被拖动从而滚动背后列表的问题：抽屉展开期间隐藏页面滚动条并保留等宽留白，布局不会发生位移",
      "修复带 ?id= 的分享链接打开时不展开作品详情的问题：新版路由启动时替换地址会丢弃查询参数，现在只在真正切换页面时清理",
      "修复 Softendo 详情中自定义颜色下载按钮没有悬停反馈的问题：悬停时保持原色相并加深背景与边框",
      "修复 MW 详情「版本与下载」按钮上方出现空白的问题：空的版本名与信息行不再占位",
      "修复 MW「运行要求」筛选未纳入同时自带 MW 与需替换 BGM 的作品的问题：这两项要求现在可以同时命中",
      "修复标题搜索无法匹配下载文件名的问题：文件名改按单个文件加入索引，多文件 / 分卷版本同样可搜",
      "修复 Softendo 详情在作品同时使用多个制作软件时显示原始标识的问题：现改为显示软件全称（如 Flash, Clickteam Fusion）"
    ],
    fixes_en: [
      "Fixed missing screenshots on documentation entry cards that have a description: the description and the artwork were mutually exclusive, so described entries (such as Mario Forever v4.4 Fixed Speedrun Edition and Spectrum Engine) rendered only their text",
      "Fixed pages occasionally bouncing back to the one being left when switching tabs from the phone rail drawer: closing the drawer and the route change raced over the same history entry, so the new page was opened and then undone right away",
      "Fixed the ?id= parameter staying in the address bar after closing a record's detail drawer: unwinding the drawer's history entry restored the address written when it opened",
      "Fixed the redesigned pages showing a stale \"Last updated\" date after data-only deployments: the newest GitHub commit is now queried at runtime, like the legacy design",
      "Fixed the original MF download table rendering a 3.5-star rating as 3 stars: the trailing half star is now drawn in a lighter shade of the accent colour",
      "Fixed download buttons in the detail drawer showing the extraction code twice, and labelled the code badge with 提取码 / Code",
      "Fixed the placeholder for MW-tool assets: they now use the MarioWorker mark",
      "Fixed the page scrollbar staying visible beside an open detail drawer on desktop, where dragging its thumb still scrolled the catalog behind; the scrollbar is hidden while an overlay is open, with its width reserved so the layout does not shift",
      "Fixed shared ?id= links opening without the record's detail drawer: the redesigned router's startup URL normalisation dropped the query string, which is now kept unless the page really changes",
      "Fixed tone-coloured download buttons in Softendo details having no hover feedback: they now deepen their background and border while keeping their hue",
      "Fixed the empty strip above the downloads in MW details: empty version-name and meta lines no longer take up space",
      "Fixed the MW Runtime filter leaving out levels that both bundle their MW and need a custom BGM: the two requirements can now match together",
      "Fixed the title search ignoring download file names: each file is indexed on its own, including multi-file and multi-volume builds",
      "Fixed Softendo details showing raw slugs when a game lists several makers; the full names are now shown (e.g. Flash, Clickteam Fusion)"
    ],
    misc: [
      "英文版侧栏的站点名称补全为完整称呼（如 Mario Forever Community File Hub、Cloud Lounge Discord Server），中文版 B 站 / 抖音条目改用 Mario Forever 全称"
    ],
    misc_en: [
      "Full names in the English rail labels (e.g. Mario Forever Community File Hub, Cloud Lounge Discord Server)"
    ]
  },
  {
    version: "3.0.0-beta.0",
    date: "2026-11-14",
    features: [
      "全新界面设计：白色主区域 + 灰色导航栏与常驻筛选面板，紧凑列表 / 卡片双视图，深浅色模式",
      "搜索拆分为标题（含别名、文件名）与作者两栏，各自独立匹配",
      "新增「发布时间」筛选：按年份多选或按日期区间（精确到日）二选一，附今年 / 去年 / 近 30 天快捷项",
      "地区、平台、制作软件、年份、MW 版本等筛选均为多选；标签支持任一 / 同时 / 排除三态",
      "作品详情改为右侧抽屉，可逐条对比而不离开列表；文档页中的作品条目可原地展开",
      "页面标题显示在顶栏，页脚移入左侧导航栏；全局设置可在新旧两套界面间切换",
      "新版界面改为单页应用：切换页面不再刷新文档，URL 与浏览器前进 / 后退保持同步，内容区有淡入过渡而导航栏与顶栏保持不动",
      "各作品目录页新增「目录说明」抽屉，页面原有的说明文档可从顶栏按钮展开阅读，其中的致谢、音乐包放置说明等内容原地展开为卡片",
      "移动端筛选面板与导航栏均改为抽屉，选择导航项后自动收起；抽屉、全屏弹窗与图片预览支持 Android 返回键关闭",
      "目录页显示数据「最后更新」，结果栏横跨筛选栏上方；Softendo 目录的「系列」列支持排序"
    ],
    features_en: [
      "A completely new interface: white content canvas with a grey navigation rail and a persistent filter sidebar, list/card views and dark mode",
      "The search splits into two independent fields — titles (aliases and filenames included) and authors",
      "A new Release date filter: multiple years or an exact date range down to the day, with this year / last year / last 30 days shortcuts",
      "Region, platform, software, year and MW version filters are multi-select; tags support any / all / exclude states",
      "Game details open in a right-side drawer so records can be compared without leaving the list; embedded previews in the documentation expand in place",
      "The page title sits in the topbar and the footer moved into the left rail; global settings switch between the two designs",
      "The new interface is a single-page app: switching pages no longer reloads the document, the URL stays in sync with the back/forward buttons, and the content area fades while the rail and topbar stay still",
      "Each catalog page gains an About drawer where the page's own write-up opens from a topbar button, and blocks it links to (credits, the data-package note) expand in place as cards",
      "On phones the filter pane and the navigation rail both became drawers that close after choosing an entry; drawers, full-screen dialogs and the image viewer close on the Android back button",
      "Catalog pages show when their data was last updated, and the results bar spans the full width above the filter pane; the Softendo catalog's Series column is sortable"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "J2ME 版本的作品现在能正确识别",
      "下载提示补充 Java、Linux、macOS 版本的说明，Java 版不再显示无关的压缩包提示",
      "新增「AI 生成」「移植」两个标签",
      "MW 4.0 作品的作者链接改用 Mario Worker 4.4 的资源站目录"
    ],
    fixes_en: [
      "J2ME builds are now detected correctly",
      "Download tooltips explain the Java, Linux and macOS builds; Java versions no longer show an unrelated archive hint",
      "Added the AI Generated and Port tags",
      "Mario Worker 4.0 author links now point at the Mario Worker 4.4 File Hub folder"
    ],
    misc: [
      "移除 123 网盘链接，「备用地址」统一改称「备用链接」",
      "移动端中文版 Softendo 页使用侧栏短标题"
    ],
    misc_en: [
      "Removed 123pan links and renamed the secondary-address wording to secondary link throughout",
      "The Chinese Softendo page uses the short sidebar title on phones"
    ]
  },
  {
    version: "2.5.3",
    date: "2026-10-07",
    features: [
      "全站启用 Inter 字体",
      "非彩色文本外链右侧显示 ↗ 图标，便于区分外部链接",
      "Softendo 页的类型筛选与卡片圆点提示中，MFF 类型显示全称「Mario Forever Flash」"
    ],
    features_en: [
      "Applied the Inter font across the whole site",
      "External links shown as plain text now display a ↗ icon, making them easier to tell apart",
      "Added a Source Code link to the top bar",
      "The MFF type in the type filter and card dot tooltip on the Softendo page now shows its full name, Mario Forever Flash"
    ],
    improvements: [
      "筛选栏中的排序控件换行时作为整体显示，不再被拆分到多行",
      "统一各页面图标按钮间距，工具栏按钮组换行到行首时自动省去左侧边距",
      "列表视图中 MW 版本下载按钮增加左边距",
      "更新中英文说明文档的内容与措辞"
    ],
    improvements_en: [
      "Sort controls in the filter bars now wrap as a whole unit instead of being split across lines",
      "Unified icon button spacing; the toolbar button group now sits flush with the line start when wrapped",
      "Added a left margin to the MW version download button in the list view",
      "Updated the content and wording of the Chinese and English documentation"
    ],
    fixes: [
      "修复 MW 4.0 作品的资源站路径与显示，现与 MW 4.4 同等处理"
    ],
    fixes_en: [
      "Fixed the File Hub path and display for Mario Worker 4.0 levels, now treated the same as Mario Worker 4.4"
    ],
    misc: [
      "新增月报专栏生成脚本，支持输出 Markdown 与 Discuz BBCode 格式",
      "新增英文版 API 文档"
    ],
    misc_en: [
      "Added a monthly report generator script that outputs both Markdown and Discuz BBCode",
      "Added the English API documentation"
    ]
  },
  {
    version: "2.5.2",
    date: "2026-09-09",
    features: [
      "新增「更新履历」：页脚提供入口，弹窗展示自新版作品目录站设立以来的更新记录",
      "新增随机作品按钮，可随机打开一部作品的详情弹窗",
      "新增引擎页面（仅英文版）",
      "创作资源支持英文名称、作者与描述显示，英文界面下载链接名称改用英文名"
    ],
    features_en: [
      "Added Changelog: accessible from the footer, showing the site's update history since the launch of the new version of this site",
      "Added a random game button that opens a random game's details modal",
      "Added the MF Engines page (English only)",
      "Assets now support English names, authors and descriptions; download link names on the English UI now use the English names"
    ],
    improvements: [
      "作品详情弹窗的下载列表中，最新版本始终排在最前"
    ],
    improvements_en: [
      "In the game details modal, the latest version is now always sorted first in the download list"
    ],
    fixes: [
      "修复 SMWP 版本排序中预发布后缀的比较错误（beta.2 现在正确排在 beta.1 之前）",
      "修复页面工具栏提示框的显示位置"
    ],
    fixes_en: [
      "Fixed prerelease suffix comparison in SMWP version sorting, so beta.2 now sorts above beta.1",
      "Fixed the tooltip position in the page toolbar"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.5.1",
    date: "2026-08-31",
    features: [
      "Softendo 页新增语言字段，可按游戏支持的语言筛选",
      "创作资源链接（社区资源站）支持中英双语",
      "作品说明支持 txt 文件格式",
      "作品详情弹窗的下载条目自动标注最新版本",
      "新增全局默认排序设置",
      "新增 MW 4.0 版本选项，统一 MW 版本名称显示"
    ],
    features_en: [
      "Added a language field to the Softendo page so games can be filtered by the languages they support",
      "Asset links (File Hub) now support both Chinese and English",
      "Game descriptions now support .txt files",
      "The download entries in the game details modal are now automatically badged with the latest version",
      "Global Settings: Added default sort setting",
      "Added the MW 4.0 version option and unified MW version name display"
    ],
    improvements: [
      "下线 CDN 源下载渠道",
      "创作资源页类型筛选改为下拉菜单",
      "语言切换后保持排序等交互优化"
    ],
    improvements_en: [
      "Removed the CDN download mirror",
      "The type filter on the Assets page is now a dropdown menu",
      "Interaction improvements such as keeping the current sort order after switching languages"
    ],
    fixes: [
      "修复深色模式下返回顶部按钮的箭头颜色"
    ],
    fixes_en: [
      "Fixed the back-to-top button arrow color in dark mode"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.5.0",
    date: "2026-08-12",
    features: [
      "新增静态 JSON API，提供作品与下载数据接口",
      "新增全局设置，可切换资源站直链下载",
      "Softendo 页支持自解压与 Kliktopia 重打包下载类型",
      "SMWP 下载弹窗新增数据包下载按钮"
    ],
    features_en: [
      "Added a static JSON API providing game and download data endpoints",
      "Added Global Settings with a File Hub direct link toggle",
      "The Softendo page now supports self-extracting and Kliktopia repacked download types",
      "Added a data package download button to the SMWP download modal"
    ],
    improvements: [
      "SMWP 程序下载项显示文件大小"
    ],
    improvements_en: [
      "SMWP downloads now show file sizes"
    ],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "2.4.3",
    date: "2026-08-03",
    features: [
      "支持 CDN 源下载",
      "新增模糊搜索，字母拼错也能搜到所需结果",
      "标签与类型筛选支持三态组合（或 / 且 / 排除）",
      "新增「已取消」标签与「仅看有图」筛选选项"
    ],
    features_en: [
      "Added CDN mirror downloads",
      "Added fuzzy search that finds results even with misspelled letters",
      "Tag and genre filters now support tri-state combinations (OR / AND / NOT)",
      "Added the \"Cancelled\" tag and a \"with images\" filter option"
    ],
    improvements: [
      "搜索匹配优化与界面细节调整"
    ],
    improvements_en: [
      "Search matching improvements and minor UI tweaks"
    ],
    fixes: [
      "修复多位作者顺序被打乱的问题",
      "修复 SMWP 四位版本号的匹配",
      "修复 Softendo 部分游戏的下载链接"
    ],
    fixes_en: [
      "Fixed the shuffled order of multiple authors",
      "Fixed matching of four-digit SMWP version numbers",
      "Fixed download URLs for some Softendo games"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.4.2",
    date: "2026-07-16",
    features: [
      "MF 作品页新增标签系统与标签筛选，支持「未分类」选项",
      "Softendo 页新增类型筛选与页面介绍",
      "MF 作品弹窗展示游戏类型，并支持版本级软件类型筛选"
    ],
    features_en: [
      "Added a tag system with tag filtering to the MF fangames page, including an \"Untagged\" option",
      "Added genre filtering and page introductions to the Softendo page",
      "The MF game details modal now shows genres and supports version-level software filtering"
    ],
    improvements: [
      "优化标签弹窗动效与滚动锁定等交互细节，移除筛选全选按钮",
      "资源导航布局优化：中文页新增标签页分类导航"
    ],
    improvements_en: [
      "Polished tag modal transitions, scroll locking and other interactions; removed the select-all filter button",
      "Added tab-based category navigation to the Chinese MF index page"
    ],
    fixes: [
      "修复年份筛选逻辑错误"
    ],
    fixes_en: [
      "Fixed a year filter logic error"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.4.1",
    date: "2026-07-14",
    features: [
      "Softendo 页新增图文介绍，支持多软件标签显示",
      "筛选收起时仍可按操作系统筛选",
      "支持按版本加载作品截图"
    ],
    features_en: [
      "The Softendo page gained illustrated introductions and multi-software label display",
      "Operating system filters now remain available while the filter panel is collapsed",
      "Showcase screenshots can now be loaded per version"
    ],
    improvements: [
      "Softendo 列表与详情页重构",
      "部分页面名称由「汇总」改为「目录」",
      "列表数量统计与排序界面调整"
    ],
    improvements_en: [
      "Refactored the Softendo page",
      "Adjusted the entry count statistics and sorting UI"
    ],
    fixes: [
      "修复 MW 索引页切换标签时轮播图未重置的问题",
      "修复 Softendo 作品弹窗发布信息显示"
    ],
    fixes_en: [
      "Fixed the MW index page carousel not resetting when switching tabs",
      "Fixed release info display in the Softendo game modal"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.4.0",
    date: "2026-07-12",
    features: [
      "新增 Softendo 游戏目录页",
      "中文版首页新增 Mario Forever 发展历史介绍弹窗"
    ],
    features_en: [
      "Added the Softendo Games Catalog page",
      "Added a Mario Forever history intro modal to the Chinese MF index page"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复下拉菜单被遮挡的层级问题",
      "修复作品详情弹窗对部分旧版国外作品的处理"
    ],
    fixes_en: [
      "Fixed dropdown menus being covered by other elements",
      "Fixed the details modal handling of some old versions of international fangames"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.3.5",
    date: "2026-07-02",
    features: [
      "MF 作品、MW 关卡与创作资源页支持显示文件大小",
      "作品列表新增「软件类型」字段与筛选"
    ],
    features_en: [
      "MF fangames, MW levels and Assets now show download file sizes",
      "Added a \"software\" filter to the fangames list"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复日期解析问题，兼容 YAML 1.1 日期格式"
    ],
    fixes_en: [
      "Fixed date parsing to stay compatible with YAML 1.1 dates"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.3.4",
    date: "2026-06-14",
    features: [
      "作品列表新增平台筛选与主题（节日）筛选"
    ],
    features_en: [
      "Added platform and theme (festival) filters to the fangames list"
    ],
    improvements: [
      "预加载站点 Logo，优化轮播控件样式",
      "构建优化：改进分包逻辑并迁移至 bun 包管理器"
    ],
    improvements_en: [
      "Preloaded the site logo and polished carousel controls",
      "Build optimizations: improved chunk splitting and migrated to the bun package manager"
    ],
    fixes: [
      "修复英文页面国内作品的下载链接显示"
    ],
    fixes_en: [
      "Fixed download link display for Chinese fangames on English pages"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.3.3",
    date: "2026-04-20",
    features: [
      "MW 关卡页新增 SMWP 音乐包存放说明弹窗"
    ],
    features_en: [
      "Added a modal to the MW levels page explaining where SMWP music data are stored"
    ],
    improvements: [
      "移动端适配优化：导航栏与容器内边距、组件全屏宽度显示、防止导航文本换行"
    ],
    improvements_en: [
      "Mobile adaptation improvements: navbar and container padding, full-width components on small screens, and no more navbar text wrapping"
    ],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "2.3.2",
    date: "2026-04-19",
    features: [
      "创作资源页新增详情弹窗",
      "MW 关卡汇总页更新：新增对 Mario Worker 4.4 关卡的支持，关卡年份筛选范围扩充至 2010 年"
    ],
    features_en: [
      "Added a details modal to the Assets page",
      "MW Level Downloads page update: added support for Mario Worker 1.1 levels and extended the year filter back to 2010"
    ],
    improvements: [
      "资源弹窗改为异步加载，打开更流畅",
      "永硕网盘提取码统一改称「密码」"
    ],
    improvements_en: [
      "The assets details modal now loads asynchronously for smoother opening"
    ],
    fixes: [
      "修复作品详情弹窗中单版本与多版本的发布、更新时间显示逻辑"
    ],
    fixes_en: [
      "Fixed release/update date display logic for single- and multi-version games in the details modal"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.3.1",
    date: "2026-04-05",
    features: [
      "创作资源页支持工具类资源及无日期条目",
      "MF 作品页支持版本级别源代码仓库"
    ],
    features_en: [
      "The Assets page now supports tool-type resources and entries without dates",
      "MF fangames now support version-level source repositories"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复资源条目未指定变体时名称显示错误",
      "修复资源弹窗显示问题",
      "修复锚点跳转被顶部导航遮挡等问题"
    ],
    fixes_en: [
      "Fixed incorrect names for asset entries without a specified variant",
      "Fixed assets modal display issues",
      "Fixed anchor jumps being hidden behind the top navbar and similar issues"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.3.0",
    date: "2026-04-02",
    features: [
      "MF 资源导航（仅中文版）正式上线：首页新增作品、关卡、创作资源等入口卡片"
    ],
    features_en: [
      "Introducing a new version of the MF index page (Chinese only): the MF index page now has entry cards for fangames, levels, assets and more"
    ],
    improvements: [
      "图片加载优化：新增缓存与懒加载"
    ],
    improvements_en: [
      "Image loading improvements: added caching and lazy loading"
    ],
    fixes: [
      "修复同名作品图片与介绍映射错误",
      "修复 MW 索引页默认截图标签及样式问题"
    ],
    fixes_en: [
      "Fixed image/description mapping errors between games with identical names",
      "Fixed the default screenshot tab and styling issues on the MW index page"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.2.0",
    date: "2026-03-18",
    features: [
      "新增 Mario Worker（MW）索引页（仅英文版）"
    ],
    features_en: [
      "Added the Mario Worker (MW) index page (English only)"
    ],
    improvements: [
      "页脚显示站点构建时间",
      "构建优化：构建后压缩数据文件并优化打包配置"
    ],
    improvements_en: [
      "The footer now shows the site build time",
      "Build optimizations: data files are compressed after building and the bundling config was improved"
    ],
    fixes: [
      "修复作品详情弹窗中链接过长不换行的问题",
      "修复卡片列表最后一行间距等样式问题"
    ],
    fixes_en: [
      "Fixed long links not wrapping in the game details modal",
      "Fixed spacing of the last row in card lists and similar style issues"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.1.2",
    date: "2026-03-12",
    features: [],
    features_en: [],
    improvements: [
      "多项深色模式细节优化（复选框配色、按钮状态等）",
      "优化悬停效果与页面过渡动画",
      "视频链接改为列表样式",
      "更新部分图标",
      "合并 Nextcloud 下载源的域名标注"
    ],
    improvements_en: [
      "Many dark mode refinements (checkbox colors, button states, etc.)",
      "Improved hover effects and page transition animations",
      "Video links are now displayed as a list",
      "Updated some icons",
      "Merged domain labels for Nextcloud download sources"
    ],
    fixes: [
      "修复按钮垂直位移问题",
      "修复深色模式下按钮激活状态的可见性"
    ],
    fixes_en: [
      "Fixed buttons shifting vertically",
      "Fixed active button visibility in dark mode"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.1.1",
    date: "2026-03-10",
    features: [
      "首页图集支持切换原版 / Mario Forever Remake / Mario Forever Community Edition 多个图库",
      "打开详情弹窗时同步更新页面标题"
    ],
    features_en: [
      "The MF index page gallery now switches between the Original / Mario Forever Remake / Mario Forever Community Edition galleries",
      "The page title now updates when the details modal opens"
    ],
    improvements: [
      "优化首页图库切换标签与简介引用块样式",
      "简介中的链接自动识别为可点击链接"
    ],
    improvements_en: [
      "Polished MF index page gallery tabs and description blockquote styles",
      "Links in descriptions are now auto-detected and clickable"
    ],
    fixes: [
      "修复 D3D9 版本号的识别与处理",
      "统一提取码冒号为半角字符",
      "修复下载按钮行高"
    ],
    fixes_en: [
      "Fixed recognition and handling of D3D9 version numbers",
      "Fixed download button line height"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.1.0",
    date: "2026-03-10",
    features: [
      "支持通过 URL 参数直接打开作品详情弹窗，方便分享作品链接"
    ],
    features_en: [
      "Game details modals can now be opened directly via URL parameters, making game links shareable"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复带 D3D9 标识的版本号识别"
    ],
    fixes_en: [
      "Fixed recognition of version numbers with D3D9 tags"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.1.0-beta.3",
    date: "2026-03-10",
    features: [
      "详情弹窗支持展示作者主页链接与作品 Logo 图片"
    ],
    features_en: [
      "The details modal now shows author homepage links and game logo images"
    ],
    improvements: [
      "重构游戏数据的下载与展示逻辑"
    ],
    improvements_en: [
      "Refactored game data download and display logic"
    ],
    fixes: [
      "修复 MW 关卡搜索的 bug"
    ],
    fixes_en: [
      "Fixed MW level search bug"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.1.0-beta.2",
    date: "2026-03-09",
    features: [
      "详情弹窗截图支持左右切换浏览"
    ],
    features_en: [
      "Details modal screenshots can now be browsed with prev/next navigation"
    ],
    improvements: [
      "移动端「展开全部版本」按钮更易点选",
      "优化详情弹窗按钮样式"
    ],
    improvements_en: [
      "The \"Expand all versions\" button is easier to tap on mobile",
      "Polished details modal button styles"
    ],
    fixes: [
      "修复简介中 Markdown 换行显示异常",
      "修复截图未按编号排序的问题"
    ],
    fixes_en: [
      "Fixed broken Markdown line breaks in descriptions",
      "Fixed showcase screenshots not being sorted by number"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.1.0-beta.1",
    date: "2026-03-09",
    features: [
      "详情弹窗为重打包版本添加标识标签"
    ],
    features_en: [
      "The details modal now tags repackaged versions"
    ],
    improvements: [
      "统一卡片版本号显示样式与全站组件字体",
      "优化游戏卡片布局"
    ],
    improvements_en: [
      "Unified card version number styling and site-wide component fonts",
      "Improved game card layout"
    ],
    fixes: [
      "修复自带 MW 作品的标注显示",
      "修复游戏卡片圆点分隔间距"
    ],
    fixes_en: [
      "Fixed the badge display for games that bundle Mario Worker",
      "Fixed dot separator spacing on game cards"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.1.0-beta.0",
    date: "2026-03-09",
    features: [
      "新增作品详情弹窗，点击作品名称即可查看，弹窗内支持跳转作品源码仓库"
    ],
    features_en: [
      "Added a game details modal - click a game's name to view it, with links to the game's source repository inside"
    ],
    improvements: [
      "作品简介与详细描述分离展示",
      "优化「最近更新」时间的统计方式与游戏图片的解析加载逻辑"
    ],
    improvements_en: [
      "Short descriptions and full descriptions are now displayed separately",
      "Improved \"last update\" time calculation and the game image resolver/loading logic"
    ],
    fixes: [
      "修复弹窗背景遮罩层级问题",
      "统一「重打包」字样表述"
    ],
    fixes_en: [
      "Fixed modal backdrop stacking order",
      "Unified the \"repackaged\" wording"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.0.1",
    date: "2026-03-06",
    features: [
      "顶部导航栏滚动时自动固定在页面顶部"
    ],
    features_en: [
      "The top navbar now sticks to the top of the page when scrolling"
    ],
    improvements: [
      "优化顶部导航与整体字体样式、深色模式阴影效果"
    ],
    improvements_en: [
      "Polished the top navbar, site-wide typography and dark mode shadows"
    ],
    fixes: [
      "修复创作资源页标题错误",
      "修复创作资源页语言切换行为与控制台警告"
    ],
    fixes_en: [
      "Fixed a wrong page title on the Assets page",
      "Fixed language switching behavior and console warnings on the Assets page"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.0.0",
    date: "2026-03-05",
    features: [
      "2.0 正式版发布"
    ],
    features_en: [
      "Version 2.0 released"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "2.0.0-beta.3",
    date: "2026-03-05",
    features: [
      "创作资源页支持同一资源包含多个下载文件",
      "新增 GitHub 下载源支持",
      "创作资源下载弹窗显示版本号"
    ],
    features_en: [
      "The Assets page now supports multiple download files per asset",
      "Added GitHub as a download source",
      "The assets download modal now shows version numbers"
    ],
    improvements: [
      "资源类型「引擎」更名为「制作模板（引擎）」，并优化筛选选项文案"
    ],
    improvements_en: [
      "Improved filter wording"
    ],
    fixes: [
      "修复拓展资源的下载链接错误"
    ],
    fixes_en: [
      "Fixed addon download links"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.0.0-beta.2",
    date: "2026-03-05",
    features: [
      "作品与关卡列表的显示模式切换现在会被记住"
    ],
    features_en: [
      "The list/card display mode of the fangames and level lists is now remembered"
    ],
    improvements: [
      "优化导航栏间距与创作资源页英文顶部提示的细节显示"
    ],
    improvements_en: [
      "Improved navbar spacing and details of the English top banner on the Assets page"
    ],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "2.0.0-beta.1",
    date: "2026-03-05",
    features: [
      "创作资源汇总新增「素材」类型",
      "创作资源卡片新增作者信息弹窗与源码仓库链接",
      "支持展示没有日期的资源条目"
    ],
    features_en: [
      "Added the Sprite type to the Assets hub",
      "Asset cards gained an author info modal and source repository links",
      "Asset entries without dates are now supported"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复部分资源变体的下载链接错误"
    ],
    fixes_en: [
      "Fixed download links for some asset variants"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "2.0.0-beta.0",
    date: "2026-03-05",
    features: [
      "全新创作资源汇总页面（仅中文版）上线",
      "备用下载链接支持显示网盘提取码，并新增夸克网盘识别"
    ],
    features_en: [
      "Launched the brand-new Assets catalog page (Chinese only)",
      "Alternate download links can now show YSEpan extraction codes, with Quark drive recognition added"
    ],
    improvements: [
      "导航栏在移动端改为下拉菜单，优化头部与卡片样式并完善深色模式"
    ],
    improvements_en: [
      "The header nav becomes a dropdown on mobile; header and card styles were refined and dark mode improved"
    ],
    fixes: [
      "修复游戏介绍页失效的 123 云盘链接"
    ],
    fixes_en: [
      "Fixed broken 123pan links on game description pages"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.7.1",
    date: "2026-02-12",
    features: [
      "下载捆绑工具栏的安装包时会显示警示提醒"
    ],
    features_en: [
      "A warning now appears when downloading installers bundled with the toolbar"
    ],
    improvements: [
      "游戏卡片外部链接改为在新标签页打开"
    ],
    improvements_en: [
      "External links on game cards now open in new tabs"
    ],
    fixes: [
      "修复重打包作品下载链接错误的问题"
    ],
    fixes_en: [
      "Fixed repackaged game download links"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.7.0",
    date: "2026-01-19",
    features: [
      "支持为同一作品同时显示多个下载链接",
      "游戏卡片新增 SMWP 下载链接",
      "MW 作品支持作者文件夹链接"
    ],
    features_en: [
      "Games can now have multiple download links displayed simultaneously",
      "Game cards now include SMWP download links",
      "MW games now support author folder links"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复提取码复制按钮的语言判断错误"
    ],
    fixes_en: [
      "Fixed a language detection error in the copy-code button"
    ],
    misc: [
      "修复 CI 数据校验配置"
    ],
    misc_en: [
      "Fixed the CI data validation configuration"
    ]
  },
  {
    version: "1.6.5",
    date: "2026-01-15",
    features: [
      "为国外 MF 作品新增作者文件夹链接功能",
      "搜索框添加清除按钮"
    ],
    features_en: [
      "Added author folder links for international MF fangames",
      "Added a clear button to the search box"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复部分安卓作品下载链接错误的问题"
    ],
    fixes_en: [
      "Fixed download links for some Android games"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.6.3",
    date: "2026-01-10",
    features: [],
    features_en: [],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复安卓版同人游戏下载链接缺少作者名的问题"
    ],
    fixes_en: [
      "Fixed Android fangame download links missing the author name"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.6.2",
    date: "2025-12-28",
    features: [],
    features_en: [],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复复制按钮提示框定位问题，改用 Floating UI 自动定位"
    ],
    fixes_en: [
      "Fixed copy button tooltip positioning by switching to Floating UI"
    ],
    misc: [
      "优化 YAML 数据校验 CI 流程"
    ],
    misc_en: [
      "Improved the YAML data validation CI workflow"
    ]
  },
  {
    version: "1.6.1",
    date: "2025-12-01",
    features: [
      "新增「未指定 SMWP 版本」筛选选项"
    ],
    features_en: [
      "Added an \"unspecified SMWP version\" filter option"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复资源站链接中文件名的显示问题"
    ],
    fixes_en: [
      "Fixed file name display in File Hub links"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.6.0",
    date: "2025-11-22",
    features: [],
    features_en: [],
    improvements: [],
    improvements_en: [],
    fixes: [],
    fixes_en: [],
    misc: [
      "升级站点依赖（Vite、Axios、js-yaml 等）"
    ],
    misc_en: [
      "Upgraded site dependencies (Vite, Axios, js-yaml, etc.)"
    ]
  },
  {
    version: "1.5.8",
    date: "2025-10-25",
    features: [
      "支持展示作品的 GitHub 仓库链接"
    ],
    features_en: [
      "Games can now show their GitHub repository links"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "1.5.7",
    date: "2025-09-08",
    features: [
      "新增 MF Space 英文论坛入口"
    ],
    features_en: [
      "Added the MF Space forum link"
    ],
    improvements: [
      "顶部菜单适配深色模式"
    ],
    improvements_en: [
      "The top menu now adapts to dark mode"
    ],
    fixes: [
      "修复部分弹窗内容过多导致移动端无法关闭的问题"
    ],
    fixes_en: [
      "Fixed modals with too much content becoming unclosable on mobile"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.5.6",
    date: "2025-08-25",
    features: [
      "移动端顶部导航支持折叠",
      "MF 作品页新增社区贡献者致谢列表"
    ],
    features_en: [
      "The top navbar is now collapsible on mobile",
      "Added a community contributors credits list to the MF fangames page"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "1.5.5",
    date: "2025-08-12",
    features: [],
    features_en: [],
    improvements: [
      "重做重打包作品标识，按具体版本标注重打包信息"
    ],
    improvements_en: [
      "Redesigned the repackaged badge to show repackaging info per specific version"
    ],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "1.5.2",
    date: "2025-08-10",
    features: [
      "支持安卓（.apk）作品文件，并在下载时提示安装方式",
      "顶部导航新增 Cloud Lounge 入口"
    ],
    features_en: [
      "Added support for Android (.apk) games with install instructions at download time",
      "Added the Cloud Lounge link to the top navbar"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "1.5.1",
    date: "2025-08-09",
    features: [
      "下载弹窗针对不同文件格式给出对应提示（仅支持中文）"
    ],
    features_en: [
      "Download modals now show format-specific tips (Chinese only)"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "最后更新时间改为跟随访客当地时区显示"
    ],
    fixes_en: [
      "Last update times now follow the visitor's local timezone"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.5.0",
    date: "2025-08-07",
    features: [
      "作品列表新增作品封面图展示",
      "贴吧链接支持通过社区备份站访问"
    ],
    features_en: [
      "Added cover image display to the fangames list",
      "Tieba links are now accessible via the community archive site"
    ],
    improvements: [
      "原版 MF 页新增最后更新日期显示"
    ],
    improvements_en: [
      "The Original MF page now shows the last update date"
    ],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "1.4.1",
    date: "2025-08-06",
    features: [],
    features_en: [],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复选择版本时误触发下载弹窗的问题"
    ],
    fixes_en: [
      "Fixed the download modal being triggered accidentally when selecting a version"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.4.0",
    date: "2025-08-06",
    features: [
      "作品列表支持卡片视图，宽屏模式下可在列表与卡片间切换"
    ],
    features_en: [
      "The fangames list supports card view; wide screens can switch between list and card layouts"
    ],
    improvements: [
      "适配 SMWP v1.7.11 音乐包的 BGM 标识，SMWP 版本筛选支持带字母的版本号"
    ],
    improvements_en: [
      "Adapted BGM badges for SMWP v1.7.11 music packs; the SMWP version filter accepts version numbers with letters"
    ],
    fixes: [
      "修复页面报错问题",
      "修复非最新版本的下载链接处理"
    ],
    fixes_en: [
      "Fixed page errors",
      "Fixed download link handling for non-latest versions"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.3.7",
    date: "2025-07-07",
    features: [
      "支持按文件名搜索条目",
      "作品详情支持查看并复制数据包提取码"
    ],
    features_en: [
      "Entries can now be searched by file name",
      "Game details can now show and copy data package extraction codes"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "1.3.6",
    date: "2025-06-26",
    features: [
      "列表页新增条目数量统计"
    ],
    features_en: [
      "List pages now show entry count statistics"
    ],
    improvements: [
      "调整中文页面标题，修正标记圆点文案"
    ],
    improvements_en: [
      "Adjusted Chinese page titles and corrected the status dot wording"
    ],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "1.3.5",
    date: "2025-05-31",
    features: [
      "SMWP 作品新增版本筛选，并新增仅显示已收录 SMWP 作品的选项"
    ],
    features_en: [
      "Added a version filter for SMWP games and an option to show only games with SMWP bundled"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复深色模式下滚动条不可见的问题"
    ],
    fixes_en: [
      "Fixed invisible scrollbars in dark mode"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.3.4",
    date: "2025-05-31",
    features: [
      "MW 关卡条目新增状态标记圆点"
    ],
    features_en: [
      "MW level entries gained status dot indicators"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "1.3.3",
    date: "2025-05-31",
    features: [],
    features_en: [],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复国外作品数据包旧版本未按规则归到 old-versions 目录下的问题"
    ],
    fixes_en: [
      "Fixed old data packages of international games not being filed under the old-versions directory"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.3.2",
    date: "2025-05-31",
    features: [
      "国外作品旧版本自动识别并归到 old-versions 目录下"
    ],
    features_en: [
      "Old versions of international games are now auto-detected and filed under the old-versions directory"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "1.3.1",
    date: "2025-05-31",
    features: [
      "展开版本列表时标识当前最新版本"
    ],
    features_en: [
      "The current latest version is now marked when the version list is expanded"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  },
  {
    version: "1.3.0",
    date: "2025-05-31",
    features: [
      "作品卡片支持展开查看全部作品版本",
      "筛选栏新增重置筛选按钮",
      "条目新增「国内/国外作品」标识"
    ],
    features_en: [
      "Game cards can now be expanded to view all game versions",
      "Added a reset button to the filter bar",
      "Entries gained \"Chinese/International\" badges"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复筛选图标等细节样式"
    ],
    fixes_en: [
      "Fixed filter icon and other minor styles"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.2.1",
    date: "2025-05-31",
    features: [],
    features_en: [],
    improvements: [
      "返回顶部按钮等界面细节样式微调"
    ],
    improvements_en: [
      "Minor style tweaks such as the back-to-top button"
    ],
    fixes: [],
    fixes_en: [],
    misc: [
      "构建工具 Vite 升级至 v6"
    ],
    misc_en: [
      "Upgraded Vite to v6"
    ]
  },
  {
    version: "1.2.0",
    date: "2025-05-30",
    features: [
      "新增深色模式"
    ],
    features_en: [
      "Added dark mode"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复深色模式下表格边框、复制图标边框等显示问题"
    ],
    fixes_en: [
      "Fixed table borders, copy icon borders and other dark mode display issues"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.1.1",
    date: "2025-05-12",
    features: [
      "MW 关卡页支持同一作品多个关卡文件",
      "新增返回顶部按钮"
    ],
    features_en: [
      "MW levels page supports multiple filenames per game",
      "Added a back-to-top button"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复文件名含特殊字符时下载链接无法访问的问题"
    ],
    fixes_en: [
      "Fixed inaccessible download links for file names with special characters"
    ],
    misc: [],
    misc_en: []
  },
  {
    version: "1.1.0",
    date: "2025-02-04",
    features: [
      "MW 关卡新增社区资源站下载链接"
    ],
    features_en: [
      "Added Community File Hub download links for MW levels"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [
      "修复部分资源站链接无效的问题",
      "修复「最后更新」日期格式显示错误",
      "修复 files.fm 下载源名称显示错误",
      "修复 Cloudflare Pages 构建失败的问题"
    ],
    fixes_en: [
      "Fixed some invalid File Hub links",
      "Fixed incorrect \"last update\" date formatting",
      "Fixed the files.fm download source name display",
      "Fixed Cloudflare Pages build failures"
    ],
    misc: [
      "升级 Vite、nanoid 依赖"
    ],
    misc_en: [
      "Upgraded Vite and nanoid dependencies"
    ]
  },
  {
    version: "1.0.0",
    date: "2024-10-19",
    features: [
      "新版 Mario Forever 作品汇总站正式上线",
      "将国内/国外/重打包作品汇总页合并为一个页面，支持中英文切换",
      "支持按作品名称、作者、发布日期排序，列表默认按最新版本发布日期倒序",
      "新增筛选功能，可按名称、英文名、别名、缩写、作者、版本、国内/国外作品快速查找",
      "多版本作品折叠为一个条目，可选择特定版本查看该版本的发布链接与下载链接",
      "新增「Wiki 页面」按钮，可跳转至作品对应的 Wiki 页面",
      "新增「相关视频」按钮，用于收录玩家的通关录像、解说视频与二次创作等内容",
      "为带单独数据包（如音乐包）的作品提供数据包下载链接，并支持复制提取码"
    ],
    features_en: [
      "The new Mario Forever fangames download site officially launched",
      "Merged the Chinese/international/repackaged game pages into a single page with Chinese/English switching",
      "Sorting by game name, author and release date; the list defaults to newest release date first",
      "New filtering to quickly find games by name, alias, abbreviation, author, version or Chinese/international origin",
      "Multi-version games are collapsed into one entry where a specific version can be selected to view its release and download links",
      "Added a \"Wiki page\" button linking to each game's wiki page",
      "Added a \"related videos\" button to collect playthroughs, commentary videos and fan creations",
      "Games with separate data packages (e.g. music packs) offer data package download links, with copyable extraction codes"
    ],
    improvements: [],
    improvements_en: [],
    fixes: [],
    fixes_en: [],
    misc: [],
    misc_en: []
  }
];
