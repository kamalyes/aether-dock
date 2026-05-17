package repository

import (
	"aether-dock/backend/constants"
	"aether-dock/backend/models"

	"gorm.io/gorm"
)

type ToolRepository struct {
	db *gorm.DB
}

func NewToolRepository(db *gorm.DB) *ToolRepository {
	return &ToolRepository{db: db}
}

func (r *ToolRepository) List() ([]models.ToolConfig, error) {
	var tools []models.ToolConfig
	if err := r.db.Order("display_name ASC").Find(&tools).Error; err != nil {
		return nil, err
	}
	return tools, nil
}

func (r *ToolRepository) GetByToolName(name constants.ToolName) (*models.ToolConfig, error) {
	var tool models.ToolConfig
	if err := r.db.First(&tool, "tool_name = ?", name).Error; err != nil {
		return nil, err
	}
	return &tool, nil
}

func (r *ToolRepository) Create(tool *models.ToolConfig) error {
	return r.db.Create(tool).Error
}

func (r *ToolRepository) Update(tool *models.ToolConfig) error {
	return r.db.Save(tool).Error
}

func (r *ToolRepository) Upsert(tool *models.ToolConfig) error {
	return r.db.Where("tool_name = ?", tool.ToolName).FirstOrCreate(tool).Error
}

func (r *ToolRepository) Delete(id string) error {
	return r.db.Delete(&models.ToolConfig{}, "id = ?", id).Error
}

func (r *ToolRepository) ListDetected() ([]models.ToolConfig, error) {
	var tools []models.ToolConfig
	if err := r.db.Where("is_detected = ?", true).Order("display_name ASC").Find(&tools).Error; err != nil {
		return nil, err
	}
	return tools, nil
}
