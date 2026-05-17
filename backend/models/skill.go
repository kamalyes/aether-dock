package models

import (
	"aether-dock/backend/constants"
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

type Skill struct {
	BaseModel
	Name         string                `gorm:"size:255;not null;index" json:"name"`
	Description  string                `gorm:"size:1024" json:"description"`
	Version      string                `gorm:"size:64" json:"version"`
	SourceID     string                `gorm:"size:32;index" json:"sourceId"`
	InstallPath  string                `gorm:"size:1024" json:"installPath"`
	GitURL       string                `gorm:"size:1024" json:"gitUrl"`
	GitBranch    string                `gorm:"size:255" json:"gitBranch"`
	GitCommit    string                `gorm:"size:64" json:"gitCommit"`
	Status       constants.SkillStatus `gorm:"size:32;index;default:'installed'" json:"status"`
	EnabledTools StringList            `gorm:"type:text" json:"enabledTools"`
	Tags         StringList            `gorm:"type:text" json:"tags"`
	Metadata     JSONMap               `gorm:"type:text" json:"metadata"`
	Source       *SkillSource          `gorm:"foreignKey:SourceID" json:"source,omitempty"`
}

func (Skill) TableName() string {
	return "skills"
}

type SkillSource struct {
	BaseModel
	Name        string                    `gorm:"size:255;not null;index" json:"name"`
	Type        constants.SkillSourceType `gorm:"size:32;not null;index" json:"type"`
	URL         string                    `gorm:"size:1024" json:"url"`
	Branch      string                    `gorm:"size:255" json:"branch"`
	LocalPath   string                    `gorm:"size:1024" json:"localPath"`
	Description string                    `gorm:"size:1024" json:"description"`
	Skills      []Skill                   `gorm:"foreignKey:SourceID" json:"skills,omitempty"`
}

func (SkillSource) TableName() string {
	return "skill_sources"
}

type StringList []string

func (s StringList) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	data, err := json.Marshal(s)
	if err != nil {
		return nil, err
	}
	return string(data), nil
}

func (s *StringList) Scan(value interface{}) error {
	if value == nil {
		*s = StringList{}
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case string:
		bytes = []byte(v)
	case []byte:
		bytes = v
	default:
		return fmt.Errorf("failed to unmarshal StringList value: %v", value)
	}
	return json.Unmarshal(bytes, s)
}

type JSONMap map[string]interface{}

func (j JSONMap) Value() (driver.Value, error) {
	if j == nil {
		return "{}", nil
	}
	data, err := json.Marshal(j)
	if err != nil {
		return nil, err
	}
	return string(data), nil
}

func (j *JSONMap) Scan(value interface{}) error {
	if value == nil {
		*j = JSONMap{}
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case string:
		bytes = []byte(v)
	case []byte:
		bytes = v
	default:
		return fmt.Errorf("failed to unmarshal JSONMap value: %v", value)
	}
	return json.Unmarshal(bytes, j)
}
