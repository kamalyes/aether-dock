package constants

type ToolName string

const (
	ToolClaudeCode    ToolName = "claude_code"
	ToolCodex         ToolName = "codex"
	ToolCursor        ToolName = "cursor"
	ToolWindsurf      ToolName = "windsurf"
	ToolIntelliJ      ToolName = "intellij"
	ToolOpenCode      ToolName = "opencode"
	ToolGemini        ToolName = "gemini"
	ToolAntigravity   ToolName = "antigravity"
	ToolContinue      ToolName = "continue"
	ToolGitHubCopilot ToolName = "github_copilot"
	ToolQwenCode      ToolName = "qwen_code"
	ToolTrae          ToolName = "trae"
	ToolTraeCN        ToolName = "trae_cn"
	ToolCline         ToolName = "cline"
	ToolRooCode       ToolName = "roo_code"
	ToolKiloCode      ToolName = "kilo_code"
	ToolKiro          ToolName = "kiro"
	ToolGoose         ToolName = "goose"
	ToolJunie         ToolName = "junie"
	ToolAugment       ToolName = "augment"
	ToolCodeBuddy     ToolName = "codebuddy"
	ToolDroid         ToolName = "droid"
	ToolOpenClaw      ToolName = "openclaw"
	ToolCommandCode   ToolName = "commandcode"
	ToolCrush         ToolName = "crush"
	ToolQoder         ToolName = "qoder"
	ToolZencoder      ToolName = "zencoder"
	ToolHermes        ToolName = "hermes"
	ToolIFlow         ToolName = "iflow"
)

type ToolConfigInfo struct {
	Name           ToolName
	DisplayName    string
	SkillDir       string
	McpConfigFile  string
	ConfigDetector func(homeDir string) string
}

var SupportedTools = []ToolConfigInfo{
	{
		Name:          ToolClaudeCode,
		DisplayName:   "Claude Code",
		SkillDir:      ".claude/",
		McpConfigFile: ".claude/mcp.json",
	},
	{
		Name:          ToolCodex,
		DisplayName:   "Codex",
		SkillDir:      ".codex/",
		McpConfigFile: ".codex/mcp.json",
	},
	{
		Name:          ToolCursor,
		DisplayName:   "Cursor",
		SkillDir:      ".cursor/rules/",
		McpConfigFile: ".cursor/mcp.json",
	},
	{
		Name:          ToolWindsurf,
		DisplayName:   "Windsurf",
		SkillDir:      ".windsurf/rules/",
		McpConfigFile: ".windsurf/mcp.json",
	},
	{
		Name:          ToolTrae,
		DisplayName:   "Trae",
		SkillDir:      ".trae/rules/",
		McpConfigFile: ".trae/mcp.json",
	},
	{
		Name:          ToolTraeCN,
		DisplayName:   "Trae CN",
		SkillDir:      ".trae-cn/rules/",
		McpConfigFile: ".trae-cn/mcp.json",
	},
	{
		Name:          ToolCline,
		DisplayName:   "Cline",
		SkillDir:      ".cline/rules/",
		McpConfigFile: ".cline/mcp.json",
	},
	{
		Name:          ToolGemini,
		DisplayName:   "Gemini CLI",
		SkillDir:      ".gemini/",
		McpConfigFile: ".gemini/mcp.json",
	},
	{
		Name:          ToolGitHubCopilot,
		DisplayName:   "GitHub Copilot",
		SkillDir:      ".github/copilot/",
		McpConfigFile: ".github/copilot/mcp.json",
	},
	{
		Name:          ToolKiro,
		DisplayName:   "Kiro",
		SkillDir:      ".kiro/",
		McpConfigFile: ".kiro/mcp.json",
	},
}
