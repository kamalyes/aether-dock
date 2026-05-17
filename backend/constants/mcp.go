package constants

type McpServerStatus string

const (
	McpServerEnabled  McpServerStatus = "enabled"
	McpServerDisabled McpServerStatus = "disabled"
	McpServerError    McpServerStatus = "error"
)

type McpSourceType string

const (
	McpSourceMarketplace McpSourceType = "marketplace"
	McpSourceManual      McpSourceType = "manual"
	McpSourceImport      McpSourceType = "import"
)
