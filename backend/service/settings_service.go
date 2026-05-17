package service

import (
	"aether-dock/backend/repository"
)

type SettingsService struct {
	repo *repository.RepositoryFactory
}

func NewSettingsService(repo *repository.RepositoryFactory) *SettingsService {
	return &SettingsService{repo: repo}
}

func (s *SettingsService) Get(key string) (string, error) {
	return s.repo.Setting.Get(key)
}

func (s *SettingsService) Set(key, value string) error {
	return s.repo.Setting.Set(key, value)
}

func (s *SettingsService) GetAll() (map[string]string, error) {
	return s.repo.Setting.GetAll()
}

func (s *SettingsService) Delete(key string) error {
	return s.repo.Setting.Delete(key)
}

func (s *SettingsService) InitDefaults() error {
	defaults := map[string]string{
		"app.language":             "auto",
		"app.theme":                "dark",
		"app.dataDir":              "",
		"app.defaultEditor":        "",
		"app.checkUpdates":         "true",
		"install.autoSync":         "true",
		"install.defaultGitBranch": "main",
	}
	for k, v := range defaults {
		existing, err := s.repo.Setting.Get(k)
		if err != nil || existing == "" {
			s.repo.Setting.Set(k, v)
		}
	}
	return nil
}

func (s *SettingsService) ResetAll() error {
	defaults := map[string]string{
		"app.language":             "auto",
		"app.theme":                "dark",
		"app.dataDir":              "",
		"app.defaultEditor":        "",
		"app.checkUpdates":         "true",
		"install.autoSync":         "true",
		"install.defaultGitBranch": "main",
	}
	for k, v := range defaults {
		if err := s.repo.Setting.Set(k, v); err != nil {
			return err
		}
	}
	return nil
}
