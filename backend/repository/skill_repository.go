package repository

import (
	"aether-dock/backend/constants"
	"aether-dock/backend/models"

	"gorm.io/gorm"
)

type SkillRepository struct {
	db *gorm.DB
}

func NewSkillRepository(db *gorm.DB) *SkillRepository {
	return &SkillRepository{db: db}
}

func (r *SkillRepository) List(offset, limit int, status constants.SkillStatus, sourceID string) ([]models.Skill, int64, error) {
	var skills []models.Skill
	var total int64
	query := r.db.Model(&models.Skill{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if sourceID != "" {
		query = query.Where("source_id = ?", sourceID)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Preload("Source").Offset(offset).Limit(limit).Order("updated_at DESC").Find(&skills).Error; err != nil {
		return nil, 0, err
	}
	return skills, total, nil
}

func (r *SkillRepository) GetByID(id string) (*models.Skill, error) {
	var skill models.Skill
	if err := r.db.Preload("Source").First(&skill, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &skill, nil
}

func (r *SkillRepository) GetByName(name string) (*models.Skill, error) {
	var skill models.Skill
	if err := r.db.Preload("Source").First(&skill, "name = ?", name).Error; err != nil {
		return nil, err
	}
	return &skill, nil
}

func (r *SkillRepository) Create(skill *models.Skill) error {
	return r.db.Create(skill).Error
}

func (r *SkillRepository) Update(skill *models.Skill) error {
	return r.db.Save(skill).Error
}

func (r *SkillRepository) Delete(id string) error {
	return r.db.Delete(&models.Skill{}, "id = ?", id).Error
}

func (r *SkillRepository) ListBySource(sourceID string) ([]models.Skill, error) {
	var skills []models.Skill
	if err := r.db.Where("source_id = ?", sourceID).Find(&skills).Error; err != nil {
		return nil, err
	}
	return skills, nil
}

func (r *SkillRepository) ListByTool(toolName string) ([]models.Skill, error) {
	var skills []models.Skill
	if err := r.db.Where("enabled_tools LIKE ?", "%\""+toolName+"\"%").Find(&skills).Error; err != nil {
		return nil, err
	}
	return skills, nil
}

func (r *SkillRepository) UpdateStatus(id string, status constants.SkillStatus) error {
	return r.db.Model(&models.Skill{}).Where("id = ?", id).Update("status", status).Error
}

func (r *SkillRepository) UpdateGitInfo(id string, commit string) error {
	return r.db.Model(&models.Skill{}).Where("id = ?", id).Update("git_commit", commit).Error
}
