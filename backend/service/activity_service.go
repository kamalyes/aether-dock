package service

import (
	"aether-dock/backend/models"
	"aether-dock/backend/repository"
)

type ActivityService struct {
	repo *repository.RepositoryFactory
}

func NewActivityService(repo *repository.RepositoryFactory) *ActivityService {
	return &ActivityService{repo: repo}
}

func (s *ActivityService) Record(activityType, targetName, targetType, toolName, detail string) error {
	activity := &models.Activity{
		Type:       activityType,
		TargetName: targetName,
		TargetType: targetType,
		ToolName:   toolName,
		Detail:     detail,
	}
	return s.repo.Activity.Create(activity)
}

func (s *ActivityService) ListRecent(limit int) ([]models.Activity, error) {
	return s.repo.Activity.ListRecent(limit)
}
