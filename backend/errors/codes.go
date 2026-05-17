package errors

var ErrorCodes = map[string]string{
	"SKILL_NOT_FOUND":         "技能未找到",
	"SKILL_ALREADY_EXISTS":    "技能已存在",
	"SKILL_INSTALL_FAILED":    "技能安装失败",
	"SKILL_UPDATE_FAILED":     "技能更新失败",
	"SKILL_DELETE_FAILED":     "技能删除失败",
	"MCP_NOT_FOUND":           "MCP 服务器未找到",
	"MCP_ALREADY_EXISTS":      "MCP 服务器已存在",
	"MCP_CONFIG_INVALID":      "MCP 服务器配置无效",
	"TOOL_NOT_DETECTED":       "未检测到工具",
	"TOOL_SYNC_FAILED":        "工具同步失败",
	"GIT_OPERATION_FAILED":    "Git 操作失败",
	"GIT_REPO_NOT_FOUND":      "Git 仓库未找到",
	"SOURCE_NOT_FOUND":        "源分组未找到",
	"DATABASE_INIT_FAILED":    "数据库初始化失败",
	"CONFIG_LOAD_FAILED":      "配置加载失败",
	"INVALID_INPUT":           "输入参数无效",
	"MARKETPLACE_UNAVAILABLE": "市场服务不可用",
}
