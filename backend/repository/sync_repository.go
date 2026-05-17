package repository

import (
	"aether-dock/backend/models"

	"gorm.io/gorm"
)

type SyncRepository struct {
	db *gorm.DB
}

func NewSyncRepository(db *gorm.DB) *SyncRepository {
	return &SyncRepository{db: db}
}

func (r *SyncRepository) Create(record *models.SyncRecord) error {
	return r.db.Create(record).Error
}

func (r *SyncRepository) ListByItem(itemType, itemID string) ([]models.SyncRecord, error) {
	var records []models.SyncRecord
	if err := r.db.Where("item_type = ? AND item_id = ?", itemType, itemID).Order("created_at DESC").Find(&records).Error; err != nil {
		return nil, err
	}
	return records, nil
}

func (r *SyncRepository) ListByTool(toolName string) ([]models.SyncRecord, error) {
	var records []models.SyncRecord
	if err := r.db.Where("tool_name = ?", toolName).Order("created_at DESC").Limit(100).Find(&records).Error; err != nil {
		return nil, err
	}
	return records, nil
}

func (r *SyncRepository) DeleteByItem(itemType, itemID string) error {
	return r.db.Where("item_type = ? AND item_id = ?", itemType, itemID).Delete(&models.SyncRecord{}).Error
}
