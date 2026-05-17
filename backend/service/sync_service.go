package service

import (
	"aether-dock/backend/constants"
	"aether-dock/backend/models"
	"aether-dock/backend/repository"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

type SyncService struct {
	repo *repository.RepositoryFactory
}

func NewSyncService(repo *repository.RepositoryFactory) *SyncService {
	return &SyncService{repo: repo}
}

func (s *SyncService) SyncSkillToTool(skillID string, toolName constants.ToolName) error {
	skill, err := s.repo.Skill.GetByID(skillID)
	if err != nil {
		return err
	}

	tool, err := s.repo.Tool.GetByToolName(toolName)
	if err != nil {
		return fmt.Errorf("tool %s not configured", toolName)
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	targetDir := filepath.Join(homeDir, tool.SkillDir)
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return fmt.Errorf("failed to create target directory: %w", err)
	}

	sourcePath := skill.InstallPath
	targetPath := filepath.Join(targetDir, skill.Name)

	if runtime.GOOS == "windows" {
		return s.createJunction(sourcePath, targetPath)
	}
	return os.Symlink(sourcePath, targetPath)
}

func (s *SyncService) UnsyncSkillFromTool(skillID string, toolName constants.ToolName) error {
	skill, err := s.repo.Skill.GetByID(skillID)
	if err != nil {
		return err
	}

	tool, err := s.repo.Tool.GetByToolName(toolName)
	if err != nil {
		return fmt.Errorf("tool %s not configured", toolName)
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	targetPath := filepath.Join(homeDir, tool.SkillDir, skill.Name)
	if runtime.GOOS == "windows" {
		return s.removeJunction(targetPath)
	}

	linkInfo, err := os.Lstat(targetPath)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	if linkInfo != nil && linkInfo.Mode()&os.ModeSymlink != 0 {
		return os.Remove(targetPath)
	}
	return nil
}

func (s *SyncService) SyncMcpToTool(serverID string, toolName constants.ToolName) error {
	server, err := s.repo.Mcp.GetServerByID(serverID)
	if err != nil {
		return err
	}

	tool, err := s.repo.Tool.GetByToolName(toolName)
	if err != nil {
		return fmt.Errorf("tool %s not configured", toolName)
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	mcpDir := filepath.Join(homeDir, tool.McpDir)
	return s.writeMcpConfig(mcpDir, server)
}

func (s *SyncService) UnsyncMcpFromTool(serverID string, toolName constants.ToolName) error {
	server, err := s.repo.Mcp.GetServerByID(serverID)
	if err != nil {
		return err
	}

	tool, err := s.repo.Tool.GetByToolName(toolName)
	if err != nil {
		return fmt.Errorf("tool %s not configured", toolName)
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	mcpDir := filepath.Join(homeDir, tool.McpDir)
	return s.removeMcpConfig(mcpDir, server.Name)
}

func (s *SyncService) SyncAllSkills() error {
	tools, err := s.repo.Tool.ListDetected()
	if err != nil {
		return err
	}

	skills, _, err := s.repo.Skill.List(0, 1000, "", "")
	if err != nil {
		return err
	}

	for _, skill := range skills {
		for _, tool := range tools {
			for _, enabledTool := range skill.EnabledTools {
				if string(tool.ToolName) == enabledTool {
					s.SyncSkillToTool(skill.ID, tool.ToolName)
				}
			}
		}
	}
	return nil
}

func (s *SyncService) SyncAllMcp() error {
	tools, err := s.repo.Tool.ListDetected()
	if err != nil {
		return err
	}

	servers, _, err := s.repo.Mcp.ListServers(0, 1000, "")
	if err != nil {
		return err
	}

	for _, server := range servers {
		for _, tool := range tools {
			for _, enabledTool := range server.EnabledTools {
				if string(tool.ToolName) == enabledTool {
					s.SyncMcpToTool(server.ID, tool.ToolName)
				}
			}
		}
	}
	return nil
}

func (s *SyncService) writeMcpConfig(configPath string, server *models.McpServer) error {
	var existingConfig map[string]interface{}

	data, err := os.ReadFile(configPath)
	if err == nil {
		json.Unmarshal(data, &existingConfig)
	}
	if existingConfig == nil {
		existingConfig = make(map[string]interface{})
	}

	mcpServers, ok := existingConfig["mcpServers"].(map[string]interface{})
	if !ok {
		mcpServers = make(map[string]interface{})
	}

	serverConfig := map[string]interface{}{
		"command": server.Command,
	}
	if len(server.Args) > 0 {
		serverConfig["args"] = server.Args
	}
	if len(server.Env) > 0 {
		serverConfig["env"] = server.Env
	}

	mcpServers[server.Name] = serverConfig
	existingConfig["mcpServers"] = mcpServers

	dir := filepath.Dir(configPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	updated, err := json.MarshalIndent(existingConfig, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(configPath, updated, 0644)
}

func (s *SyncService) removeMcpConfig(configPath string, serverName string) error {
	data, err := os.ReadFile(configPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	var existingConfig map[string]interface{}
	if err := json.Unmarshal(data, &existingConfig); err != nil {
		return err
	}

	mcpServers, ok := existingConfig["mcpServers"].(map[string]interface{})
	if !ok {
		return nil
	}

	delete(mcpServers, serverName)
	existingConfig["mcpServers"] = mcpServers

	updated, err := json.MarshalIndent(existingConfig, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(configPath, updated, 0644)
}

func (s *SyncService) createJunction(source, target string) error {
	os.RemoveAll(target)
	dir := filepath.Dir(target)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	return os.Symlink(source, target)
}

func (s *SyncService) removeJunction(target string) error {
	info, err := os.Lstat(target)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	if info.IsDir() {
		return os.Remove(target)
	}
	return os.Remove(target)
}
