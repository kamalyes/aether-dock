package errors

type AppError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (e *AppError) Error() string {
	return e.Message
}

func New(code, message string) *AppError {
	return &AppError{Code: code, Message: message}
}

var (
	ErrSkillNotFound       = New("SKILL_NOT_FOUND", "Skill not found")
	ErrSkillAlreadyExists  = New("SKILL_ALREADY_EXISTS", "Skill already exists")
	ErrSkillInstallFailed  = New("SKILL_INSTALL_FAILED", "Skill installation failed")
	ErrSkillUpdateFailed   = New("SKILL_UPDATE_FAILED", "Skill update failed")
	ErrSkillDeleteFailed   = New("SKILL_DELETE_FAILED", "Skill delete failed")
	ErrMcpNotFound         = New("MCP_NOT_FOUND", "MCP server not found")
	ErrMcpAlreadyExists    = New("MCP_ALREADY_EXISTS", "MCP server already exists")
	ErrMcpConfigInvalid    = New("MCP_CONFIG_INVALID", "MCP server configuration invalid")
	ErrToolNotDetected     = New("TOOL_NOT_DETECTED", "Tool not detected on system")
	ErrToolSyncFailed      = New("TOOL_SYNC_FAILED", "Tool sync failed")
	ErrGitOperationFailed  = New("GIT_OPERATION_FAILED", "Git operation failed")
	ErrGitRepoNotFound     = New("GIT_REPO_NOT_FOUND", "Git repository not found")
	ErrSourceNotFound      = New("SOURCE_NOT_FOUND", "Source group not found")
	ErrDatabaseInitFailed  = New("DATABASE_INIT_FAILED", "Database initialization failed")
	ErrConfigLoadFailed    = New("CONFIG_LOAD_FAILED", "Configuration load failed")
	ErrInvalidInput        = New("INVALID_INPUT", "Invalid input parameter")
	ErrMarketplaceUnavail  = New("MARKETPLACE_UNAVAILABLE", "Marketplace service unavailable")
)
