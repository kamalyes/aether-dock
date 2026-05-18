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

<p align="center">
  English | <a href="README_zh.md">简体中文</a>
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
- **Theme system** — Light/dark/system mode, accent color presets, corner radius and base font size controls
- **Command palette** — Keyboard-first navigation and quick actions
- **Skeleton & Spinner loading** — Dual loading modes for smooth UX
- **Framer Motion animations** — Stagger, fade, slide, scale transitions
- **i18n** — English & Chinese (extensible)
- **Responsive layout** — Sidebar navigation with page transitions

### 📦 Import & Export
- **ZIP import/export** — Bundle and share skill collections
- **Marketplace search** — Discover skills and MCP servers from GitHub

---

## 🏗️ Architecture

AetherDock is a local-first Wails desktop app. The frontend owns the interactive workspace and presentation state, while the Go backend owns persistence, filesystem integration, Git operations, marketplace access, tool detection, and MCP/skill synchronization.

```
AetherDock
├── Desktop shell
│   ├── Wails v2 window, embedded Vite assets, and Go method bindings
│   └── IPC boundary through app.go and frontend/src/services/wailsBridge.ts
│
├── Frontend workspace (React + TypeScript)
│   ├── App shell: sidebar navigation, scan widget, command palette, toasts
│   ├── Pages: Dashboard / Skills / MCP / Tools / Install / Settings
│   ├── Domain components: Skills, MCP, Theme, Loading, Table, Dialog, Control
│   ├── State stores: skillStore, mcpStore, toolStore, themeStore, toastStore
│   ├── Theme system: light/dark/system mode, accent presets, radius, base font size
│   └── i18n: English and Chinese locale dictionaries
│
├── Backend core (Go)
│   ├── bootstrap.AppBootstrap initializes data directories, SQLite, migrations, services
│   ├── RepositoryFactory provides GORM repositories over SQLite WAL mode
│   ├── Services coordinate skills, MCP servers, sync, Git, marketplace, tools, settings, activity, import/export
│   └── Models persist Skill, MCP, Tool, Source, Activity, Settings, and Sync records
│
├── Local data and integrations
│   ├── Data lives under ~/.aether-dock with skills/, mcp/, and aether-dock.db
│   ├── Tool detection reads known config locations for Claude Code, Cursor, Windsurf, Trae, Kiro, Gemini CLI, Codex, and others
│   └── Sync services write skills and MCP configs into each enabled tool target
│
└── CI and release
    ├── GitHub Actions builds Windows amd64 and macOS universal artifacts
    └── Tag pushes publish releases; manual runs can build artifacts or publish a typed version
```

### Runtime flow

1. `main.go` starts the Wails window and binds `App`.
2. `App.startup` calls `backend/bootstrap`, creates `~/.aether-dock`, opens SQLite in WAL mode, migrates models, initializes settings, and detects installed tools.
3. React starts through `frontend/src/main.tsx`, initializes theme and settings, then routes into the app shell.
4. Stores call `wailsBridge`, which parses Go JSON responses into typed `ApiResponse<T>` objects and falls back to mock data when the Wails runtime is unavailable during browser development.
5. Backend services record activity and keep database state aligned with filesystem/Git/tool sync side effects.

---

## 📁 Project Structure

```
aether-dock/
├── .github/workflows/release.yml       # Windows/macOS build and GitHub Release workflow
├── app.go                              # Wails IPC facade and API handlers
├── main.go                             # Desktop window setup and embedded frontend assets
├── go.mod / go.sum                     # Go module dependencies
├── wails.json                          # Wails frontend/build configuration
│
├── backend/
│   ├── bootstrap/                      # Data dir, database, migrations, service wiring
│   ├── constants/                      # App metadata, default paths, supported tool constants
│   ├── errors/                         # Error codes and localized messages
│   ├── models/                         # GORM entities
│   ├── repository/                     # Repository factory and persistence layer
│   └── service/                        # Business services
│       ├── skill_service.go            # Install, delete, enable, update, version diff
│       ├── mcp_service.go              # MCP CRUD, discovery, tool enablement
│       ├── git_service.go              # Clone, pull, branch list, status and diff helpers
│       ├── marketplace_service.go      # Marketplace and GitHub lookup
│       ├── tool_service.go             # Tool detection and enable/disable state
│       ├── sync_service.go             # Skill/MCP sync into tool config targets
│       ├── settings_service.go         # App preferences and defaults
│       ├── activity_service.go         # Activity timeline records
│       └── import_export_service.go    # ZIP import/export
│
├── frontend/
│   ├── package.json / package-lock.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Shell/                  # AppLayout, CommandPalette, sidebar scan widget
│   │   │   ├── Skills/                 # Skill workbench, matrix table, detail, diff, marketplace
│   │   │   ├── Mcp/                    # MCP status and related UI
│   │   │   ├── Theme/                  # ThemePicker and theme preset tokens
│   │   │   ├── Control/ Input/ Table/  # Shared controls and form/table primitives
│   │   │   ├── Loading/ Dialog/ Toast/ # Feedback and overlay primitives
│   │   │   └── Motion/ Card/ Badge/    # Visual building blocks
│   │   ├── pages/                      # Dashboard, Skills, MCP, Tools, Install, Settings
│   │   ├── stores/                     # Zustand stores for domain and UI state
│   │   ├── services/wailsBridge.ts     # Runtime bridge and dev-mode mocks
│   │   ├── i18n/locales/               # en/zh translations
│   │   ├── constants/                  # App version, tool icons, supported tools
│   │   ├── styles/globals.css          # Design tokens and global theme CSS
│   │   └── types/                      # Shared TypeScript contracts
│   └── wailsjs/                        # Generated Wails bindings
│
└── build/                              # Icons, manifests, and generated build output
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

### Release Workflow

The repository includes `.github/workflows/release.yml` for Windows and macOS packaging.

- Push a tag such as `v0.1.0` to build and publish a GitHub Release.
- Run the workflow manually without a version to publish a Release named after the current short commit id.
- Run the workflow manually with `version` set to a tag such as `v0.1.0` to publish a Release from the selected commit.

Generated assets:

- `aether-dock-windows-amd64.zip`
- `aether-dock-darwin-universal.zip`

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
