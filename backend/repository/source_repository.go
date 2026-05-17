package repository

import (
	"aether-dock/backend/models"

	"gorm.io/gorm"
)

type SourceRepository struct {
	db *gorm.DB
}

func NewSourceRepository(db *gorm.DB) *SourceRepository {
	return &SourceRepository{db: db}
}

func (r *SourceRepository) List() ([]models.SkillSource, error) {
	var sources []models.SkillSource
	if err := r.db.Preload("Skills").Order("updated_at DESC").Find(&sources).Error; err != nil {
		return nil, err
	}
	return sources, nil
}

func (r *SourceRepository) GetByID(id string) (*models.SkillSource, error) {
	var source models.SkillSource
	if err := r.db.Preload("Skills").First(&source, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &source, nil
}

func (r *SourceRepository) Create(source *models.SkillSource) error {
	return r.db.Create(source).Error
}

func (r *SourceRepository) Update(source *models.SkillSource) error {
	return r.db.Save(source).Error
}

func (r *SourceRepository) Delete(id string) error {
	return r.db.Select("Skills").Delete(&models.SkillSource{}, "id = ?", id).Error
}

func (r *SourceRepository) GetByURL(url string) (*models.SkillSource, error) {
	var source models.SkillSource
	if err := r.db.First(&source, "url = ?", url).Error; err != nil {
		return nil, err
	}
	return &source, nil
}
