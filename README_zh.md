<p align="center">
  <img src="frontend/src/assets/images/logo-universal.png" alt="AetherDock" width="80" height="80" />
</p>

<h1 align="center">AetherDock</h1>

<p align="center">
  <strong>下一代 AI 技能 & MCP 管理器</strong><br/>
  统一管理 Claude Code、Cursor、Windsurf、Trae 等多平台 AI 编码技能与 MCP 服务器
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat-square&logo=go" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Wails-v2-2D9CDB?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

<p align="center">
  <a href="README.md">English</a> | 简体中文
</p>

---

## ✨ 功能特性

### 🧩 技能管理
- **多来源安装** — Git（HTTPS/SSH/简写格式）、本地目录、市场
- **自动分支检测** — 解析 GitHub URL 并拉取可用分支列表
- **画廊 & 列表视图** — 卡片网格与紧凑列表自由切换
- **批量操作** — 多选、批量启用/禁用、批量删除
- **状态追踪** — 已安装 / 有更新 / 已修改 / 错误
- **详情抽屉** — 侧边面板，支持 Markdown 预览、工具开关、Git 状态

### 🔌 MCP 服务器管理
- **一键添加** — 配置命令、参数、环境变量
- **工具发现** — 自动检测 MCP 服务器暴露的工具
- **按工具启用/禁用** — 针对每个 AI 编码工具的精细控制

### 🛠️ 多工具支持
- **自动检测** — 扫描系统中已安装的 AI 编码工具
- **10+ 工具** — Claude Code、Cursor、Windsurf、Trae、Kiro、Gemini CLI、GitHub Copilot、OpenCode、OpenClaw、Codex 等
- **技能-工具同步** — 将技能部署到任意工具组合

### 📊 仪表盘
- **统计概览** — 技能、MCP 服务器、来源、工具一目了然
- **快捷操作** — 安装技能、添加 MCP、扫描本地、浏览市场
- **活动时间线** — 最近的安装/更新/删除操作

### 🎨 界面 & 体验
- **毛玻璃设计** — 简洁现代的界面风格
- **主题系统** — 浅色/深色/跟随系统、强调色预设、圆角和基础字号控制
- **命令面板** — 支持键盘优先的导航与快捷操作
- **骨架屏 & 加载动画** — 双模式加载状态，流畅体验
- **Framer Motion 动画** — 交错入场、淡入、滑动、缩放过渡
- **国际化** — 中英双语（可扩展）
- **响应式布局** — 侧边栏导航 + 页面过渡动画

### 📦 导入 & 导出
- **ZIP 导入/导出** — 打包分享技能集合
- **市场搜索** — 从 GitHub 发现技能和 MCP 服务器

---

## 🏗️ 架构

AetherDock 是一个本地优先的 Wails 桌面应用。前端负责交互工作台、路由、主题和展示状态，Go 后端负责持久化、文件系统集成、Git 操作、市场访问、工具检测，以及技能/MCP 的同步落地。

```
AetherDock
├── 桌面外壳
│   ├── Wails v2 窗口、嵌入式 Vite 资源、Go 方法绑定
│   └── 通过 app.go 与 frontend/src/services/wailsBridge.ts 建立 IPC 边界
│
├── 前端工作台 (React + TypeScript)
│   ├── 应用外壳: 侧边栏导航、扫描状态组件、命令面板、Toast
│   ├── 页面: Dashboard / Skills / MCP / Tools / Install / Settings
│   ├── 领域组件: Skills、MCP、Theme、Loading、Table、Dialog、Control
│   ├── 状态仓库: skillStore、mcpStore、toolStore、themeStore、toastStore
│   ├── 主题系统: 浅色/深色/跟随系统、强调色预设、圆角、基础字号
│   └── 国际化: 英文与中文 locale 字典
│
├── 后端核心 (Go)
│   ├── bootstrap.AppBootstrap 初始化数据目录、SQLite、迁移和服务依赖
│   ├── RepositoryFactory 基于 GORM + SQLite WAL 模式提供仓库层
│   ├── Services 组织技能、MCP、同步、Git、市场、工具、设置、活动、导入导出逻辑
│   └── Models 持久化 Skill、MCP、Tool、Source、Activity、Settings、Sync 记录
│
├── 本地数据与外部集成
│   ├── 数据位于 ~/.aether-dock，包含 skills/、mcp/ 和 aether-dock.db
│   ├── 工具检测读取 Claude Code、Cursor、Windsurf、Trae、Kiro、Gemini CLI、Codex 等已知配置位置
│   └── 同步服务把技能和 MCP 配置写入每个启用工具的目标目录
│
└── CI 与发布
    ├── GitHub Actions 构建 Windows amd64 与 macOS universal 产物
    └── 推送 tag 自动发布；手动运行可只构建产物，也可输入版本号发布 Release
```

### 运行流程

1. `main.go` 启动 Wails 窗口并绑定 `App`。
2. `App.startup` 调用 `backend/bootstrap`，创建 `~/.aether-dock`，以 WAL 模式打开 SQLite，迁移模型，初始化设置，并检测已安装工具。
3. React 通过 `frontend/src/main.tsx` 启动，初始化主题和设置后进入应用外壳。
4. Zustand stores 调用 `wailsBridge`，将 Go 返回的 JSON 解析为类型化 `ApiResponse<T>`；浏览器开发模式下自动使用 mock 数据。
5. 后端 services 记录活动日志，并保持数据库状态与文件系统、Git、工具同步副作用一致。

---

## 📁 项目结构

```
aether-dock/
├── .github/workflows/release.yml       # Windows/macOS 构建与 GitHub Release 发布
├── app.go                              # Wails IPC 门面与 API 处理器
├── main.go                             # 桌面窗口配置与前端资源嵌入
├── go.mod / go.sum                     # Go 模块依赖
├── wails.json                          # Wails 前端与构建配置
│
├── backend/
│   ├── bootstrap/                      # 数据目录、数据库、迁移、服务装配
│   ├── constants/                      # 应用元信息、默认路径、支持工具常量
│   ├── errors/                         # 错误码与本地化错误信息
│   ├── models/                         # GORM 实体
│   ├── repository/                     # RepositoryFactory 与持久化层
│   └── service/                        # 业务服务
│       ├── skill_service.go            # 安装、删除、启用、更新、版本差异
│       ├── mcp_service.go              # MCP CRUD、工具发现、工具启用
│       ├── git_service.go              # clone、pull、分支列表、状态和 diff
│       ├── marketplace_service.go      # 市场与 GitHub 查询
│       ├── tool_service.go             # 工具检测与启用/禁用状态
│       ├── sync_service.go             # 技能/MCP 同步到工具配置目标
│       ├── settings_service.go         # 应用偏好与默认值
│       ├── activity_service.go         # 活动时间线记录
│       └── import_export_service.go    # ZIP 导入导出
│
├── frontend/
│   ├── package.json / package-lock.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Shell/                  # AppLayout、CommandPalette、侧边栏扫描组件
│   │   │   ├── Skills/                 # 技能工作台、矩阵表格、详情、diff、市场
│   │   │   ├── Mcp/                    # MCP 状态与相关 UI
│   │   │   ├── Theme/                  # ThemePicker 与主题预设 token
│   │   │   ├── Control/ Input/ Table/  # 通用控件、表单、表格基础组件
│   │   │   ├── Loading/ Dialog/ Toast/ # 反馈与浮层组件
│   │   │   └── Motion/ Card/ Badge/    # 视觉基础组件
│   │   ├── pages/                      # Dashboard、Skills、MCP、Tools、Install、Settings
│   │   ├── stores/                     # 领域和 UI Zustand stores
│   │   ├── services/wailsBridge.ts     # Wails Runtime 桥接和开发模式 mock
│   │   ├── i18n/locales/               # en/zh 翻译
│   │   ├── constants/                  # 应用版本、工具图标、支持工具
│   │   ├── styles/globals.css          # 设计 token 与全局主题 CSS
│   │   └── types/                      # 共享 TypeScript 契约
│   └── wailsjs/                        # 自动生成的 Wails 绑定
│
└── build/                              # 图标、manifest 与生成的构建产物
```

---

## 🚀 快速开始

### 环境要求

- [Go](https://go.dev/dl/) 1.25+
- [Node.js](https://nodejs.org/) 18+
- [Wails CLI](https://wails.io/docs/gettingstarted/installation) v2

### 安装 Wails CLI

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### 开发

```bash
# 克隆仓库
git clone https://github.com/kamalyes/aether-dock.git
cd aether-dock

# 安装前端依赖
cd frontend && npm install && cd ..

# 开发模式运行（热重载）
wails dev
```

开发服务器运行在 `http://localhost:34115`，可在浏览器中调试并直接调用 Go 方法。

### 构建

```bash
wails build
```

输出文件在 `build/bin/` 目录下。

### 发布 Workflow

仓库内置 `.github/workflows/release.yml`，用于自动打包 Windows 与 macOS 版本。

- 推送 `v0.1.0` 这类 tag 时，会自动构建并发布 GitHub Release。
- 手动运行 workflow 且不填写版本号时，会使用当前短 commit id 作为 Release 名称发布。
- 手动运行 workflow 并在 `version` 中填写 `v0.1.0` 这类 tag 时，会基于所选 commit 发布 Release。

生成产物：

- `aether-dock-windows-amd64.zip`
- `aether-dock-darwin-universal.zip`

---

## 🎯 支持的 AI 工具

| 工具 | 图标 | 配置路径 |
|------|:----:|---------|
| Claude Code | 🟠 | `~/.claude/` |
| Cursor | 🔵 | `.cursor/rules/` |
| Windsurf | 🟣 | `.windsurf/rules/` |
| Trae / Trae CN | 🟡 | `.trae/rules/` |
| Kiro | 🟢 | `.kiro/` |
| Gemini CLI | 🔷 | `~/.gemini/` |
| GitHub Copilot | ⚫ | `.github/copilot/` |
| OpenCode | ⚪ | `~/.opencode/` |
| OpenClaw | 🟤 | `~/.openclaw/` |
| Codex | 🟢 | `~/.codex/` |

---

## 🧰 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 桌面框架 | [Wails v2](https://wails.io) | Go + Web 原生桌面应用 |
| 前端 | React 18 + TypeScript | UI 框架 |
| 构建 | Vite 6 | 快速打包 & 热更新 |
| 样式 | Tailwind CSS 3 | 原子化 CSS |
| 动画 | Framer Motion | 页面过渡 & 微交互 |
| 状态 | Zustand 5 | 轻量级状态管理 |
| 图标 | Lucide React | 统一图标集 |
| 图表 | ECharts | 仪表盘可视化 |
| 国际化 | react-i18next | 多语言支持 |
| 后端 | Go | 核心业务逻辑 |
| ORM | GORM | 数据库操作 |
| 数据库 | SQLite (WAL) | 本地数据持久化 |
| Git | go-git/v5 | 仓库操作 |

---

## 📄 许可证

MIT License — 详见 [LICENSE](LICENSE)

---

<p align="center">
  由 <a href="https://github.com/kamalyes">kamalyes</a> 用 ❤️ 构建
</p>
