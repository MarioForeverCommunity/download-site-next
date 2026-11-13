# 新版设计（wip-new-design）

本分支为站点引入了一套全新的界面设计，同时**完整保留旧版设计**。浏览者可以随时在两者之间切换；两套界面共用同一份数据、同一份文案与同一套构建产物。

## 1. 如何切换

| 位置 | 控件 | 说明 |
| --- | --- | --- |
| 旧版界面 | 右下角浮动的「新版界面」按钮 | 位于原有三个圆形按钮（返回顶部、深浅色、设置）上方，不遮挡它们 |
| 新版界面 | 顶栏右侧的「旧版设计」链接 | 与语言切换、站外链接并列 |

另外，任何页面都可以用 URL 参数直接指定：

```
/mf-games.html?design=next     # 新版
/mf-games.html?design=legacy   # 旧版
```

参数会写入 `design` cookie，之后访问不再需要带参数。可选别名：`new` / `modern` / `beta` → 新版，`old` / `classic` → 旧版。

切换是**整页重载**：两套界面是各自独立的 Vue 根组件，重载是唯一可靠的交接方式，也能保证旧版的 OverlayScrollbars 等全局副作用被彻底清理。

## 2. 默认设计

`src/util/Design.js` 中的 `DEFAULT_DESIGN` 决定未指定时的默认界面。当前为 `NEXT_DESIGN`；改回 `LEGACY_DESIGN` 即可让旧版重新成为默认，而新版仍可通过 `?design=next` 访问。

## 3. 代码结构

```
src/util/Design.js              设计选择状态（URL → cookie → 默认）
src/util/Theme.js               新版明暗主题与密度（localStorage 持久化）
src/boot/entry.js               按当前设计挂载对应页面
src/boot/legacy.js              旧版启动：原样保留的字体 / dark-mode.css / OverlayScrollbars
src/boot/next.js                新版启动：IBM Plex 字体 + 新令牌 + 全局组件注册

src/assets/next/base.css        新版全部设计令牌与基础样式（含深色主题）
src/assets/next/fonts.css       IBM Plex 字体引入

src/components/DesignSwitch.vue 切换控件（chip / link 两种形态）
src/components/DesignMfTable.vue 按当前设计渲染原版 MF 版本表

src/pages/next/<page>/          7 个页面的新版实现
src/components/next/            新版共用组件（外壳、工具栏、列表行、卡片、抽屉…）
src/util/next/records.js        统一记录模型：YAML → 四个目录共用的数据结构
src/util/useCatalog.js          目录交互状态：搜索 / 筛选 / 标签 / 排序 / 视图
src/util/next/useNamedRecord.js 文档页按名称解析单条记录
```

### 关键约束

- **旧版文件不做结构性修改**。旧版页面只在模板末尾新增 `<DesignSwitch>` 与对应的 import；`OriginalMfTable` 等旧组件原样保留。
- **两套 CSS 必须隔离**。`bootLegacy` 通过动态 import 加载，`dark-mode.css`（作用于裸 `body` / `a` / `table`）不会进入新版的模块图；新版所有样式都限定在 `.nx-*` 类名或 `[data-nx-theme]` 之下。
- **Markdown 是文案的唯一来源**。新版文档页复用 `src/markdown/*.md`，只通过 `docComponents.js` 把 `<MfGamesEntry>` / `<AssetsEntry>` / `<SoftendoEntry>` 映射到新版预览组件。`mf-zh.md` / `mf-en.md` 仅把 `OriginalMfTable` 的 import 换成设计感知的 `DesignMfTable`。
- **记录模型是共享层**。`src/util/next/records.js` 中的平台 / 制作软件 / old-versions 归档规则必须与 `src/pages/mf-games/MfGames.vue` 及 `scripts/generate-api.js` 保持一致；修改任一侧时三处同步。

## 4. 数据与链接兼容性

- 新版详情抽屉沿用 `?id=<record id>` 作为直达链接，同时识别旧版的 `?game=<slug>` 与 `?asset=<slug>`，因此从旧版复制出来的分享链接在新版中依然可用。
- 下载链接规则、直链开关（`useDirectLink`）与文件大小查询全部沿用 `src/util/*` 现有实现，未做改动。

## 5. 设计说明

- 色彩：以纸白 / 石墨为底，**唯一的强调色是档案红**，只用于主操作、当前导航项与选中行；彩色仅用于承载数据含义的标签（国内 / 国外 / 最新 / 制作软件）。
- 字体：正文与标题统一使用 IBM Plex Sans Variable，日期、版本号、文件名等记录型数据使用 IBM Plex Mono。
- 布局：顶栏（品牌 + 站外链接 + 语言 + 设计切换）→ 左侧目录导航 → 页头（标题 / 说明 / 统计）→ 吸顶工具栏 → 记录列表 → 详情抽屉。
- 动效克制：仅抽屉与弹层有过渡，并尊重 `prefers-reduced-motion`。

## 6. 自查清单

改动新版后建议检查：

1. `bun run lint`
2. `bun run build`，随后 `bun run preview` 逐页打开 `?design=next` 与 `?design=legacy`
3. 中英文切换后：列表、抽屉、文档页条目预览的字段是否都跟着变
4. 375px / 768px / 1440px 三档宽度下是否出现横向滚动
5. 深色模式下标签、下拉框、抽屉与文档表格的对比度
