package repository

import (
	"aether-dock/backend/models"

	"gorm.io/gorm"
)

type SettingsRepository struct {
	db *gorm.DB
}

func NewSettingsRepository(db *gorm.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

func (r *SettingsRepository) Get(key string) (string, error) {
	var setting models.Settings
	if err := r.db.First(&setting, "key = ?", key).Error; err != nil {
		return "", err
	}
	return setting.Value, nil
}

func (r *SettingsRepository) Set(key, value string) error {
	var setting models.Settings
	result := r.db.Where("key = ?", key).First(&setting)
	if result.Error == gorm.ErrRecordNotFound {
		setting = models.Settings{Key: key, Value: value}
		return r.db.Create(&setting).Error
	}
	if result.Error != nil {
		return result.Error
	}
	setting.Value = value
	return r.db.Save(&setting).Error
}

func (r *SettingsRepository) GetAll() (map[string]string, error) {
	var settings []models.Settings
	if err := r.db.Find(&settings).Error; err != nil {
		return nil, err
	}
	result := make(map[string]string, len(settings))
	for _, s := range settings {
		result[s.Key] = s.Value
	}
	return result, nil
}

func (r *SettingsRepository) Delete(key string) error {
	return r.db.Where("key = ?", key).Delete(&models.Settings{}).Error
}
