package service

import (
	"aether-dock/backend/constants"
	"aether-dock/backend/models"
	"aether-dock/backend/repository"
	"os"
	"path/filepath"
)

type ToolService struct {
	repo *repository.RepositoryFactory
}

func NewToolService(repo *repository.RepositoryFactory) *ToolService {
	return &ToolService{repo: repo}
}

func (s *ToolService) DetectAllTools() ([]models.ToolConfig, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	for _, toolInfo := range constants.SupportedTools {
		configPath := filepath.Join(homeDir, toolInfo.McpConfigFile)
		skillDir := filepath.Join(homeDir, toolInfo.SkillDir)

		isDetected := dirExists(skillDir) || fileExists(configPath)

		toolConfig := &models.ToolConfig{
			ToolName:    toolInfo.Name,
			DisplayName: toolInfo.DisplayName,
			ConfigPath:  configPath,
			SkillDir:    skillDir,
			McpDir:      configPath,
			IsDetected:  isDetected,
			IsEnabled:   isDetected,
		}

		s.repo.Tool.Upsert(toolConfig)
	}

	return s.repo.Tool.List()
}

func (s *ToolService) List() ([]models.ToolConfig, error) {
	return s.repo.Tool.List()
}

func (s *ToolService) ListDetected() ([]models.ToolConfig, error) {
	return s.repo.Tool.ListDetected()
}

func (s *ToolService) GetByToolName(name constants.ToolName) (*models.ToolConfig, error) {
	return s.repo.Tool.GetByToolName(name)
}

func (s *ToolService) EnableTool(name constants.ToolName) error {
	tool, err := s.repo.Tool.GetByToolName(name)
	if err != nil {
		return err
	}
	tool.IsEnabled = true
	return s.repo.Tool.Update(tool)
}

func (s *ToolService) DisableTool(name constants.ToolName) error {
	tool, err := s.repo.Tool.GetByToolName(name)
	if err != nil {
		return err
	}
	tool.IsEnabled = false
	return s.repo.Tool.Update(tool)
}

func dirExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return info.IsDir()
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !info.IsDir()
}
