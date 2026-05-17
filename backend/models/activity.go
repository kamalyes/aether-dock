package models

type Activity struct {
	BaseModel
	Type       string `gorm:"size:50;not null" json:"type"`
	TargetName string `gorm:"size:255" json:"targetName"`
	TargetType string `gorm:"size:50" json:"targetType"`
	ToolName   string `gorm:"size:100" json:"toolName,omitempty"`
	Detail     string `gorm:"size:500" json:"detail,omitempty"`
}
