package service

import (
	"aether-dock/backend/constants"
	"aether-dock/backend/errors"
	"aether-dock/backend/models"
	"aether-dock/backend/repository"
)

type SourceService struct {
	repo *repository.RepositoryFactory
}

func NewSourceService(repo *repository.RepositoryFactory) *SourceService {
	return &SourceService{repo: repo}
}

func (s *SourceService) List() ([]models.SkillSource, error) {
	return s.repo.Source.List()
}

func (s *SourceService) GetByID(id string) (*models.SkillSource, error) {
	source, err := s.repo.Source.GetByID(id)
	if err != nil {
		return nil, errors.ErrSourceNotFound
	}
	return source, nil
}

type CreateSourceRequest struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	URL         string `json:"url"`
	Branch      string `json:"branch"`
	LocalPath   string `json:"localPath"`
	Description string `json:"description"`
}

func (s *SourceService) Create(req CreateSourceRequest) (*models.SkillSource, error) {
	source := &models.SkillSource{
		Name:        req.Name,
		Type:        constants.SkillSourceType(req.Type),
		URL:         req.URL,
		Branch:      req.Branch,
		LocalPath:   req.LocalPath,
		Description: req.Description,
	}
	if err := s.repo.Source.Create(source); err != nil {
		return nil, err
	}
	return source, nil
}

func (s *SourceService) Delete(id string) error {
	return s.repo.Source.Delete(id)
}
