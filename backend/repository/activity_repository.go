package repository

import (
	"aether-dock/backend/models"

	"gorm.io/gorm"
)

type ActivityRepository struct {
	db *gorm.DB
}

func NewActivityRepository(db *gorm.DB) *ActivityRepository {
	return &ActivityRepository{db: db}
}

func (r *ActivityRepository) Create(activity *models.Activity) error {
	return r.db.Create(activity).Error
}

func (r *ActivityRepository) ListRecent(limit int) ([]models.Activity, error) {
	var activities []models.Activity
	if limit <= 0 {
		limit = 20
	}
	err := r.db.Order("created_at DESC").Limit(limit).Find(&activities).Error
	return activities, err
}
