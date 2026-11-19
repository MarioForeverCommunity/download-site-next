# Agent 指南：download.marioforever.net

本文件面向在此仓库中工作的 **AI Agent**（Claude Code、Cursor、Copilot 等）与开发者，提供动手编码前必须了解的核心事实。请先通读全文；凡涉及**数据字段、下载链接或静态 JSON API** 的任务，务必遵循第 2 节的「镜像一致性」约束——这是本仓库最容易改出问题的地方。

## 1. 项目是什么

download.marioforever.net 是一个 **Vue 3 静态站点**，用 Vite + 纯 JavaScript 构建，以中英双语收录并展示：

- Mario Forever 原版与同人作品（MF）
- Super Mario Worker Project 关卡（SMWP / MW）
- 创作资源（引擎、拓展、素材、特效、工具）
- 制作模板（引擎）导航页（Engines，仅英文版）
- Softendo / Buziol Games 游戏

它本质上是「**数据驱动的目录站**」：全部内容存放在 `public/data/*.yaml`，前端页面运行时读取渲染，构建时再聚合生成一份**静态 JSON API** 供第三方使用；站点自身的更新履历（Changelog）则存放在 `src/data/changelog.js`（见第 7 节）。

## 2. 数据流与「镜像一致性」

```
public/data/*.yaml          ← 唯一数据源
   │ 运行时读入（src/util/ReadList.js + 各 use*List.js）
   ▼
前端页面组件（GameCard、各 Entry 组件……）
   │ 构建时聚合（scripts/generate-api.js）
   ▼
public/api/*.json           ← 静态 JSON API（生成产物）
```

⚠️ **下载链接与字段的构建规则在「前端 util」与「API 生成脚本」之间是镜像关系**：

- 前端侧：`src/util/GameUtil.js`（MF/MW 链接）、`src/util/SoftendoUtil.js`、`src/util/AssetUtil.js`、`src/components/OriginalMfTable.vue`
- API 侧：`scripts/generate-api.js` 中对应的 `*Base*` / `*FileUrl` 逻辑

**修改路径规则时两侧必须同步修改**，否则会出现「网页上能下载、API 里 404」或字段对不上的 bug。前端侧的归一化入口是 `src/util/useMfList.js`（`normalizeMfEntry`）。

## 3. 硬性约束

| 类别 | 约束 |
| --- | --- |
| 包管理器 | **只用 bun**，禁止 npm / yarn / pnpm |
| 语言 | 纯 JavaScript（ES Modules），**无 TypeScript** |
| Vue | Composition API，`<script setup>` |
| 构建 | Vite 8 + Rolldown，target ES2022 |
| 样式 | CSS，`<style scoped>` + `@import "../assets/general.css"` |
| 产物 | 构建含 gzip/brotli 压缩（>5KB）；`BUILD_TIME` 只读全局 |
| 图标 | 统一用 **Font Awesome Free**（SVG 按需引入），在 `src/components/icons/iconMap.js` 登记；不再新增单图标组件或 emoji 图标 |
| 注意 | Vite 8 的 `manualChunks` 必须用**函数形式**，不能用对象形式 |

## 4. 常用命令

| 命令 | 作用 |
| --- | --- |
| `bun run dev` | 本地开发（HMR） |
| `bun run build` | 生产构建：图片索引 → API → Vite 构建 → 压缩 |
| `bun run preview` | 预览生产构建 |
| `bun run lint`（可加 `-- <file>`） | ESLint 自动修复 |
| `bun run generate-images` | 生成 `public/data/image-index.json` |
| `bun run generate-api` | 重新生成 `public/api/` |
| `bun run deploy` | 执行 deploy.sh |

> 修改 YAML 数据或 `generate-api.js` 后需运行 `bun run generate-api`；`public/api/` 是**生成产物，禁止手改**（会被 `bun run build` 覆盖）。

## 5. 目录结构

```
public/data/                  YAML 数据 + 各作品图片
├── list-mf.yaml              MF 同人作品
├── list-mw.yaml              SMWP 关卡
├── list-assets.yaml          创作资源
├── list-softendo.yaml        Softendo 游戏
├── list-original-mf.yaml     原版 MF 版本
├── image-index.json          （生成物）图片索引
├── mf-games|mw-levels|assets|softendo/   各作品图片目录
└── mf-index|mw-index/        首页图库图片（原版 / MF Remake / MFCE、MW）
public/api/                   （生成物）静态 JSON API
scripts/
├── generate-api.js           API 生成（与 src/util/* 镜像）
├── generate-image-index.js   图片索引生成
├── compress-data.js          构建产物压缩
├── check_yaml.py             YAML 校验（CI 使用）
├── mf-list-schema.yaml       MF 列表 JSON Schema
└── mw-list-schema.yaml       MW 列表 JSON Schema
src/
├── assets/next/base.css      新版设计的全部令牌与样式（含深色主题）
├── boot/                     设计分支启动：entry / legacy / next / NxApp.vue
├── components/               页面组件（GameCard、ChangelogModal 等）
│   ├── icons/                图标：iconMap.js 名称表、Icon.vue（旧版）、fa.js（FA 配置）
│   └── next/                 新版外壳、筛选、列表、卡片、抽屉、文档条目（图标为 NxIcon）
├── data/                     站点自身静态数据（changelog.js 更新履历）
├── i18n/                     多语言核心：locale 注册表（index.js）、各语言文案（locales/*.js）、更新履历按需转换（convert.js）
├── markdown/                 各页面说明文档（.md 经 unplugin-vue-markdown 按 Vue 组件编译渲染）
├── pages/                    每个入口的旧版页面
│   └── next/                 每个入口的新版页面（只渲染内容，不包裹外壳）
├── util/                     ReadList / use*List / GameUtil 等
│   └── next/                 路由、外壳状态、记录模型、滚动锁等新版共享层
└── config.js                 站点配置（顶栏、导航、链接识别、页面标题）
DESIGN.md                     新版设计的布局、交互与交接说明（改 UI 前先读）
```

入口 HTML：`index.html`、`mf-games.html`、`mw-levels.html`、`assets.html`、`engines.html`、`mario-worker.html`、`softendo.html`；`about.html`（仅新版）。

## 6. 新版设计（next design）

站点同时提供两套界面：旧版（`legacy`，2.x 原样保留）与新版（`next`，目录工具风格的单页应用）。两套界面共用同一份 YAML 数据、同一份 Markdown 文案和同一套构建产物，只有启动路径、外壳与页面组件不同。布局、交互、设计原则与完整自查清单见 [DESIGN.md](DESIGN.md)；本节只列动手前必须知道的结构与约束。

### 6.1 设计选择与默认值

- 解析顺序：`?design=` URL 参数 → localStorage `design` 键 → `DEFAULT_DESIGN`（`src/util/Design.js`）。URL 参数会写回 localStorage，因此分享出去的链接保持复制时的设计。
- 别名：`new` / `modern` / `beta` → `next`；`old` / `classic` → `legacy`。
- 默认值：`3.0.0` 正式版发布前为旧版；`3.0.0` 稳定版及之后的版本（含 `3.0.1-beta.x`、`3.1.0-rc.x` 等预发布版）为新版。发版前验收新版需用 `?design=next` 或界面内开关。
- 切换会整页重载，以重新执行入口 `main.js`；不要改成组件内热切换（两套界面的全局副作用如 `dark-mode.css` 的裸标签样式无法干净交接）。
- 入口：旧版「全局设置」弹窗的「界面设计」行；新版顶栏设置抽屉的「切换到经典设计」。控件统一为 `src/components/DesignSwitch.vue`（`chip` / `menu` / `row` 三种形态）。

### 6.2 启动链

```
src/pages/<entry>/main.js
  → startPage({ legacy, pageId })      src/boot/entry.js
      → bootNext({ pageId })           src/boot/next.js（动态 import）
      → bootLegacy(LegacyPage)         src/boot/legacy.js（动态 import）
```

- 两个 boot 模块必须**动态 import**：`legacy.js` 引入 `dark-mode.css`，它会直接给 `body` / `a` / `table` 等裸标签写样式，静态引入会污染新版。
- `about.html` 只存在于新版，`src/pages/about/main.js` 直接调用 `bootNext({ pageId: "about" })`，不走 `startPage`；从关于页切回旧版会落到旧版首页（见 `Design.js` 的 `hasLegacyPage` / `otherDesignHref`）。

### 6.3 新版是单页应用

- 8 个入口 HTML（含 `about.html`）各自挂载同一个 `NxApp`（`src/boot/NxApp.vue`），它常驻渲染 `NxShell`（左导航 + 顶栏 + 抽屉），只有内容区 `.nx-page-body` 随路由切换。
- 路由在 `src/util/next/router.js`：`ROUTES` 把 pageId 映射到入口 URL 与懒加载组件；拦截同源且指向已知入口的 `<a>`，用 `history.pushState` 更新 URL；`popstate` 处理前进/后退；外链、`target`、`download`、修饰键点击与同文档锚点交给浏览器。
- 页面**不要自己渲染 `NxShell`**；在 `watchEffect` 中调用 `publishShell({ pageId, title, lan, doc, search, showAuthorSearch, showRandom })`（`src/util/next/shellStore.js`）发布外壳配置。未发布的字段会重置为默认值，避免上一页的搜索框或「目录说明」按钮残留。
- 页面切换由 `NxApp` 的 `:key="currentPageId"` 强制重建，页面内不要依赖跨页留存的状态。
- 新增入口需同时修改：`vite.config.js` 的 `build.rollupOptions.input`、`src/util/next/router.js` 的 `ROUTES`、`src/config.js` 的 `navTop`，并补 `src/pages/next/<page>/` 与 `src/pages/<page>/main.js`。

### 6.4 目录、详情与文档

- 四个目录页共用 `src/util/useCatalog.js`（标题 / 作者双搜索、多选筛选、三态标签、年份或日期区间、排序、分页、`activeId`）与 `NxCatalog.vue`（筛选栏 + 结果栏 + 列表/卡片 + 详情抽屉 + 分页）。旧版目录页用 `src/util/usePagination.js`，两者都通过 `src/util/PageParam.js` 把当前页码同步到 URL（`?page=`，第 1 页省略）。
- 记录模型在 `src/util/next/records.js`：平台、制作软件、`old-versions`、variant 拆分等规则必须与旧版 `src/pages/mf-games/MfGames.vue` 和 `scripts/generate-api.js` 保持一致；三处同步修改。
- 直达链接：`?id=<record id>`；版本级 `<record id>::<verKey>`；文档页「查看该作者的全部作品」用 `?author=`；分页页码用 `?page=<n>`（新旧版共用，第 1 页不写此参数）；旧版 `?game=` / `?asset=` 仍被识别。详情抽屉的分享按钮复制 `?design=next&id=...`，确保收件人打开新版目录并展开该记录。
- 文档页把 Markdown 中的 `<MfGamesEntry>` / `<AssetsEntry>` / `<SoftendoEntry>` 映射为 `NxEntry*`（`src/util/next/docComponents.js`），条目可原地展开详情；`DesignMfTable.vue` 按当前设计切换原版 MF 下载表格。
- 「最后更新」由 `src/util/next/docUpdated.js` 在运行时查询 GitHub commits API（请求失败则隐藏该行），不是构建期注入。

### 6.5 状态与共享层

- localStorage 键：`design`（设计）、`darkMode`（`1`/`0`）、`locale`（新版界面语言，如 `zh-Hans` / `zh-Hant` / `en`）、`language`（旧版语言 `zh` / `en`，由新版同步写入，见第 9 节）、`displayMode`（列表/卡片）、默认排序、`pageSize`（每页条数，`0` = 全部）。新旧版共用，切换设计后保持。
- `src/util/Theme.js` 设置 `html[data-nx-theme]`，并同步 `body.dark` 以兼容旧版；密度不再由用户切换，列表固定紧凑、卡片固定舒适（`initDensity` / `setViewDensity`）。
- `src/util/next/scrollLock.js`：遮罩打开时锁滚动。**不要**改成 `position: fixed` 或根元素 `overflow: hidden`，那会移走文档滚动容器，导致 sticky 的左栏与顶栏跳位。
- `src/util/backGuard.js`：两套设计共用，Android 返回键先关闭最上层浮层（栈式，支持详情弹框上叠图片预览）；`src/util/useBackGuard.js` 把 Vue 的弹框开关状态接上守卫，旧版各弹框都通过它注册。它与 router 的 `history.replaceState` 配合，撤哨兵时不要调用 `history.back()`，否则会与路由导航竞争。

### 6.6 新版专属常见坑

- 旧版文件只做最小改动；新版样式必须限定在 `.nx-*` 或 `[data-nx-theme]` 之下，禁止引入作用到裸标签的全局样式。
- 移动端顶栏与结果栏是 sticky 的；新增浮层要检查层级，`nx-to-top` 等固定按钮在抽屉展开时应隐藏。
- 手机顶栏标题在**任何非简体界面**（英文 / 波兰语 / 繁中）都取侧栏短标签（`option_zh_hant` / `option_alt` / `option`），简体与桌面端用完整 `title`；引擎页与 MW 资源页的繁体完整标题过长，必须走这条分支。
- 详情 / 筛选 / 文档抽屉各自负责 `pushBackGuard` + `lockScroll`，卸载时必须释放，否则页面会永久锁滚动或吞掉返回键。
- 任何 URL 写入都用 `replaceState` 并保留其他查询参数（尤其 `design`），否则分享链接、直达链接或设计选择会丢失。
- `general.css` 对页面全局 `text-align: center` 的规则同样可能影响新版；新面板需显式声明 `text-align: left`。

### 6.7 图标（Font Awesome）

- 全站图标来自 **Font Awesome Free**，以 SVG 按需引入（`@fortawesome/free-solid-svg-icons` / `free-brands-svg-icons` + `@fortawesome/vue-fontawesome`）。名称表统一在 `src/components/icons/iconMap.js`，两套界面共用。
- 旧版用 `<Icon name="download" class="icon" />`（`src/components/icons/Icon.vue`），尺寸与颜色由调用处的 `.icon` 等作用域样式控制；新版用 `<NxIcon name="download" :size="14" />`（`src/components/next/NxIcon.vue`），`size` 是显式像素值。**新增图标先登记名称再用**，不要再建单图标 `.vue`。
- `src/components/icons/fa.js` 关闭了 FA 的自动 CSS 注入，避免 `.svg-inline--fa` 的全局规则污染旧版。代价是 FA 自带的 `overflow: visible` 也不会生成，因此 `Icon.vue` / `NxIcon.vue` 必须保留该样式：多个 FA 路径超出 `viewBox`，默认 `overflow: hidden` 会裁边并让图标看起来没有居中。
- 平台标识使用品牌图标：`android` / `apple` / `linux` / `windows` / `java`。旧版卡片与列表的平台角标由 `GameUtil.js` 的 `getMfPlatform()` 按**当前展示的版本**判定（规则与目录页的 `detectPlatform` 一致，切换版本后图标随之变化）；新版详情抽屉通过 `NxDetail.vue` 的 `PLATFORM_ICONS` 映射。
- Font Awesome Free 图标为 CC BY 4.0：新版关于页技术栈与旧版页脚保留许可署名，不要删除。
- 构建时 `vite.config.js` 把 `@fortawesome` 单独拆成 `fontawesome` 可缓存 chunk；不要把图标重新并入页面 chunk。

### 6.8 验证要点

- 每处 UI 改动都要在 `?design=next` 与 `?design=legacy` 下各走一遍中英文；新版额外验证 `?lang=zh-Hant`（界面与导航标题为繁体、作品数据仍为简体、进入旧版落到简体）与 `?lang=pl`（界面为波兰语、数据与链接规则同英文、进入旧版落到英文），以及：软路由切换不刷新文档、前进/后退同步、抽屉与 Android 返回键、分享与直达链接、分页与「随机游戏」跳页、回到顶部按钮。
- 完整清单见 [DESIGN.md](DESIGN.md) 第 8 节。

## 7. 站点更新履历（changelog）

- 数据文件：`src/data/changelog.js`，按版本从新到旧记录**站点本身的改动**（不收录 data/list/yaml 数据更新）
- 每个条目含 `version`（tag 去掉 v 前缀）、`date`（tag 所在提交日期）与 `features` / `improvements` / `fixes` / `misc` 四类条目，另有对应的 `features_en` / `improvements_en` / `fixes_en` / `misc_en` 英文条目；英文缺失时前端回退显示中文
- 弹框组件为 `src/components/ChangelogModal.vue`，入口在页脚（`SiteFooter.vue`）；「当前版本 / Current」标记取自 `src/config.js` 的 `siteVersion`（派生自 package.json）
- 发布新版本时在 `changelog.js` 顶部**只追加**新条目，不改写既有条目（用户会持续手改中英文措辞，追加前先读文件最新内容）

## 8. 数据字段速查

完整字段表见 `README.zh-cn.md`「列表修改指南」；这里只强调**真实在用、但容易遗漏**的字段，以及 API 中的对应命名。

### MF（list-mf.yaml）

| YAML 字段 | API 字段 | 说明 |
| --- | --- | --- |
| `tag` | `tags` | 字符串列表，作品标签（如 `Single Level`、`Horror`） |
| `homepage_zh` / `homepage_en` | `homepage.zh` / `homepage.en` | 主页链接 |
| `repo` | `homepage.repo` | 源码仓库 |
| 版本级 `current` | 版本级 `current` | 显式标记当前版本，支持多 current |
| 版本级 `code_alt` | `download.codeAlt` | 备用提取码 |
| 版本级 `data_code` | `dataDownload.code` | 数据包提取码 |

> 失效链接用半角 `~` 前缀标记（如 `~https://...`）；前端与 API 都会去掉 `~` 并置 `invalid` 标志。

### MW（list-mw.yaml）

| YAML 字段 | API 字段 | 说明 |
| --- | --- | --- |
| `alias` | `aliases` | 别名 |
| `author_alias` | —（仅影响链接） | 资源站路径中使用的作者名 |
| `video` | — | 相关视频列表 |
| `homepage` | `homepage` | 主页链接 |
| `data_download_url` / `data_code` / `data_file_name` / `data_file_url` | `dataResource` | 数据包（如音乐）相关 |

> `file_name` 可以是**数组**（多文件 / 分卷）；`author` 为**数组**时视为合作作品，资源站归入「合作作品」目录。

### Assets / Softendo / Original-MF

字段较多，见 `README.zh-cn.md` 对应章节。要点：

- Assets 的 `variants` 用于多版本/多变体；`download_url`、`code`、`source_url` 可被变体继承
- Softendo 的 `portable` 可为字符串或 `{exe, swf, zip}` 对象，也支持数组
- Softendo 的 `language` 表示游戏语言（列表页可按语言 / 国旗标识筛选）
- Assets 的 `author_alt` / `variant_alt` / `description_alt` 提供英文界面下的英文显示
- 所有端点的 API 链接在生成时都**不做 URL 编码**（与 MF/MW 一致），含中文/空格的文件名原样拼接，由客户端处理

## 9. 多语言（i18n）

两套设计共用同一份 YAML 数据，但**只有新版做多语言**：旧版固定 `zh` / `en` 两种，不新增语言。

### 9.1 三个独立概念

| 概念 | 含义 | 取值来源 |
| --- | --- | --- |
| 界面语言（locale） | 按钮、表头、抽屉等 UI 文案 | `src/i18n/locales/*.js` 的 `messages` |
| 内容语言（`data`） | YAML 记录 / Markdown 说明 / 更新履历所用的书写语言 | 各 locale 的 `data` 字段（`zh` / `en`） |
| 旧版语言（`legacy`） | 进入旧版设计时使用的语言 | 各 locale 的 `legacy` 字段（`zh` / `en`） |
| 转换来源（`convert`，可选） | 唯一用途：更新履历的简→繁转换来源 | 仅 `zh-Hant` 声明 `"zh-Hans"` |

四者可以互不相同：繁体中文界面读简体数据（`data: "zh"`），但界面标签走 `zh-Hant` 文案表、导航 / 站点名用 `*_zh_hant` 字段、说明用 `*-zh-hant.md`，进入旧版时落回简体（`legacy: "zh"`）。波兰语则相反：`data: "en"`、`legacy: "en"`、无 `convert`，完全沿用英文数据与英文链接规则。

链接（发布页 / 网盘 / 下载地址）的 alt 取用规则收敛在 `prefersAltLinks(code)`：**中文（简体与繁体）都优先主链接**，**其它语言（英语、波兰语及后续新增语言）与英文一致，优先 `_alt` 备用链接**。新增语言时不要再写 `locale === "en"` 之类的判断，用这个函数。

### 9.2 新增一种语言

只需两步，**不用改任何组件**：

1. 复制 `src/i18n/locales/en.js` 为 `src/i18n/locales/<code>.js`，翻译 `messages`（键集合必须与 `en` 一致），并填写：`code`、`name`（语言菜单里的自称）、`short`、`htmlLang`、`legacy`、`data`、`fields`、`fallbacks`、`aliases`（可选 `convert`）。
2. 在 `src/i18n/index.js` 顶部的 `LOCALES` 数组中登记该文件（数组顺序即语言菜单顺序）。

现成范例：`pl.js`（波兰语）是「第三种语言」的完整样板——`data: "en"`、`legacy: "en"`、`fields: ["_pl", "_alt", "_en", "", "_zh"]`、`fallbacks: ["en"]`，即完全按英文规则读数据与链接。

`fields` 决定从记录里取哪个字段（按顺序回退），例如 `zh-Hant` 为 `["_zh_hant", "_zh", "", "_alt", "_en"]`；给 YAML 补上 `_<code>` 字段后自动优先生效。`fallbacks` 决定文案回退链（`zh-Hant` → `zh-Hans` → `en`；`pl` → `en`）。`legacy` 不写时默认 `en`，即「除繁体中文外，其余新语言进入旧版一律为英文」。

### 9.2.1 opencc 的两个用途

`src/i18n/convert.js` 的简→繁转换只服务两处**没有繁体原文、但又是站点目录核心内容**的文字：

1. `ChangelogDrawer.vue` 中的 `src/data/changelog.js` 条目（`features_en` 等英文条目不参与转换）；
2. **MF 作品**：`buildMfRecords()` 的 `name`（标题）、`author` / `authors`（作者名）、版本号显示文字（`label` / `displayLabel`）与 YAML `description`，以及 `NxDetail` 载入的作品级 `description_zh.md` 长文。文档页里的 `<MfGamesEntry>` 预览走同一个 `buildMfRecords()`，也一并转换。
3. **Assets 资源**：`buildAssetRecord()` 的作品名（`name`）、YAML `description`、作者名（`author` / `authors`）、`variantLabel`（变体名）与 `versionLabel` / `label` / `displayLabel`（版本号）；`AssetsCard` 与详情抽屉共用这些字段，所以两处同时生效。文档页里的 `<AssetsEntry>` 预览走同一个构建器。

- 转换器是 `opencc-js/cn2t` 的**动态 import**（约 1MB 原始 / 455KB gzip）。转换方向用 `Converter({ from: "cn", to: "twp" })`（OpenCC `s2twp`），除字形外还换用台湾常用词（软件→軟體、网络→網路、发布→釋出、文件→檔案）；见 [opencc-js README-zh-CN](https://github.com/nk2028/opencc-js/blob/main/README-zh-CN.md)。
- 加载时机按需：履历抽屉首次打开时、MF 目录页挂载/切换语言时、详情页载入 MF 长描述时、文档页解析 MF 条目时；`boot/next.js` 不预加载。`converter` 是 `shallowRef`，字典到位后自动刷新；加载失败时 `convertText()` 是恒等函数，页面照常显示原文。
- **其余繁体文案一律是"写出来的"，不是转出来的**：界面字符串在 `locales/zh-hant.js`；导航 / 页面标题用 `option_zh_hant` / `title_zh_hant`；站点名用 `desc_zh_hant`；站点说明文档用 `*-zh-hant.md`（按文件自动发现）。`localizedField()` / `labelFrom()` 只按字段链取值，不调用 opencc。
- **转换不能动身份字段**：`verKey`、`id`、`authorZh` 全部保留原文。版本选择、深链、作者文件夹 URL（`NxDetail.authorFolderHref` 用 `authorZh`）因此不受影响；只有 `label` / `displayLabel` / `author` 等显示字段被转换。
- **搜索兼容两种字形（仅 MF 目录）**：`records.js` 的 `searchValues()` 把 MF 记录的 `titleSearch` / `authorSearch` 原始值**保留**，并在繁中界面**追加** opencc 转换后的条目。因此繁中用户输入「超級馬里奧」「測試作者」能命中简体原文的作品，简体关键词也照常可用；其它语言 `localizeText()` 是恒等函数，数组不新增条目、也不加载字典。MW / Assets / Softendo 的搜索索引与页面都不涉及 opencc——它们的数据没有繁简差异，无需加载字典。
- **下载按钮文案走 i18n，不走 opencc**：Assets 的 File Hub 按钮把 `tr(lan, "download.filehub")` 作为名称覆盖传给 `getAssetResourceURLs()`，繁中得到 `社群資源網站`（简体 `社区资源站`、英文 `Community File Hub`），字典未加载时也正确。
- **不转的内容**：MW / Softendo 的显示用作品名、作者名与描述、更新履历以外的站点文档长文。
- **网盘按钮的完整标签不要复用 GameUtil 的 `desc`**：`getDownloadInfo()` 对任何中文内容语言都打印 `desc_zh`，繁中会拿到简体名。`records.js` 的 `netdiskLabel()` 用 `desc_zh_hant` 重建「服务名 + 状态标记」；短标签走 `netdiskServiceName()`。同理，组件里调用 `sourceServiceName()` 必须传**界面 locale**，不能传 `contentLang`（`"zh"` 会归一化成 `zh-Hans`，`desc_zh_hant` 永不生效）。
- 若将来某种中文变体的履历也缺繁体原文，照抄 `zh-Hant` 的 `convert` 声明即可；但若只是新增界面文本，请写进对应 locale 文件，不要用 opencc 顶替。

### 9.3 用法

- 组件：`const { t, te } = useI18n(() => props.locale)`，模板里 `t("catalog.colName")`；`te(key)` 判断某条可选文案是否存在。
- 只在简体中文出现的文案（如详情抽屉的「游玩说明」`detail.playNotes.*`）：`te()` 会顺着回退链在繁中命中简体文案，所以**不能只用 `te()`**。判定要与「界面读的是简体原文」绑定，见 `NxDetail.vue` 的 `hasPlayNotes`（`dataLangOf === "zh" && !localeNeedsConversion`），繁中与其它语言一律隐藏。
- 取数据字段：`localizedField(entry, "homepage", locale)`（自动按 `fields` 回退），或 `labelFrom({ zh, en }, locale)` 取小字典。
- 站点自产的中文标签：`localizeText(text, locale)`（`zh-Hant` 转繁体，其它语言原样返回）。
- Markdown 说明正文：按 locale 选择已经写好该文件（`*-zh-hant.md` 等），没有对应文件时回退到简体 / 英文；**不要**在渲染后遍历 DOM 做机器转换。
- 目录页的「目录说明」也按 locale 选文案：所有文档页统一用 `discoverDocs()` 自动发现 `<page>-<locale>.md`（`zh` → `zh-Hans`、`zh-hant` → `zh-Hant`），`pickDoc()` 在没有对应文件时回退到同书写语言的文档。现在首页、MF 作品、Softendo、关于页有四种语言，MW 关卡与创作资源只有简体，引擎页与 MW 资源页有英文 / 波兰文。
- 首页说明是逐语言的四份独立文件：`mf-zh.md` / `mf-zh-hant.md` / `mf-en.md` / `mf-pl.md`，由 `pickDoc()` 以 `locale.code` 精确选中；MW 资源页有 `mw-en.md` / `mw-pl.md` / `mw-zh-hant.md`，引擎页有 `engines-en.md` / `engines-pl.md` / `engines-zh-hant.md`，其它目录页仍只有 zh/en，按内容语言回退即可。`getMfDocLastUpdated()` / `getMwDocLastUpdated()` / `getEngineDocLastUpdated()` 按各自文档分别查询（键为 locale code，含 `zh-Hant`），页面把对应日期传给文档**实际声明**的 prop 名（首页繁中用 `lastUpdateZh`、首页波兰文用 `lastUpdateEn`；MW 与引擎的三份都用 `lastUpdate`）；某语言没有提交日期就隐藏该行，不借用其它语言的日期，也不要反过来改文档文件。
- 关于页的署名是**人工映射**，不是 opencc：`AboutNext.vue` 的 `ZH_HANT_NAMES` 按 `src/markdown/mf-games-zh-hant.md` 里的用户名写法（如「超級瑪莉迷01」「無視我233」「ChloePrime」）给出繁体显示名。新增贡献者时先在两份语言名单里都写好，再按需补映射。
- **「最后更新」统一由页面提供**：所有文档 md 只声明 `lastUpdate*` prop 并渲染 `.last-update` 行，不在 md 里发 GitHub API 请求。旧版 `Engines.vue` 与其它旧版文档页一样在页面内取 `engines-en.md` 的提交时间再传给 `<introEn :lastUpdate="…" />`（旧版没有波兰语，仍只用英文文档）。
- 链接 alt 规则：`prefersAltLinks(locale)`（中文 → 主链接优先，其它语言 → `_alt` 优先）。
- 页面：`pageLocale(pageId)` 给出该页面能呈现的 locale（单语言页面会自动落到对应语言的默认 locale），随后 `watchEffect` 里 `publishShell({ locale })` 发布给外壳；语言菜单的切换回调是 `publishShellHandlers({ changeLocale })`，页面在其中调用 `applyLocale(code)` 并重建记录。
- **语言菜单完全由页面实际拥有的文案决定**：每个文档页用 `src/util/next/docFiles.js` 的 `discoverDocs(import.meta.glob(".../<page>-*.md", { eager: true, import: "default" }), "<page>")` 得到 `{ localeCode: 组件 }`，把 `Object.keys(docs)` 作为 `locales` 发布到外壳；"关于页"没有 md，发布全部注册语言。`NxShell` 只在 `locales.length > 1` 时显示菜单——MW 关卡 / 创作资源只有 `assets.md` / `mw-levels-zh.md`（即只有简体），菜单隐藏；引擎页与 MW 资源页目前是 `en` / `pl`；首页、MF 作品、Softendo、关于页是四种语言。**新增 `<page>-<locale>.md` 即自动出现在页面与菜单里，无需改任何逻辑**；`localeForLocales()` 负责把访客的语言落到实际存在的文案上（精确匹配 → 同书写语言 → 基础语言回退）。
- 外壳的 `displayLocale` 以页面发布的 `locale` 为准（只有尚未发布时才回退到 `pageLocale()`）；因此页面切换语言后，繁体文案、导航显隐与文档选择不会互相打架。菜单可见时页面必须注册 `publishShellHandlers({ changeLocale })`，否则点击只会关闭菜单。
- 菜单选项按**规范语言代号**排序（`en` → `pl` → `zh-Hans` → `zh-Hant`），不按语言全称或浏览器 collation 排序；`NxShell` 的 `byLocaleCode` 负责这一点。
- 品牌图按**界面语言**而非内容语言选择：只有简体中文用中文 logo（左栏 `logo_new.png`、占位图 `logo_hd.png`），繁中与英文 / 波兰语统一用 `logo2_hd.png`（MW 记录仍用 `marioworker.png`）。旧版 HeaderNav 没有繁中，保持原样。
- 左栏版权说明（`app.legal`）同理由 `isSimplifiedUi` 判断：简体隐藏，繁中 / 英文 / 波兰语显示；繁中的状态页链接仍按内容语言显示（`contentLang === "zh"`），不要改成同一个判断。

### 9.4 旧版联动

- `setLocale()` 同时写 `locale` 与 `language`（旧版用的 `zh` / `en`），因此切换设计后语言一致。
- `otherDesignHref()` 会把 `?lang=` 改写为目标设计可用的语言：进入旧版时用各 locale 的 `legacy`（`zh-Hant` → `zh`，其他新语言 → `en`）；回到新版时写回完整 locale。
- 旧版页面继续只用 `getLanguage()` / `setLanguageZh()` / `setLanguageEn()`，不要在新版调用它们。
- URL 支持 `?lang=<code>`（别名如 `zh-TW` 亦可），首次访问按 `?lang=` → `locale` → `language` → 浏览器语言 → `en` 的顺序解析。

### 9.5 其它约定

- 本地化字段后缀：`_zh` / `_en`（描述）、`_alt`（英文名 / 译名 / 备用链接）；`_zh_hant` 等新字段按语言追加即可
- `config.js` 里的导航与站点名表也支持逐语言指定：`navTop` 用 `option_zh_hant` / `title_zh_hant`（简体 / 英文在前，繁中其次，`_pl` 最后）；新版简体侧栏另外优先取 `option_zh_new`（如「Mario Forever 作品目录」），旧版与其它语言仍用 `option` / `option_alt` 等字段，`sourceName` / `downloadName` 用 `desc_zh_hant`，`topBar` 的侧栏名用 `name_zh_hant_new`。所有新版专用名字的命名格式是 `<base>_<locale>_new`（`NxShell.newField()` 按 locale → 内容语言 → en → 裸 `<base>_new` 查找），`show_new` 是显隐开关、不参与此命名规则。未提供的条目按 `fields` 链回退到简体 / 英文原文（不转换），新增语言时可以只翻译高频条目，之后再逐条补齐
- **固定取值集合要逐语言写明**：如 Softendo 游戏语言 `SoftendoUtil.js` 的 `LANGUAGE_LABELS`（`en` → Angielski，`pl` → Polski）。`labelFrom()` 的顺序是 `locale.code → data → en`，缺 `pl` 键就会回退英文，出现「Język: English」这种标签和值不同语言的情况。登记新语言时务必检查这类小字典
- 侧栏 / 站外链接的显隐由 `show_zh`、`show_en`、`show_new`、`show_zh_hant` 四个开关决定，规则集中在 `src/util/next/entryVisibility.js` 的 `isEntryVisible()`（`NxShell` 的目录与站外链接共用同一函数）。**繁体界面的 `navTop` 按英文 / 波兰语的可见性判断**（`navContentLang = "en"`：显示引擎页与 MW 编辑器页，隐藏仅中文的 MW 关卡 / 创作资源目录），站外链接仍按内容语言与 `show_zh_hant` 判断，两者互不影响。`show_zh_hant: false` 只在新版繁体界面隐藏（仅面向大陆受众的账号入口），旧版 `HeaderNav` 不认这个字段
- 英文与其它非中文语言优先显示 `_alt` 字段，原始语言名可通过过滤检索
- 个别页面仅面向单一语言（如引擎页仅英文、MW 作品目录与创作资源目录仅中文），由 `config.js` 的 `show_zh` / `show_en` 控制
- 所有功能必须在新版所有已注册语言下都可用（最少验证 `zh-Hans` / `zh-Hant` / `en`）

## 10. 常见任务流程

### 新增 / 修改一个 MF 作品

1. 编辑 `public/data/list-mf.yaml`：单版本字段写在作品级；多版本写在 `ver` 列表内
2. （可选）在 `public/data/mf-games/<作品名>/` 放置 `title.webp` / `logo.*` / `showcase_*` 与 `description*.md`
3. 运行 `bun run generate-images && bun run generate-api`
4. `bun run dev` 本地验证中英文页面与下载链接

### 修改下载链接 / 路径规则

1. 在 `scripts/generate-api.js` 中找到对应的 `*Base*` / `*FileUrl` 逻辑
2. **同步修改** `src/util/GameUtil.js` / `SoftendoUtil.js` / `AssetUtil.js` 或 `src/components/OriginalMfTable.vue`
3. `bun run generate-api` 后核对 `public/api/*.json` 中的链接

### 新增 / 修改图标

1. 在 `src/components/icons/iconMap.js` 的 `ICONS` 中登记短名称 → FA 图标定义（按需 import）
2. 旧版用 `<Icon name="…" />`，新版用 `<NxIcon name="…" :size="…" />`；补上对应 CSS 尺寸，不要依赖 FA 自动样式
3. 重命名或删除名称前，先全局搜索两套界面的调用处；平台图标还需同步 `NxDetail.vue` 的 `PLATFORM_ICONS`

### 修改 API 结构

- 只改 `scripts/generate-api.js`，改完重新生成；**不要手改 `public/api/`**
- 字段命名与前端保持一致（camelCase），避免破坏现有消费者

### 发布新版本

1. 在 `src/data/changelog.js` 顶部追加新版本条目（中英文），只收录站点改动；提交前先读文件最新内容，用户会持续手改条目措辞
2. 运行 `bun run lint`
3. 提交后由用户运行 `bun pm version patch` 升级版本号并打 `v*` tag（**不要手动改 package.json**，该命令会自动创建版本提交与 tag）
4. 部署后核对页脚「网站版本」与履历弹框「当前版本」标记；本地 dev 改动 package.json 后需重启 dev server 才能读到新版本号

## 11. 常见坑

- YAML 键名**不要重复**（后者会覆盖前者）
- 所有日期用 `YYYY-MM-DD`（YAML 解析需 `YAML11_SCHEMA` 才会得到 Date）
- 所有端点的资源站链接都**不做 URL 编码**（含中文/空格，由客户端处理）；修改链接规则时需同时改 `src/util/*` 与 `scripts/generate-api.js`
- `file_name` 以 `.apk` 结尾视为安卓包（路径不同）；带 `repacker` 的版本归入重打包目录
- 国际作品旧版本会加 `old-versions/` 前缀（`useMfList.js` 与 API 脚本各自实现，规则必须一致）
- `manualChunks` 用函数形式（Rolldown）
- `scripts/` 使用 Node.js 全局，`src/` 使用浏览器全局
- `general.css` 对页面全局 `text-align: center`，新的弹框 / 面板需显式声明 `text-align: left`
- 页脚与弹框相关：入口要用真 `<a>` 而不是 button 样式模拟；`dark-mode.css` 会给 `footer` 内任意 `span:not(:first-child)` 加竖线，因此弹框要渲染在 `<footer>` 之外
- 本地 dev 修改 package.json 版本号后需重启 dev server（Vite 对 JSON 导入有模块缓存），生产构建不受影响
- 不要给图标组件添加 `width` / `height` 属性来定尺寸：旧版尺寸来自 `.icon` 等 CSS；新版来自 `NxIcon` 的 `size`。同时不要移除图标的 `overflow: visible`，否则超出 `viewBox` 的 FA 路径会被裁掉

## 12. 代码风格

- 缩进 2 空格；优先 `const`；字符串用双引号；箭头函数
- 导入顺序：Vue → 第三方库 → 本地工具（`@/` 或相对路径）→ 组件
- 本地 JS 导入必须带 `.js` 扩展名；`@/` 指向 `src/`
- 组件：PascalCase；函数/变量：camelCase；CSS 类：kebab-case
- Props 用 `defineProps()` 置于 script 顶部，`defineEmits()` 声明事件
- 错误处理用 `try/catch`，返回空值前做 null 检查
- 完整 ESLint 规则见 `eslint.config.js`（`bun run lint` 自动修复）
- **文档与注释的段落不要手工换行**（避免截断换行），由编辑器软换行，保持源码整洁与 diff 清晰
- 图标只用 `Icon` / `NxIcon` + `iconMap.js`；不要在模板里写 emoji、内联 `<svg>` 或引入其他图标库

## 13. 提交与校验

- 提交前运行 `bun run lint`
- YAML 改动会被 CI（`scripts/check_yaml.py` + schema）校验，本地可用 `python scripts/check_yaml.py` 自检
- commit message 使用英文（约定式格式，如 `feat(ui): ...`、`chore(data): ...`）
- 除数据和文档更新外，其余站点改动提交到 `next` 分支（`main` 为线上稳定分支）
- 版本号升级与 tag 由 `bun pm version patch` 完成（见第 7、10 节），不要手动改 package.json
- 本项目无测试框架，改动后需手动验证中英文各入口与响应式
