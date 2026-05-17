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
- **骨架屏 & 加载动画** — 双模式加载状态，流畅体验
- **Framer Motion 动画** — 交错入场、淡入、滑动、缩放过渡
- **国际化** — 中英双语（可扩展）
- **响应式布局** — 侧边栏导航 + 页面过渡动画

### 📦 导入 & 导出
- **ZIP 导入/导出** — 打包分享技能集合
- **市场搜索** — 从 GitHub 发现技能和 MCP 服务器

---

## 🏗️ 架构

```
AetherDock
├── 🖥️ 前端 (React + TypeScript + Vite)
│   ├── 页面: 仪表盘 / 技能 / MCP / 工具 / 安装 / 设置
│   ├── 组件: UI 组件库 / 动画 / 技能组件 / 仪表盘组件 / 布局
│   ├── 状态: Zustand 状态管理
│   └── 国际化: react-i18next
│
├── ⚙️ 后端 (Go + Wails v2)
│   ├── 引导: 应用初始化、数据库迁移
│   ├── 服务: Skill / MCP / Git / Sync / Marketplace / Tools / Settings / Activity / ImportExport
│   ├── 仓库: GORM + SQLite (WAL 模式)
│   └── 模型: Skill / MCP / Tool / Source / Activity / Settings / Sync
│
└── 🔗 桥接 (Wails IPC)
    └── Go ↔ TypeScript 类型安全的 API 绑定
```

---

## 📁 项目结构

```
aether-dock/
├── app.go                          # Wails 应用入口，API 处理器
├── main.go                         # 窗口配置 & 启动
├── go.mod                          # Go 依赖
├── wails.json                      # Wails 项目配置
│
├── backend/
│   ├── bootstrap/                  # 应用引导 & 数据库初始化
│   ├── constants/                  # 应用、技能、MCP、工具常量
│   ├── errors/                     # 错误码 & 类型
│   ├── models/                     # GORM 模型 (Skill, MCP, Tool, Activity...)
│   ├── repository/                 # 数据访问层 (SQLite)
│   └── service/                    # 业务逻辑
│       ├── skill_service.go        # 技能管理
│       ├── mcp_service.go          # MCP 服务器管理
│       ├── git_service.go          # Git 操作
│       ├── marketplace_service.go  # 市场搜索 & 分支获取
│       ├── tool_service.go         # 工具检测 & 配置
│       ├── sync_service.go         # 技能-工具同步
│       ├── settings_service.go     # 应用设置
│       ├── activity_service.go     # 活动记录
│       └── import_export_service.go # 导入导出
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/                 # 通用 UI 组件
    │   │   │   ├── Form.tsx        # Input / Select / SearchInput / Textarea
    │   │   │   ├── Loading.tsx     # Skeleton / Spinner / 双模式加载
    │   │   │   ├── Table.tsx       # 带加载状态的数据表格
    │   │   │   ├── Upload.tsx      # 拖拽上传组件
    │   │   │   ├── SkillIcon.tsx   # 图标回退链
    │   │   │   ├── ViewToggle.tsx  # 画廊/列表切换
    │   │   │   ├── SortDropdown.tsx # 排序下拉
    │   │   │   ├── StatusBadge.tsx # 状态徽章
    │   │   │   ├── ConfirmDialog.tsx # 确认对话框
    │   │   │   ├── ToastContainer.tsx # 消息提示
    │   │   │   └── motion/         # Framer Motion 封装
    │   │   ├── skills/             # 技能专用组件
    │   │   ├── dashboard/          # 仪表盘组件
    │   │   └── layout/             # 应用外壳 & 侧边栏
    │   ├── pages/                  # 路由页面
    │   ├── stores/                 # Zustand 状态管理
    │   ├── services/               # Wails 桥接 API
    │   ├── i18n/                   # 国际化
    │   ├── types/                  # TypeScript 类型定义
    │   ├── constants/              # 工具图标 & 支持的工具列表
    │   ├── utils/                  # 工具函数
    │   └── styles/                 # 全局 CSS & 设计令牌
    └── wailsjs/                    # 自动生成的 Wails 绑定
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
