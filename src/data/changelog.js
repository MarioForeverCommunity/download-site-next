// 站点更新履历（中英双语）
// - version：站点版本号（对应 git tag，去掉 v 前缀）；date 为该 tag 所在提交的日期
// - features / improvements / fixes / misc：新功能 / 优化 / 修复 / 其他，按版本从新到旧排列
// - features_en / improvements_en / fixes_en / misc_en：对应英文条目；缺失时前端回退显示中文
// - 条目仅收录站点本身的改动，不收录数据（data / list / yaml）更新记录
export const changelog = [
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
      "修复 Softendo 部分游戏的下载地址"
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
