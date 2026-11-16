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
│   └── next/                 新版外壳、筛选、列表、卡片、抽屉、文档条目
├── data/                     站点自身静态数据（changelog.js 更新履历）
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
- 切换会整页重载，以重新执行入口 `main.js`；不要改成组件内热切换（两套界面的全局副作用如 OverlayScrollbars 无法干净交接）。
- 入口：旧版「全局设置」弹窗的「界面设计」行；新版顶栏设置抽屉的「切换到旧版设计」。控件统一为 `src/components/DesignSwitch.vue`（`chip` / `menu` / `row` 三种形态）。

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

- 四个目录页共用 `src/util/useCatalog.js`（标题 / 作者双搜索、多选筛选、三态标签、年份或日期区间、排序、分页、`activeId`）与 `NxCatalog.vue`（筛选栏 + 结果栏 + 列表/卡片 + 详情抽屉 + 分页）。
- 记录模型在 `src/util/next/records.js`：平台、制作软件、`old-versions`、variant 拆分等规则必须与旧版 `src/pages/mf-games/MfGames.vue` 和 `scripts/generate-api.js` 保持一致；三处同步修改。
- 直达链接：`?id=<record id>`；版本级 `<record id>::<verKey>`；文档页「查看该作者的全部作品」用 `?author=`；旧版 `?game=` / `?asset=` 仍被识别。详情抽屉的分享按钮复制 `?design=next&id=...`，确保收件人打开新版目录并展开该记录。
- 文档页把 Markdown 中的 `<MfGamesEntry>` / `<AssetsEntry>` / `<SoftendoEntry>` 映射为 `NxEntry*`（`src/util/next/docComponents.js`），条目可原地展开详情；`DesignMfTable.vue` 按当前设计切换原版 MF 下载表格。
- 「最后更新」由 `src/util/next/docUpdated.js` 在运行时查询 GitHub commits API（请求失败则隐藏该行），不是构建期注入。

### 6.5 状态与共享层

- localStorage 键：`design`（设计）、`darkMode`（`1`/`0`）、语言、`displayMode`（列表/卡片）、默认排序、`pageSize`（每页条数，`0` = 全部）。新旧版共用，切换设计后保持。
- `src/util/Theme.js` 设置 `html[data-nx-theme]`，并同步 `body.dark` 以兼容旧版；密度不再由用户切换，列表固定紧凑、卡片固定舒适（`initDensity` / `setViewDensity`）。
- `src/util/next/scrollLock.js`：遮罩打开时锁滚动。**不要**改成 `position: fixed` 或根元素 `overflow: hidden`，那会移走文档滚动容器，导致 sticky 的左栏与顶栏跳位。
- `src/util/next/backGuard.js`：Android 返回键先关闭抽屉。它与 router 的 `history.replaceState` 配合，撤哨兵时不要调用 `history.back()`，否则会与路由导航竞争。

### 6.6 新版专属常见坑

- 旧版文件只做最小改动；新版样式必须限定在 `.nx-*` 或 `[data-nx-theme]` 之下，禁止引入作用到裸标签的全局样式。
- 移动端顶栏与结果栏是 sticky 的；新增浮层要检查层级，`nx-to-top` 等固定按钮在抽屉展开时应隐藏。
- 详情 / 筛选 / 文档抽屉各自负责 `pushBackGuard` + `lockScroll`，卸载时必须释放，否则页面会永久锁滚动或吞掉返回键。
- 任何 URL 写入都用 `replaceState` 并保留其他查询参数（尤其 `design`），否则分享链接、直达链接或设计选择会丢失。
- `general.css` 对页面全局 `text-align: center` 的规则同样可能影响新版；新面板需显式声明 `text-align: left`。

### 6.7 验证要点

- 每处 UI 改动都要在 `?design=next` 与 `?design=legacy` 下各走一遍中英文；新版额外验证：软路由切换不刷新文档、前进/后退同步、抽屉与 Android 返回键、分享与直达链接、分页与「随机游戏」跳页、回到顶部按钮。
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

## 9. 语言与多语言约定

- 语言状态变量 `lan`（`"zh"` / `"en"`），用 localStorage 持久化（与主题、设计模式一致）
- 本地化字段后缀：`_zh` / `_en`（描述）、`_alt`（英文名 / 译名 / 备用链接）
- 英文页面优先显示 `_alt` 字段，原始语言名可通过过滤检索
- 个别页面仅面向单一语言（如引擎页仅英文、MW 作品目录与创作资源目录仅中文），由 `config.js` 的 `show_zh` / `show_en` 控制
- 所有功能必须在中英文下都可用

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

## 12. 代码风格

- 缩进 2 空格；优先 `const`；字符串用双引号；箭头函数
- 导入顺序：Vue → 第三方库 → 本地工具（`@/` 或相对路径）→ 组件
- 本地 JS 导入必须带 `.js` 扩展名；`@/` 指向 `src/`
- 组件：PascalCase；函数/变量：camelCase；CSS 类：kebab-case
- Props 用 `defineProps()` 置于 script 顶部，`defineEmits()` 声明事件
- 错误处理用 `try/catch`，返回空值前做 null 检查
- 完整 ESLint 规则见 `eslint.config.js`（`bun run lint` 自动修复）
- **文档与注释的段落不要手工换行**（避免截断换行），由编辑器软换行，保持源码整洁与 diff 清晰

## 13. 提交与校验

- 提交前运行 `bun run lint`
- YAML 改动会被 CI（`scripts/check_yaml.py` + schema）校验，本地可用 `python scripts/check_yaml.py` 自检
- commit message 使用英文（约定式格式，如 `feat(ui): ...`、`chore(data): ...`）
- 除数据和文档更新外，其余站点改动提交到 `next` 分支（`main` 为线上稳定分支）
- 版本号升级与 tag 由 `bun pm version patch` 完成（见第 7、10 节），不要手动改 package.json
- 本项目无测试框架，改动后需手动验证中英文各入口与响应式
