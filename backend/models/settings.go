package models

type Settings struct {
	BaseModel
	Key   string `gorm:"size:255;not null;uniqueIndex" json:"key"`
	Value string `gorm:"type:text" json:"value"`
}

func (Settings) TableName() string {
	return "settings"
}
