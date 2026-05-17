package models

import "aether-dock/backend/constants"

type ToolConfig struct {
	BaseModel
	ToolName    constants.ToolName `gorm:"size:64;not null;uniqueIndex" json:"toolName"`
	DisplayName string             `gorm:"size:255;not null" json:"displayName"`
	ConfigPath  string             `gorm:"size:1024" json:"configPath"`
	SkillDir    string             `gorm:"size:1024" json:"skillDir"`
	McpDir      string             `gorm:"size:1024" json:"mcpDir"`
	IsDetected  bool               `gorm:"default:false" json:"isDetected"`
	IsEnabled   bool               `gorm:"default:true" json:"isEnabled"`
}

func (ToolConfig) TableName() string {
	return "tool_configs"
}
