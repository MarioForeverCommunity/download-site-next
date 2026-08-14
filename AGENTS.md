# Agent 指南：download.marioforever.net

本文件面向在此仓库中工作的 **AI Agent**（Claude Code、Cursor、Copilot 等）与开发者，提供动手编码前必须了解的核心事实。请先通读全文；凡涉及**数据字段、下载链接或静态 JSON API** 的任务，务必遵循第 2 节的「镜像一致性」约束——这是本仓库最容易改出问题的地方。

## 1. 项目是什么

download.marioforever.net 是一个 **Vue 3 静态站点**，用 Vite + 纯 JavaScript 构建，以中英双语收录并展示：

- Mario Forever 原版与同人作品（MF）
- Super Mario Worker Project 关卡（SMWP / MW）
- 创作资源（引擎、拓展、素材、特效、工具）
- Softendo / Buziol Games 游戏

它本质上是「**数据驱动的目录站**」：全部内容存放在 `public/data/*.yaml`，前端页面运行时读取渲染，构建时再聚合生成一份**静态 JSON API** 供第三方使用。

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
└── mf-games|mw-levels|assets|softendo/   各作品图片目录
public/api/                   （生成物）静态 JSON API
scripts/
├── generate-api.js           API 生成（与 src/util/* 镜像）
├── generate-image-index.js   图片索引生成
├── compress-data.js          构建产物压缩
├── check_yaml.py             YAML 校验（CI 使用）
├── mf-list-schema.yaml       MF 列表 JSON Schema
└── mw-list-schema.yaml       MW 列表 JSON Schema
src/
├── components/               页面组件（GameCard 等）
├── pages/                    每个入口的页面
├── util/                     ReadList / use*List / GameUtil 等
└── config.js                 站点配置（顶栏、导航、链接识别）
```

入口 HTML：`index.html`、`mf-games.html`、`mw-levels.html`、`assets.html`、`mario-worker.html`、`softendo.html`。

## 6. 数据字段速查

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
- 所有端点的 API 链接在生成时都**不做 URL 编码**（与 MF/MW 一致），含中文/空格的文件名原样拼接，由客户端处理

## 7. 语言与多语言约定

- 语言状态变量 `lan`（`"zh"` / `"en"`），用 js-cookie 持久化
- 本地化字段后缀：`_zh` / `_en`（描述）、`_alt`（英文名 / 译名 / 备用链接）
- 英文页面优先显示 `_alt` 字段，原始语言名可通过过滤检索
- 所有功能必须在中英文下都可用

## 8. 常见任务流程

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

## 9. 常见坑

- YAML 键名**不要重复**（后者会覆盖前者）
- 所有日期用 `YYYY-MM-DD`（YAML 解析需 `YAML11_SCHEMA` 才会得到 Date）
- 所有端点的资源站链接都**不做 URL 编码**（含中文/空格，由客户端处理）；修改链接规则时需同时改 `src/util/*` 与 `scripts/generate-api.js`
- `file_name` 以 `.apk` 结尾视为安卓包（路径不同）；带 `repacker` 的版本归入重打包目录
- 国际作品旧版本会加 `old-versions/` 前缀（`useMfList.js` 与 API 脚本各自实现，规则必须一致）
- `manualChunks` 用函数形式（Rolldown）
- `scripts/` 使用 Node.js 全局，`src/` 使用浏览器全局

## 10. 代码风格

- 缩进 2 空格；优先 `const`；字符串用双引号；箭头函数
- 导入顺序：Vue → 第三方库 → 本地工具（`@/` 或相对路径）→ 组件
- 本地 JS 导入必须带 `.js` 扩展名；`@/` 指向 `src/`
- 组件：PascalCase；函数/变量：camelCase；CSS 类：kebab-case
- Props 用 `defineProps()` 置于 script 顶部，`defineEmits()` 声明事件
- 错误处理用 `try/catch`，返回空值前做 null 检查
- 完整 ESLint 规则见 `eslint.config.js`（`bun run lint` 自动修复）
- **文档与注释的段落不要手工换行**（避免截断换行），由编辑器软换行，保持源码整洁与 diff 清晰

## 11. 提交与校验

- 提交前运行 `bun run lint`
- YAML 改动会被 CI（`scripts/check_yaml.py` + schema）校验，本地可用 `python scripts/check_yaml.py` 自检
- commit message 使用英文
- 除列表更新外，其余改动提交到 `next` 分支（`main` 为线上稳定分支）
- 本项目无测试框架，改动后需手动验证中英文各入口与响应式
