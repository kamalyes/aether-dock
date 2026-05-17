package models

import (
	"aether-dock/backend/constants"
)

type McpServer struct {
	BaseModel
	Name         string                    `gorm:"size:255;not null;index" json:"name"`
	Description  string                    `gorm:"size:1024" json:"description"`
	Command      string                    `gorm:"size:1024;not null" json:"command"`
	Args         StringList                `gorm:"type:text" json:"args"`
	Env          JSONMap                   `gorm:"type:text" json:"env"`
	SourceType   constants.McpSourceType   `gorm:"size:32;index" json:"sourceType"`
	SourceURL    string                    `gorm:"size:1024" json:"sourceUrl"`
	EnabledTools StringList                `gorm:"type:text" json:"enabledTools"`
	Status       constants.McpServerStatus `gorm:"size:32;index;default:'enabled'" json:"status"`
	Tools        []McpTool                 `gorm:"foreignKey:ServerID" json:"tools,omitempty"`
}

func (McpServer) TableName() string {
	return "mcp_servers"
}

type McpTool struct {
	BaseModel
	ServerID    string     `gorm:"size:32;index;not null" json:"serverId"`
	Name        string     `gorm:"size:255;not null;index" json:"name"`
	Description string     `gorm:"size:1024" json:"description"`
	InputSchema JSONMap    `gorm:"type:text" json:"inputSchema"`
	Server      *McpServer `gorm:"foreignKey:ServerID" json:"server,omitempty"`
}

func (McpTool) TableName() string {
	return "mcp_tools"
}
