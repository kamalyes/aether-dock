<p align="center">
  <img src="frontend/src/assets/images/logo-universal.png" alt="AetherDock" width="80" height="80" />
</p>

<h1 align="center">AetherDock</h1>

<p align="center">
  <strong>Next-Gen AI Skill & MCP Manager</strong><br/>
  Unified management for AI coding skills and MCP servers across Claude Code, Cursor, Windsurf, Trae, and more.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat-square&logo=go" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Wails-v2-2D9CDB?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## ✨ Features

### 🧩 Skill Management
- **Multi-source install** — Git (HTTPS/SSH/shorthand), local directory, marketplace
- **Auto branch detection** — Parses GitHub URLs and fetches available branches
- **Gallery & List views** — Switch between card grid and compact list
- **Batch operations** — Multi-select, batch enable/disable, batch delete
- **Status tracking** — Installed / Update Available / Modified / Error
- **Detail drawer** — Side panel with markdown preview, tool toggles, git status

### 🔌 MCP Server Management
- **One-click add** — Configure command, args, env variables
- **Tool discovery** — Auto-detect tools exposed by MCP servers
- **Per-tool enable/disable** — Fine-grained control per AI coding tool

### 🛠️ Multi-Tool Support
- **Auto-detection** — Scans system for supported AI coding tools
- **10+ tools supported** — Claude Code, Cursor, Windsurf, Trae, Kiro, Gemini CLI, GitHub Copilot, OpenCode, OpenClaw, Codex, and more
- **Skill-to-tool sync** — Deploy skills to any combination of tools

### 📊 Dashboard
- **Stats overview** — Skills, MCP servers, sources, tools at a glance
- **Quick actions** — Install skill, add MCP, scan local, browse marketplace
- **Activity timeline** — Recent install/update/delete operations

### 🎨 UI & UX
- **Glass morphism design** — Clean, modern interface with subtle depth
- **Skeleton & Spinner loading** — Dual loading modes for smooth UX
- **Framer Motion animations** — Stagger, fade, slide, scale transitions
- **i18n** — English & Chinese (extensible)
- **Responsive layout** — Sidebar navigation with page transitions

### 📦 Import & Export
- **ZIP import/export** — Bundle and share skill collections
- **Marketplace search** — Discover skills and MCP servers from GitHub

---

## 🏗️ Architecture

```
AetherDock
├── 🖥️ Frontend (React + TypeScript + Vite)
│   ├── Pages: Dashboard / Skills / MCP / Tools / Install / Settings
│   ├── Components: UI Library / Motion / Skills / Dashboard / Layout
│   ├── State: Zustand Stores
│   └── i18n: react-i18next
│
├── ⚙️ Backend (Go + Wails v2)
│   ├── Bootstrap: App initialization, DB migration
│   ├── Services: Skill / MCP / Git / Sync / Marketplace / Tools / Settings / Activity / ImportExport
│   ├── Repository: GORM + SQLite (WAL mode)
│   └── Models: Skill / MCP / Tool / Source / Activity / Settings / Sync
│
└── 🔗 Bridge (Wails IPC)
    └── Type-safe API bindings between Go and TypeScript
```

---

## 📁 Project Structure

```
aether-dock/
├── app.go                          # Wails app entry, API handlers
├── main.go                         # Window config & startup
├── go.mod                          # Go dependencies
├── wails.json                      # Wails project config
│
├── backend/
│   ├── bootstrap/                  # App bootstrap & DB init
│   ├── constants/                  # App, skill, MCP, tool constants
│   ├── errors/                     # Error codes & types
│   ├── models/                     # GORM models (Skill, MCP, Tool, Activity...)
│   ├── repository/                 # Data access layer (SQLite)
│   └── service/                    # Business logic
│       ├── skill_service.go
│       ├── mcp_service.go
│       ├── git_service.go
│       ├── marketplace_service.go
│       ├── tool_service.go
│       ├── sync_service.go
│       ├── settings_service.go
│       ├── activity_service.go
│       └── import_export_service.go
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/                 # Reusable UI components
    │   │   │   ├── Form.tsx        # Input / Select / SearchInput / Textarea
    │   │   │   ├── Loading.tsx     # Skeleton / Spinner / Loading modes
    │   │   │   ├── Table.tsx       # Data table with loading states
    │   │   │   ├── Upload.tsx      # File upload with drag-and-drop
    │   │   │   ├── SkillIcon.tsx   # Icon with fallback chain
    │   │   │   ├── ViewToggle.tsx  # Gallery / List switcher
    │   │   │   ├── SortDropdown.tsx
    │   │   │   ├── StatusBadge.tsx
    │   │   │   ├── ConfirmDialog.tsx
    │   │   │   ├── ToastContainer.tsx
    │   │   │   └── motion/         # Framer Motion wrappers
    │   │   ├── skills/             # Skill-specific components
    │   │   ├── dashboard/          # Dashboard widgets
    │   │   └── layout/             # App shell & sidebar
    │   ├── pages/                  # Route pages
    │   ├── stores/                 # Zustand state management
    │   ├── services/               # Wails bridge API
    │   ├── i18n/                   # Internationalization
    │   ├── types/                  # TypeScript type definitions
    │   ├── constants/              # Tool icons & supported tools
    │   ├── utils/                  # Utility functions
    │   └── styles/                 # Global CSS & design tokens
    └── wailsjs/                    # Auto-generated Wails bindings
```

---

## 🚀 Getting Started

### Prerequisites

- [Go](https://go.dev/dl/) 1.25+
- [Node.js](https://nodejs.org/) 18+
- [Wails CLI](https://wails.io/docs/gettingstarted/installation) v2

### Install Wails CLI

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### Development

```bash
# Clone the repository
git clone https://github.com/kamalyes/aether-dock.git
cd aether-dock

# Install frontend dependencies
cd frontend && npm install && cd ..

# Run in development mode (hot reload)
wails dev
```

The dev server runs at `http://localhost:34115` for browser-based debugging with Go method access.

### Build

```bash
wails build
```

Output binary is in `build/bin/`.

---

## 🎯 Supported AI Tools

| Tool | Icon | Config Path |
|------|:----:|-------------|
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

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Desktop Framework | [Wails v2](https://wails.io) | Go + Web native desktop app |
| Frontend | React 18 + TypeScript | UI framework |
| Build | Vite 6 | Fast bundling & HMR |
| Styling | Tailwind CSS 3 | Utility-first CSS |
| Animation | Framer Motion | Page transitions & micro-interactions |
| State | Zustand 5 | Lightweight state management |
| Icons | Lucide React | Consistent icon set |
| Charts | ECharts | Dashboard visualizations |
| i18n | react-i18next | Internationalization |
| Backend | Go | Core business logic |
| ORM | GORM | Database operations |
| Database | SQLite (WAL) | Local data persistence |
| Git | go-git/v5 | Repository operations |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/kamalyes">kamalyes</a>
</p>
