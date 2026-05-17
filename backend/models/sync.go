package models

type SyncRecord struct {
	BaseModel
	ItemType string `gorm:"size:32;not null;index" json:"itemType"`
	ItemID   string `gorm:"size:32;not null;index" json:"itemId"`
	ToolName string `gorm:"size:64;not null;index" json:"toolName"`
	Action   string `gorm:"size:32;not null" json:"action"`
	Status   string `gorm:"size:32;not null;index" json:"status"`
	Error    string `gorm:"type:text" json:"error"`
}

func (SyncRecord) TableName() string {
	return "sync_records"
}
