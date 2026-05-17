# AetherDock 竞品融合计划

> 综合 Skills-Dock、skills-manager、SkillsHub、PromptHub、Skiller 五大竞品精华，打造「好用且炫酷」的下一代 Skill 管理平台。

---

## 一、竞品特性矩阵

| 特性 | Skills-Dock | skills-manager | SkillsHub | PromptHub | Skiller |
|------|:-----------:|:--------------:|:---------:|:---------:|:-------:|
| 仪表盘概览 | ✅ 统计+活动 | ❌ | ❌ | ❌ | ✅ 四卡片+快捷操作 |
| 技能商店 | ✅ 市场 | ✅ 远程注册表 | ❌ | ✅ 分类商店+自定义源 | ❌ |
| 卡片画廊视图 | ❌ | ❌ | ✅ 动画卡片 | ✅ 画廊+列表切换 | ✅ 卡片+列表切换 |
| 标签树导航 | ❌ | ❌ | ❌ | ✅ 标签筛选 | ✅ 层级标签树 |
| AI 推荐 | ❌ | ✅ 任务推荐 | ❌ | ❌ | ❌ |
| AI 翻译 | ❌ | ❌ | ❌ | ✅ 沉浸式翻译 | ❌ |
| AI 摘要 | ✅ 生成摘要 | ❌ | ❌ | ❌ | ❌ |
| 多平台安装 | ✅ 批量应用 | ✅ 多工具 | ❌ | ✅ 15+平台 Symlink/Copy | ✅ 工具预设分发 |
| 批量操作 | ✅ 批量同步/修复 | ❌ | ❌ | ✅ 批量部署/标签 | ✅ 多选模式 |
| 技能打包 | ✅ Bundle 系统 | ❌ | ❌ | ❌ | ❌ |
| 本地扫描 | ❌ | ❌ | ❌ | ✅ 目录扫描+预览 | ❌ |
| 版本历史 | ❌ | ❌ | ❌ | ✅ 快照+Diff | ❌ |
| 仓库管理 | ✅ 源管理 | ✅ 远程注册 | ❌ | ✅ 自定义源 | ✅ 仓库同步+修复 |
| 项目管理 | ❌ | ❌ | ❌ | ✅ 项目级技能 | ✅ 项目-技能关联 |
| 技能图标 | ❌ | ❌ | ❌ | ✅ URL→Emoji→首字母 | ❌ |
| 拖拽排序 | ❌ | ❌ | ❌ | ❌ | ✅ 拖拽技能 |
| 安全扫描 | ❌ | ❌ | ❌ | ✅ AI 安全检查 | ❌ |
| NPX 安装 | ❌ | ❌ | ❌ | ❌ | ✅ NPX 查找/安装 |
| 详情抽屉 | ✅ 模态详情 | ❌ | ❌ | ✅ 全屏详情页 | ✅ 侧边抽屉 |
| i18n | ✅ | ❌ | ❌ | ✅ 7 语言 | ✅ 中英 |

---

## 二、融合架构设计

### 2.1 页面结构（5 大模块）

```
AetherDock
├── 📊 Dashboard（仪表盘）          ← Skiller 统计卡片 + Skills-Dock 活动流
├── 🧩 Skills（技能中心）           ← PromptHub 商店 + SkillsHub 卡片 + Skiller 标签树
├── 🔌 MCP（MCP 服务器）           ← 现有增强
├── 📦 Marketplace（市场）          ← PromptHub 商店 + skills-manager 远程注册表 + Skiller 仓库
└── ⚙️ Settings（设置）            ← 现有增强
```

### 2.2 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 框架 | React 18 + TypeScript | 现有 |
| 构建 | Vite | 现有 |
| 路由 | React Router v6 | 现有 |
| 状态 | Zustand | 现有，需扩展 |
| 样式 | Tailwind CSS | 现有，需增加动画 |
| 动画 | Framer Motion | **新增** - 卡片入场、页面切换、抽屉 |
| 图标 | Lucide React | 现有 |
| i18n | react-i18next | 现有，需扩展 |
| 后端 | Go (Wails) | 现有，需扩展 API |

---

## 三、分阶段实施计划

### Phase 1：视觉焕新 + 交互升级（基础层）

> 目标：让现有页面「炫酷起来」，为后续功能打好 UI 基础。

#### 1.1 安装 Framer Motion

```bash
npm install framer-motion
```

#### 1.2 全局动画系统

创建 `@/components/ui/motion/` 目录：

| 组件 | 来源灵感 | 说明 |
|------|----------|------|
| `StaggerContainer` | SkillsHub SkillCard | 子元素依次入场动画 |
| `FadeIn` | PromptHub GalleryCard | 淡入+上滑入场 |
| `SlideDrawer` | Skiller DetailDrawer | 右侧滑入抽屉 |
| `PageTransition` | 通用 | 页面切换过渡 |
| `ScaleHover` | SkillsHub hover | 卡片悬浮缩放效果 |

#### 1.3 技能卡片画廊视图

**来源**：SkillsHub SkillCard + PromptHub SkillGalleryCard

- 网格布局（2-4 列响应式）
- 卡片入场动画（stagger，每张延迟 80ms）
- Hover 效果：阴影 + 上移 + 图标缩放
- 状态指示器（彩色圆点 + 文字）
- 标签芯片（彩色背景）
- 快捷操作（悬浮显示：收藏、安装、删除）

#### 1.4 视图模式切换

**来源**：PromptHub + Skiller

- 画廊视图（Gallery）- 卡片网格
- 列表视图（List）- 紧凑行
- 切换按钮带动画过渡

#### 1.5 技能详情抽屉

**来源**：Skiller SkillDetailDrawer + PromptHub SkillFullDetailPage

- 右侧滑入面板（400px 宽）
- 技能图标 + 名称 + 描述
- 标签列表
- 工具启用状态（开关）
- Markdown 内容预览
- 版本信息 + Git 状态

---

### Phase 2：仪表盘 + 数据可视化（体验层）

> 目标：首页即震撼，一目了然掌握全局。

#### 2.1 Dashboard 页面

**来源**：Skiller OverviewPage + Skills-Dock 统计

**统计卡片**（4 张）：

| 卡片 | 数据 | 状态指示 |
|------|------|----------|
| 🧩 技能 | 总数 / 已启用 | 有可用更新→琥珀色 |
| 🔌 MCP | 服务器数 / 已启用 | 有错误→红色 |
| 📦 来源 | 已配置来源数 | 待同步→警告色 |
| 🛠️ 工具 | 已检测工具数 | 未配置→灰色 |

**快捷操作**（4 个按钮）：
- 安装技能 → 弹出安装对话框
- 添加 MCP → 弹出添加表单
- 扫描本地 → 扫描本地 SKILL.md
- 浏览市场 → 跳转市场页

**最近活动**（来源：Skills-Dock activities）：
- 时间线列表，显示最近的安装/更新/删除操作

**技能状态分布**：
- 环形图或进度条，展示 installed/update_available/modified/error 占比

#### 2.2 首页路由调整

```
/ → Dashboard（新首页）
/skills → 技能中心
/mcp → MCP 服务器
/marketplace → 市场
/tools → 工具管理
/install → 安装向导
/settings → 设置
```

---

### Phase 3：技能中心重构（核心层）

> 目标：融合所有竞品的技能管理精华，打造最强技能中心。

#### 3.1 三栏布局

**来源**：Skiller SkillCenter + PromptHub SkillManager

```
┌──────────┬────────────────────────┬──────────────┐
│  标签树   │     技能列表/画廊       │   详情抽屉    │
│  (200px) │     (flex-1)           │   (400px)    │
│          │                        │              │
│ 🔍 搜索   │  [Gallery] [List] ⚙️   │  技能详情     │
│          │  ┌────┐ ┌────┐ ┌────┐  │              │
│ 全部技能   │  │ 📄 │ │ 📄 │ │ 📄 │  │  图标+名称   │
│ ├─ 开发    │  └────┘ └────┘ └────┘  │  描述        │
│ ├─ 办公    │  ┌────┐ ┌────┐ ┌────┐  │  标签        │
│ ├─ AI     │  │ 📄 │ │ 📄 │ │ 📄 │  │  工具开关    │
│ └─ 运维    │  └────┘ └────┘ └────┘  │  内容预览    │
│          │                        │              │
└──────────┴────────────────────────┴──────────────┘
```

#### 3.2 标签树导航

**来源**：Skiller SimpleTagTree + TagTreeStore

- 搜索标签
- 层级展示（可折叠）
- 点击筛选
- 标签计数徽章
- "全部技能" 顶部入口

#### 3.3 技能卡片增强

**来源**：SkillsHub SkillCard + PromptHub SkillGalleryCard

```tsx
<SkillCard>
  ├── 图标区域（URL → Emoji → 首字母 → 默认）
  ├── 名称 + 状态徽章
  ├── 描述（截断 2 行）
  ├── 标签芯片（最多 3 个 + "+N"）
  ├── 来源信息（路径 + 更新时间）
  └── Hover 操作栏（收藏/安装/删除）
</SkillCard>
```

#### 3.4 批量操作模式

**来源**：Skills-Dock batch + PromptHub SkillBatchDeployDialog

- 多选模式切换按钮
- 全选/反选
- 批量启用到工具
- 批量打标签
- 批量删除

#### 3.5 排序与筛选增强

**来源**：Skiller SortDropdown + PromptHub filterType

- 排序：名称 / 更新时间 / 创建时间 / 状态
- 筛选：状态 / 来源 / 标签
- 搜索：名称 + 描述 + 标签模糊匹配

---

### Phase 4：市场 + 发现（扩展层）

> 目标：让用户发现和获取技能变得极其简单。

#### 4.1 Marketplace 页面

**来源**：PromptHub SkillStore + skills-manager ExplorePanel

**布局**：

```
┌─────────────────────────────────────────────────┐
│  🔍 搜索栏                                       │
│  [全部] [开发] [办公] [AI] [数据] [安全] [部署]    │
├─────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ 商店卡片  │ │ 商店卡片  │ │ 商店卡片  │           │
│  │ 图标+名称 │ │ 图标+名称 │ │ 图标+名称 │           │
│  │ 描述      │ │ 描述      │ │ 描述      │           │
│  │ [安装]    │ │ [已安装]  │ │ [更新]    │           │
│  └─────────┘ └─────────┘ └─────────┘           │
│                                                 │
│  ── 自定义来源 ──                                 │
│  [GitHub 仓库] [本地目录] [JSON 注册表]            │
└─────────────────────────────────────────────────┘
```

#### 4.2 商店卡片

**来源**：PromptHub SkillStoreCard

- 技能图标
- 名称 + 分类标签
- 描述
- 安装状态（未安装 / 已安装 / 有更新）
- 一键安装按钮

#### 4.3 自定义来源管理

**来源**：PromptHub SkillStoreCustomSources

- GitHub 仓库 URL
- 本地目录路径
- Marketplace JSON URL
- 启用/禁用切换
- 同步刷新

#### 4.4 本地扫描

**来源**：PromptHub scanLocalPreview

- 选择目录扫描 SKILL.md
- 预览扫描结果
- 批量导入

---

### Phase 5：高级功能（差异化层）

> 目标：打造竞品没有或做得不够好的杀手级功能。

#### 5.1 AI 智能推荐

**来源**：skills-manager RecommendPanel

- 输入任务描述
- AI 分析推荐匹配技能
- 按相关度排序
- 一键安装推荐技能

#### 5.2 技能图标系统

**来源**：PromptHub SkillIcon

加载优先级：`icon_url → icon_emoji → 首字母 → 默认图标`

- 支持自定义图标 URL
- 支持 Emoji 图标
- 首字母彩色背景
- 图标选择器（Emoji Picker）

#### 5.3 版本快照

**来源**：PromptHub VersionHistoryModal

- 每次保存自动创建快照
- 快照列表（时间 + 描述）
- Diff 对比查看
- 一键回滚

#### 5.4 AI 翻译

**来源**：PromptHub AI Translation

- 沉浸式翻译（段落双语对照）
- 全文翻译
- 自动检测 UI 语言

#### 5.5 安全扫描

**来源**：PromptHub SafetyScan

- AI 驱动的内容安全检查
- 风险等级标识
- 扫描报告展示

---

## 四、数据模型扩展

### 4.1 Skill 类型扩展

```typescript
interface Skill {
  // 现有字段...
  id: string
  name: string
  description: string
  version: string
  sourceId: string
  installPath: string
  gitUrl: string
  gitBranch: string
  gitCommit: string
  status: SkillStatus
  enabledTools: string[]
  tags: string[]
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string

  // 新增字段
  iconUrl?: string          // 图标 URL
  iconEmoji?: string        // Emoji 图标
  iconBackground?: string   // 图标背景色
  category?: string         // 分类
  isFavorite?: boolean      // 收藏
  isBuiltin?: boolean       // 内置技能
  registrySlug?: string     // 注册表标识
  contentHash?: string      // 内容哈希（用于更新检测）
  safetyLevel?: 'safe' | 'warning' | 'danger'  // 安全等级
}
```

### 4.2 新增类型

```typescript
interface Tag {
  id: string
  name: string
  parentId?: string
  color?: string
  children?: Tag[]
}

interface Activity {
  id: string
  type: 'install' | 'update' | 'delete' | 'enable' | 'disable'
  skillName: string
  toolName?: string
  timestamp: string
}

interface RegistrySkill {
  slug: string
  name: string
  description: string
  category: string
  iconUrl?: string
  iconEmoji?: string
  contentUrl: string
  sourceUrl: string
  tags: string[]
}

interface StoreSource {
  id: string
  name: string
  type: 'marketplace-json' | 'git-repo' | 'local-dir'
  url: string
  enabled: boolean
  lastSyncedAt?: string
}
```

### 4.3 Store 扩展

```typescript
interface SkillState {
  // 现有...
  
  // 视图
  viewMode: 'gallery' | 'list'
  
  // 标签
  tags: Tag[]
  selectedTagId: string | null
  
  // 收藏
  toggleFavorite: (id: string) => Promise<void>
  
  // 批量
  selectedSkillIds: Set<string>
  toggleSkillSelection: (id: string) => void
  selectAllVisible: () => void
  clearSelection: () => void
  batchEnableForTool: (ids: string[], toolName: string) => Promise<void>
  
  // 排序
  sortOption: 'name' | 'updatedAt' | 'createdAt' | 'status'
  sortOrder: 'asc' | 'desc'
  
  // 活动
  activities: Activity[]
  fetchActivities: () => Promise<void>
  
  // 商店
  registrySkills: RegistrySkill[]
  storeCategory: string
  storeSearchQuery: string
  loadRegistry: () => Promise<void>
  installFromRegistry: (slug: string) => Promise<boolean>
  
  // 扫描
  scannedSkills: ScannedSkill[]
  scanLocal: (paths: string[]) => Promise<void>
  importScanned: (ids: string[]) => Promise<void>
}
```

---

## 五、UI 设计规范

### 5.1 配色方案（暗色主题）

| 用途 | 色值 | 说明 |
|------|------|------|
| 背景 L0 | `#0a0a0b` | 最底层 |
| 背景 L1 | `#111113` | 侧边栏 |
| 背景 L2 | `#18181b` | 卡片 |
| 背景 L3 | `#1f1f23` | 输入框/悬浮 |
| 边框 | `rgba(255,255,255,0.05)` | 微妙分隔 |
| 主文字 | `rgba(255,255,255,0.9)` | 标题 |
| 次文字 | `rgba(255,255,255,0.4)` | 描述 |
| 弱文字 | `rgba(255,255,255,0.2)` | 占位符 |
| 强调色 | `#10b981` (emerald-500) | 主操作 |
| 警告色 | `#f59e0b` (amber-500) | 更新/注意 |
| 错误色 | `#ef4444` (red-500) | 错误/危险 |
| 信息色 | `#3b82f6` (blue-500) | 提示 |

### 5.2 动画规范

| 场景 | 动画 | 时长 | 缓动 |
|------|------|------|------|
| 卡片入场 | fade-in + slide-up | 400ms | ease-out |
| 卡片 stagger | 逐张延迟 | 80ms/张 | - |
| Hover 上移 | translateY(-4px) | 200ms | ease-out |
| Hover 阴影 | shadow 扩散 | 200ms | ease-out |
| 抽屉滑入 | translateX(100%→0) | 300ms | spring |
| 页面切换 | fade + slide | 200ms | ease-in-out |
| 状态切换 | scale(0.95→1) | 150ms | ease-out |

### 5.3 间距规范

| 元素 | 间距 |
|------|------|
| 卡片内边距 | 20px (p-5) |
| 卡片间距 | 16px (gap-4) |
| 卡片圆角 | 16px (rounded-2xl) |
| 标签芯片圆角 | 9999px (rounded-full) |
| 按钮圆角 | 8px (rounded-lg) |

---

## 六、实施优先级

| 优先级 | Phase | 预计工作量 | 价值 |
|--------|-------|-----------|------|
| 🔴 P0 | Phase 1：视觉焕新 | 中 | ⭐⭐⭐⭐⭐ 立竿见影的体验提升 |
| 🔴 P0 | Phase 3.3-3.5：技能中心增强 | 中 | ⭐⭐⭐⭐⭐ 核心功能完善 |
| 🟡 P1 | Phase 2：仪表盘 | 中 | ⭐⭐⭐⭐ 首页震撼感 |
| 🟡 P1 | Phase 3.1-3.2：三栏+标签树 | 中 | ⭐⭐⭐⭐ 导航体验 |
| 🟢 P2 | Phase 4：市场 | 大 | ⭐⭐⭐ 发现能力 |
| 🟢 P2 | Phase 5：高级功能 | 大 | ⭐⭐⭐ 差异化 |

---

## 七、文件结构规划

```
src/
├── components/
│   ├── ui/
│   │   ├── motion/              # 动画组件
│   │   │   ├── StaggerContainer.tsx
│   │   │   ├── FadeIn.tsx
│   │   │   ├── SlideDrawer.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   └── ScaleHover.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── ToastContainer.tsx
│   │   ├── SkillIcon.tsx        # 技能图标组件
│   │   ├── ViewToggle.tsx       # 视图切换
│   │   ├── SortDropdown.tsx     # 排序下拉
│   │   └── StatusBadge.tsx      # 状态徽章
│   ├── skills/
│   │   ├── SkillCard.tsx        # 画廊卡片
│   │   ├── SkillListItem.tsx    # 列表行
│   │   ├── SkillDetailDrawer.tsx # 详情抽屉
│   │   ├── SkillIconPicker.tsx  # 图标选择器
│   │   ├── TagTree.tsx          # 标签树
│   │   ├── BatchActionBar.tsx   # 批量操作栏
│   │   └── SkillFilters.tsx     # 筛选栏
│   ├── dashboard/
│   │   ├── StatsCard.tsx        # 统计卡片
│   │   ├── QuickActions.tsx     # 快捷操作
│   │   ├── ActivityTimeline.tsx # 活动时间线
│   │   └── StatusDistribution.tsx # 状态分布
│   ├── marketplace/
│   │   ├── StoreCard.tsx        # 商店卡片
│   │   ├── CategoryTabs.tsx     # 分类标签
│   │   ├── CustomSources.tsx    # 自定义来源
│   │   └── LocalScanDialog.tsx  # 本地扫描
│   └── layout/
│       └── AppLayout.tsx        # 增强导航
├── pages/
│   ├── DashboardPage.tsx        # 仪表盘
│   ├── SkillsPage.tsx           # 重构技能页
│   ├── McpPage.tsx              # MCP 页
│   ├── MarketplacePage.tsx      # 市场页
│   ├── ToolsPage.tsx
│   ├── InstallPage.tsx
│   └── SettingsPage.tsx
├── stores/
│   ├── skillStore.ts            # 扩展
│   ├── mcpStore.ts
│   ├── dashboardStore.ts        # 新增
│   ├── marketplaceStore.ts      # 新增
│   ├── tagStore.ts              # 新增
│   ├── toastStore.ts
│   └── toolStore.ts
└── types/
    └── index.ts                 # 扩展
```

---

## 八、竞品灵感来源索引

| AetherDock 功能 | 主要灵感来源 | 次要灵感来源 |
|-----------------|-------------|-------------|
| 仪表盘统计卡片 | Skiller OverviewPage | Skills-Dock stats |
| 卡片画廊视图 | SkillsHub SkillCard | PromptHub SkillGalleryCard |
| 标签树导航 | Skiller SimpleTagTree | - |
| 技能详情抽屉 | Skiller SkillDetailDrawer | PromptHub SkillFullDetailPage |
| 技能商店 | PromptHub SkillStore | skills-manager ExplorePanel |
| AI 推荐 | skills-manager RecommendPanel | - |
| 批量操作 | Skills-Dock batch | PromptHub SkillBatchDeployDialog |
| 技能图标系统 | PromptHub SkillIcon | - |
| 本地扫描 | PromptHub scanLocalPreview | - |
| 版本快照 | PromptHub VersionHistoryModal | - |
| 自定义来源 | PromptHub SkillStoreCustomSources | Skiller RepositoryManagement |
| 视图切换 | PromptHub viewMode | Skiller ViewToggle |
| 排序下拉 | Skiller SortDropdown | - |
| NPX 安装 | Skiller NpxFindDialog | - |
| 活动时间线 | Skills-Dock activities | - |
| AI 翻译 | PromptHub AI Translation | - |
| 安全扫描 | PromptHub SafetyScan | - |
| 项目管理 | Skiller ProjectsPage | PromptHub SkillProjectsView |
