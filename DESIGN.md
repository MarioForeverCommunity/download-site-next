# 新版设计（next design）

本站同时提供一套全新的界面设计，并**完整保留旧版设计**。浏览者可以随时在两者之间切换；两套界面共用同一份数据、同一份文案与同一套构建产物。

## 1. 如何切换

| 位置 | 入口 | 说明 |
| --- | --- | --- |
| 旧版界面 | 「全局设置」弹窗 →「界面设计」→ 切换到新版设计 | 与默认排序、直链开关同级 |
| 新版界面 | 顶栏设置抽屉（四点图标）→「切换到旧版设计」 | 与默认排序、每页条数、直链开关同级 |

URL 参数可直接指定，写入浏览器本地存储（`design` 键）后不再需要携带：

```
/mf-games.html?design=next     # 新版
/mf-games.html?design=legacy   # 旧版
```

别名：`new` / `modern` / `beta` → 新版，`old` / `classic` → 旧版。切换为整页重载，保证两套界面的全局副作用（OverlayScrollbars 等）互不残留。

由于选择会持久化，**任何写入 URL 的代码都必须保留 `design` 参数**（通常用 `history.replaceState`），否则分享链接或直达链接会把访客甩回默认设计。

`about.html` 只存在于新版；从关于页切回旧版时会落到旧版首页（`src/util/Design.js` 的 `hasLegacyPage` / `otherDesignHref`）。

## 2. 默认设计

`src/util/Design.js` 的 `DEFAULT_DESIGN` 决定未指定时的默认界面。新版设计在 3.0.0 正式版发布前**不作为默认设计**：`package.json` 版本号为 `3.0.0` 的预发布版本（如 `3.0.0-beta.0`、`3.0.0-rc.1`）默认沿用旧版，正式发布 `3.0.0` 后自动切为新版。3.0.0 之后的版本（如 `3.0.1-beta.1`、`3.1.0-rc.0`）已视为新版正式发布，其预发布版本同样默认使用新版。期间仍可通过 `?design=next` 或界面内开关进入新版。

默认值由版本号推导，发版时**不需要改代码**；但每次发版前必须用 `?design=next` 完整验收新版。

## 3. 界面结构

```
┌──────────┬────────────────────────────────────────────────────┐
│ 左导航    │ 顶栏：页面标题 | 标题搜索 | 作者搜索  说明 语言 深色 设置 │
│ (244px)  ├────────────────────────────────────────────────────┤
│ 目录      │ ┌────────────┬──────────────────────────────────┐ │
│ 站外      │ │ 筛选面板    │ 结果栏：计数 排序 药丸 骰子 视图   │ │
│          │ │ (浅灰,      │ ┌──────────────────────────────┐ │ │
│ 更新履历  │ │  常驻展开)  │ │ 记录行 / 卡片（每页 pageSize） │ │ │
│ 源码      │ │            │ └──────────────────────────────┘ │ │
│ 状态      │ │            │ 分页                              │ │
│ 版本号    │ └────────────┴──────────────────────────────────┘ │
└──────────┴────────────────────────────────────────────────────┘
   右侧滑出：详情抽屉 / 更新履历抽屉 / 文档侧板
   右下角：回到顶部
```

- **底色区分**：左导航 `#f5f4f1`、筛选面板 `#faf9f7`、主区域纯白。
- **顶栏**：页面标题 + 双搜索 + 动作区，整条 sticky。动作区顺序为说明（页面有文档时）→ 语言 → 深色模式 → 全局设置（四点图标）。折叠菜单按钮仅在移动端出现。
- **左栏**：目录、站外链接，以及页脚（更新履历、源码、状态、版本号、构建时间与提交）。桌面端 244px，861–1024px 收为 208px；移动端收缩为菜单按钮展开的抽屉，点击栏外自动收回。
- **双搜索**：第一个匹配标题 / 别名 / 文件名，第二个只匹配作者，互不干扰。Softendo 目录没有真实作者，隐藏第二个搜索框（`showAuthorSearch: false`）。
- **筛选常驻**：地区、平台 / 制作软件、MW 版本等均为**多选**（同一组内为「或」关系）；MW 版本以胶囊形式呈现。
- **标签三态**：OR（绿，含任一）→ AND（蓝，`+`，含全部）→ NOT（红，`−`，排除）；颜色与符号双重编码，灰阶下仍可辨。
- **发布时间筛选**：「年份」多选与「日期区间」二选一；日期区间可精确到日（含起止），并提供今年 / 去年 / 近 30 天快捷项。Softendo 页不显示该筛选（其条目只有年份区间，无发布日期）。
- **密度**：列表固定为紧凑、卡片固定为舒适，不再提供手动切换——密度由当前视图决定（`Theme.js` 的 `setViewDensity`）。
- **分页**：结果下方显示分页；每页条数在全局设置中选择 25 / 50 / 100 / 200 或全部显示（localStorage `pageSize`，新旧版共用，列表与卡片共用）。筛选、搜索或排序变化回到第一页；通过分享链接或「随机游戏」打开的记录会自动翻到其所在页。
- **详情抽屉**：可逐条对比、含标题图 + showcase 轮播（单张全宽、分页在轨道下方、多图每 3 秒自动播放）、版本切换（`current` 缺失时按日期最新标注「最新」）、提取码一键复制、右上角分享按钮（复制目录内直达链接）、`?id=` 直达链接。
- **文档页**：容器不限宽（仅正文行宽控制在约 78 字符，尾注不受限），嵌入的作品条目支持**原地展开详情**，卡片在同一容器内按 1/2/3 列并排，轮播与 title 截图完整保留。文档页不显示搜索框与「目录说明」按钮。
- **列表列**：作品（约 400px，含 variant 名）→ 作者 → 版本 → 日期 → 分类（全部标签换行显示）→ 动作（下载 / 发布页 / 源码 / Wiki / 主页，固定最右）。
- **创作资源**：默认每个 variant 单独成行，不提供合并选项；同名变体各自成记录，可分别打开。
- **强调色**：沿用旧版品牌蓝 `#008cff`；实心按钮使用同色系深一档（`#0068c4`）以保证白字达到 WCAG AA；深色主题提亮为 `#4da3ff`。
- **移动端吸顶**：顶栏与结果栏在页面滚动时保持可见，结果栏紧贴顶栏下方、互不重叠。
- **回到顶部**：右下角按钮，滚动超过 300px 后出现；抽屉或遮罩打开时隐藏，避免遮挡。
- **浏览器标题**：统一为「页面名称 | 站点名称」，中文后缀「Mario Forever 作品目录站」，英文后缀「Mario Forever Download Portal」（`src/config.js` 的 `setPageTitle`）。

## 4. 代码结构

```
src/util/Design.js               设计选择状态（URL → localStorage → 默认）
src/util/Theme.js                明暗主题与密度（localStorage，同步 body.dark）
src/util/useCatalog.js           目录状态：双搜索 / 筛选 / 三态标签 / 日期区间 / 排序 / 分页
src/util/usePagination.js        旧版目录的分页（与新版共用 pageSize）
src/boot/entry.js                按设计分发到 bootLegacy / bootNext（两者动态加载）
src/boot/legacy.js               旧版启动：OverlayScrollbars + dark-mode.css
src/boot/next.js                 新版启动：base.css、主题、文档组件、路由
src/boot/NxApp.vue               SPA 根组件：常驻外壳 + 内容区过渡
src/util/next/router.js          前端软路由（pushState / popstate / 链接拦截）
src/util/next/shellStore.js      页面 → 外壳的配置发布（标题 / 说明 / 搜索模型）
src/util/next/records.js         统一记录模型（与旧版页面、API 脚本规则一致）
src/util/next/useNamedRecord.js  文档页按名称解析单条记录
src/util/next/docComponents.js   Markdown 条目组件 → 新版预览组件的映射
src/util/next/docUpdated.js      运行时查询 GitHub commits API 的「最后更新」
src/util/next/scrollLock.js      共享滚动锁（保留文档滚动容器）
src/util/next/backGuard.js       Android 返回键先关闭抽屉（history 哨兵）

src/assets/next/base.css         新版全部令牌与样式（含深色主题、轮播修复）
src/components/DesignSwitch.vue  切换控件（chip / menu / row 三种形态）
src/components/DesignMfTable.vue 按设计切换原版 MF 下载表格
src/components/GlobalSettings.vue 旧版全局设置（新增界面设计行）

src/components/next/             外壳 NxShell、筛选 NxFilterPane、结果 NxCatalog、
                                 列表 NxRow、卡片 NxCard、详情 NxDetail、图库 NxGallery、
                                 设置 NxSettings、更新履历 ChangelogDrawer、
                                 目录说明 NxDocDrawer / NxDocPanels、文档条目 NxEntry*、
                                 原版表格 NxMfTable、占位图 NxLogoPlaceholder、图标 NxIcon
src/pages/next/<page>/           8 个页面的新版实现（只渲染内容，不再包裹外壳）
```

### 新版是单页应用

8 个入口 HTML（`index`、`mf-games`、`mw-levels`、`assets`、`engines`、`mario-worker`、`softendo`、`about`）各自挂载同一个 `NxApp`，它常驻渲染 `NxShell`（导航栏 + 顶栏 + 抽屉），只有顶栏以下的内容区随路由切换：

- **路由**：`router.js` 拦截站内指向已知入口的 `<a>`，用 `history.pushState` 更新 URL 并切换页面组件；`popstate` 处理前进/后退。外链、`target`、`download`、修饰键点击和同文档锚点一律交给浏览器。
- **页面 → 外壳**：页面不再渲染 `NxShell`，而是在 `watchEffect` 里调用 `publishShell()` 发布 `pageId / title / lan / doc / search / showAuthorSearch / showRandom`。发布时会先重置为默认值，因此文档页不会残留上一页的搜索框或「目录说明」按钮。
- **过渡**：只有内容区（`.nx-page-body`）做 160ms 交叉淡入，导航栏与顶栏全程不动；`:key="currentPageId"` 保证每个页面都是新实例。
- **滚动锁**：任何抽屉展开时阻止滚轮、触摸与键盘滚动，并补偿滚动条宽度；**不**固定 body、**不**给根元素加 `overflow: hidden`，否则 sticky 的左栏与顶栏会跳位。
- **返回键**：抽屉打开时向 history 压入一个哨兵条目，Android 返回键先被它吸收并关闭抽屉；从 UI 关闭时必须撤掉哨兵，且不能用 `history.back()` 与路由导航竞争（详见 `backGuard.js` 的 `abandonBackGuard`）。

### 关键约束

- **旧版文件只做最小改动**：全局设置新增一行、页脚/changelog 原样保留；旧版不加载路由，仍是每页真实跳转。
- **两套 CSS 隔离**：`dark-mode.css` 仅在 legacy 启动路径动态加载；新版样式全部限定在 `.nx-*` 或 `[data-nx-theme]` 之下。
- **Markdown 是文案唯一来源**：`mf-zh.md` / `mf-en.md` 仅把版本表换成设计感知的 `DesignMfTable`，条目组件由 `docComponents.js` 映射到新版预览。
- **字体只用 Inter**（旧版已随 `assets/fonts.css` 加载），不再引入任何新字体；小号数字用 tabular-nums 而非等宽字体。
- **hover 不加下划线**：界面内链接靠颜色与背景区分，正文链接同样默认无下划线，仅 hover 时出现。
- **记录模型是共享层**：`records.js` 的平台 / 制作软件 / old-versions / variant 规则须与 `MfGames.vue`、`scripts/generate-api.js` 保持一致。
- **构建期常量**：`BUILD_TIME` / `COMMIT_HASH` 由 `vite.config.js` 注入，用于左栏页脚与源码链接。
- **「最后更新」在运行时查询**：`docUpdated.js` 向 GitHub commits API 取每个数据 / 文档文件的最后提交日期，请求失败则隐藏该行，与旧版行为一致；数据文件单独部署、不重新构建时也能反映最新提交。

## 5. 兼容性与直达链接

- `?id=<record id>` 为新版直达链接；`?id=<record id>::<verKey>` 会额外选中该版本。
- 旧版 `?game=` / `?asset=` slug 仍被识别，任一界面复制的链接在另一界面也能打开。
- `?author=<name>` 供文档页「查看该作者的全部作品」跳转到目录时预填作者搜索。
- 详情抽屉的分享按钮复制 `?design=next&id=...`：收件人即使原本停留在旧版，也会打开新版目录并展开该记录。
- 下载链接规则、直链开关、文件大小查询全部沿用 `src/util/*`，两套界面共用，未做分叉。
- 分页在两个设计中共用 `pageSize` 设置；新旧版切换后页码与条数行为一致。

## 6. 设计原则

- 强调色只有一个：品牌蓝 `#008cff`（实心按钮 `#0068c4`，深色主题 `#4da3ff`），用于主操作、当前导航与选中行；彩色只承载数据含义。
- 一个字族（Inter）承担全部层次；标题用紧凑字距，数据列用等宽数字。
- 动效克制：只有抽屉、弹层与页面内容区有过渡，导航栏与顶栏从不参与动画，并尊重 `prefers-reduced-motion`。
- 对比度：正文、次要文字、按钮在明暗两套主题下均达到 WCAG AA（≥4.5:1）。

## 7. 交接要点

- **默认仍是旧版**：`3.0.0` 稳定版发布前，默认设计是旧版，`3.0.0` 正式发布后自动切到新版；不要为了验收手动改 `DEFAULT_DESIGN`，用 `?design=next` 即可。
- **任何共享改动都要双向验证**：数据加载、下载链接、直链开关、语言、排序、分页等都在 `src/util/*`，改动后必须同时检查 `?design=legacy` 与 `?design=next`。
- **记录模型三处同步**：`src/util/next/records.js`、`src/pages/mf-games/MfGames.vue`、`scripts/generate-api.js`。新增字段或改判定规则时不要只改一处。
- **新增页面**：`vite.config.js` 的 `input` → `src/util/next/router.js` 的 `ROUTES` → `src/config.js` 的 `navTop` → `src/pages/next/<page>/` 与 `src/pages/<page>/main.js`；新版页面只渲染内容并 `publishShell`。
- **URL 与 history**：写 URL 一律 `replaceState` 且保留其他参数；抽屉的哨兵条目与路由导航必须按 `backGuard.js` 的约定配合，不要额外 `history.back()`。
- **已知取舍**：密度不可手动切换；年份与日期区间互斥；Softendo 无作者搜索与日期筛选；创作资源 variant 不合并；关于页仅新版。
- **文档同步**：修改布局、交互或新增共享文件后，更新本文件与 `AGENTS.md` 第 6 节；发布新版本时按 `AGENTS.md` 的约定追加 `src/data/changelog.js`。

## 8. 自查清单

1. `bun run lint`；`bun run build` 后 `bun run preview` 逐页检查 `?design=next` 与 `?design=legacy`
2. 中英文切换后列表、抽屉、文档条目字段跟随变化
3. 360 / 768 / 1440 / 1920px 无横向滚动
4. 深色模式下标签、下拉、抽屉、文档表格与分页按钮对比度
5. 年份 / 日期区间二选一的行为与快捷项
6. 新版：点击导航栏切换页面不刷新文档，URL 与前进/后退同步；内容区有过渡而导航栏、顶栏不动
7. 新版：进入文档页后搜索框与「目录说明」按钮消失，返回目录页后恢复
8. 移动端：左侧导航与右侧筛选均为抽屉，展开时页面锁定滚动、遮罩拦截点击，关闭后恢复原滚动位置；Android 返回键先关闭抽屉
9. 目录页「最后更新」在结果栏中可见且左对齐；结果栏横跨筛选栏上方
10. Softendo 的「系列」列可排序；卡片视图显示 variant / 版本 / SMWP 版本
11. 分页：25 / 50 / 100 / 200 / 全部显示逐项切换，列表与卡片一致，新旧版共用设置；筛选变化回到第一页
12. 分享 / 直达链接：从详情抽屉复制链接，新标签页打开后展开同一条记录；版本行复制的链接选中对应版本
13. 回到顶部：滚动后出现，抽屉或遮罩打开时隐藏
14. 浏览器标题为「页面名称 | 站点名称」，中英文后缀正确

## 9. 版本与提交

- 除数据与文档更新外，站点改动提交到 `next` 分支（`main` 为线上稳定分支）。
- 站点改动需要追加 `src/data/changelog.js`（只追加、不复写既有条目），并在提交前运行 `bun run lint`。
- 版本号与 tag 由 `bun pm version` 完成，不要手动改 `package.json`。
