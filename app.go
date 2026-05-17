package main

import (
	"aether-dock/backend/bootstrap"
	"aether-dock/backend/constants"
	"aether-dock/backend/errors"
	"aether-dock/backend/service"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	goruntime "runtime"

	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
	bs  *bootstrap.AppBootstrap
}

func NewApp() *App {
	return &App{
		bs: bootstrap.NewAppBootstrap(),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	if err := a.bs.Init(); err != nil {
		fmt.Printf("Bootstrap failed: %v\n", err)
	}
}

func (a *App) GetAppInfo() map[string]interface{} {
	return map[string]interface{}{
		"name":    constants.AppName,
		"version": constants.AppVersion,
	}
}

func (a *App) ListSkills(page, pageSize int, status, sourceID string) string {
	result, err := a.bs.Skills.List(page, pageSize, constants.SkillStatus(status), sourceID)
	return jsonResponse(result, err)
}

func (a *App) GetSkill(id string) string {
	result, err := a.bs.Skills.GetByID(id)
	return jsonResponse(result, err)
}

func (a *App) InstallSkillFromGit(jsonReq string) string {
	var req service.InstallFromGitRequest
	if err := json.Unmarshal([]byte(jsonReq), &req); err != nil {
		return jsonResponse(nil, errors.ErrInvalidInput)
	}
	result, err := a.bs.Skills.InstallFromGit(req)
	return jsonResponse(result, err)
}

func (a *App) InstallSkillFromLocal(jsonReq string) string {
	var req service.InstallFromLocalRequest
	if err := json.Unmarshal([]byte(jsonReq), &req); err != nil {
		return jsonResponse(nil, errors.ErrInvalidInput)
	}
	result, err := a.bs.Skills.InstallFromLocal(req)
	return jsonResponse(result, err)
}

func (a *App) DeleteSkill(id string) string {
	err := a.bs.Skills.Delete(id)
	return jsonResponse(nil, err)
}

func (a *App) EnableSkillForTool(id, toolName string) string {
	err := a.bs.Skills.EnableForTool(id, toolName)
	return jsonResponse(nil, err)
}

func (a *App) DisableSkillForTool(id, toolName string) string {
	err := a.bs.Skills.DisableForTool(id, toolName)
	return jsonResponse(nil, err)
}

func (a *App) ListSources() string {
	result, err := a.bs.Sources.List()
	return jsonResponse(result, err)
}

func (a *App) CreateSource(jsonReq string) string {
	var req service.CreateSourceRequest
	if err := json.Unmarshal([]byte(jsonReq), &req); err != nil {
		return jsonResponse(nil, errors.ErrInvalidInput)
	}
	result, err := a.bs.Sources.Create(req)
	return jsonResponse(result, err)
}

func (a *App) DeleteSource(id string) string {
	err := a.bs.Sources.Delete(id)
	return jsonResponse(nil, err)
}

func (a *App) ListMcpServers(page, pageSize int, status string) string {
	result, err := a.bs.Mcp.ListServers(page, pageSize, constants.McpServerStatus(status))
	return jsonResponse(result, err)
}

func (a *App) GetMcpServer(id string) string {
	result, err := a.bs.Mcp.GetServerByID(id)
	return jsonResponse(result, err)
}

func (a *App) AddMcpServer(jsonReq string) string {
	var req service.AddMcpServerRequest
	if err := json.Unmarshal([]byte(jsonReq), &req); err != nil {
		return jsonResponse(nil, errors.ErrInvalidInput)
	}
	result, err := a.bs.Mcp.AddServer(req)
	return jsonResponse(result, err)
}

func (a *App) UpdateMcpServer(id, jsonReq string) string {
	var req service.AddMcpServerRequest
	if err := json.Unmarshal([]byte(jsonReq), &req); err != nil {
		return jsonResponse(nil, errors.ErrInvalidInput)
	}
	result, err := a.bs.Mcp.UpdateServer(id, req)
	return jsonResponse(result, err)
}

func (a *App) DeleteMcpServer(id string) string {
	err := a.bs.Mcp.DeleteServer(id)
	return jsonResponse(nil, err)
}

func (a *App) EnableMcpForTool(id, toolName string) string {
	err := a.bs.Mcp.EnableForTool(id, toolName)
	return jsonResponse(nil, err)
}

func (a *App) DisableMcpForTool(id, toolName string) string {
	err := a.bs.Mcp.DisableForTool(id, toolName)
	return jsonResponse(nil, err)
}

func (a *App) DiscoverMcpTools(id string) string {
	result, err := a.bs.Mcp.DiscoverTools(id)
	return jsonResponse(result, err)
}

func (a *App) ListTools() string {
	result, err := a.bs.Tools.List()
	return jsonResponse(result, err)
}

func (a *App) DetectTools() string {
	result, err := a.bs.Tools.DetectAllTools()
	return jsonResponse(result, err)
}

func (a *App) EnableTool(name string) string {
	err := a.bs.Tools.EnableTool(constants.ToolName(name))
	return jsonResponse(nil, err)
}

func (a *App) DisableTool(name string) string {
	err := a.bs.Tools.DisableTool(constants.ToolName(name))
	return jsonResponse(nil, err)
}

func (a *App) SyncAllSkills() string {
	err := a.bs.Sync.SyncAllSkills()
	return jsonResponse(nil, err)
}

func (a *App) SyncAllMcp() string {
	err := a.bs.Sync.SyncAllMcp()
	return jsonResponse(nil, err)
}

func (a *App) SyncSkillToTool(skillID, toolName string) string {
	err := a.bs.Sync.SyncSkillToTool(skillID, constants.ToolName(toolName))
	return jsonResponse(nil, err)
}

func (a *App) UnsyncSkillFromTool(skillID, toolName string) string {
	err := a.bs.Sync.UnsyncSkillFromTool(skillID, constants.ToolName(toolName))
	return jsonResponse(nil, err)
}

func (a *App) SyncMcpToTool(serverID, toolName string) string {
	err := a.bs.Sync.SyncMcpToTool(serverID, constants.ToolName(toolName))
	return jsonResponse(nil, err)
}

func (a *App) UnsyncMcpFromTool(serverID, toolName string) string {
	err := a.bs.Sync.UnsyncMcpFromTool(serverID, constants.ToolName(toolName))
	return jsonResponse(nil, err)
}

func (a *App) GetGitStatus(repoPath string) string {
	result, err := a.bs.Git.GetStatus(repoPath)
	return jsonResponse(result, err)
}

func (a *App) GitPull(repoPath string) string {
	err := a.bs.Git.Pull(repoPath)
	return jsonResponse(nil, err)
}

func (a *App) GetSettings() string {
	result, err := a.bs.Settings.GetAll()
	return jsonResponse(result, err)
}

func (a *App) SetSetting(key, value string) string {
	err := a.bs.Settings.Set(key, value)
	return jsonResponse(nil, err)
}

func (a *App) ResetSettings() string {
	err := a.bs.Settings.ResetAll()
	return jsonResponse(nil, err)
}

func (a *App) SearchMarketplace(query string) string {
	result, err := a.bs.Market.SearchSkills(query)
	return jsonResponse(result, err)
}

func (a *App) SearchMcpMarketplace(query string) string {
	result, err := a.bs.Market.SearchMcpServers(query)
	return jsonResponse(result, err)
}

func (a *App) ImportSkillsZip(jsonReq string) string {
	var req service.ImportSkillsZipRequest
	if err := json.Unmarshal([]byte(jsonReq), &req); err != nil {
		return jsonResponse(nil, errors.ErrInvalidInput)
	}
	result, err := a.bs.ImportExport.ImportSkillsZip(req)
	return jsonResponse(result, err)
}

func (a *App) ExportSkillsZip(jsonReq string) string {
	var req service.ExportSkillsZipRequest
	if err := json.Unmarshal([]byte(jsonReq), &req); err != nil {
		return jsonResponse(nil, errors.ErrInvalidInput)
	}
	result, err := a.bs.ImportExport.ExportSkillsZip(req)
	return jsonResponse(result, err)
}

func (a *App) OpenInExplorer(path string) string {
	var cmd *exec.Cmd
	switch goruntime.GOOS {
	case "windows":
		cmd = exec.Command("explorer", path)
	case "darwin":
		cmd = exec.Command("open", path)
	default:
		cmd = exec.Command("xdg-open", path)
	}
	if err := cmd.Start(); err != nil {
		return jsonResponse(nil, fmt.Errorf("failed to open path: %v", err))
	}
	return jsonResponse(nil, nil)
}

func (a *App) BrowseFolder() string {
	path, err := wailsruntime.OpenDirectoryDialog(a.ctx, wailsruntime.OpenDialogOptions{
		Title: "Select Folder",
	})
	if err != nil {
		return jsonResponse("", err)
	}
	return jsonResponse(path, nil)
}

func (a *App) BrowseFile() string {
	path, err := wailsruntime.OpenFileDialog(a.ctx, wailsruntime.OpenDialogOptions{
		Title: "Select File",
		Filters: []wailsruntime.FileFilter{
			{DisplayName: "ZIP Files", Pattern: "*.zip"},
			{DisplayName: "All Files", Pattern: "*.*"},
		},
	})
	if err != nil {
		return jsonResponse("", err)
	}
	return jsonResponse(path, nil)
}

func (a *App) SaveFile(defaultFilename string) string {
	path, err := wailsruntime.SaveFileDialog(a.ctx, wailsruntime.SaveDialogOptions{
		Title:           "Save File",
		DefaultFilename: defaultFilename,
		Filters: []wailsruntime.FileFilter{
			{DisplayName: "ZIP Files", Pattern: "*.zip"},
		},
	})
	if err != nil {
		return jsonResponse("", err)
	}
	return jsonResponse(path, nil)
}

func (a *App) GetHomeDir() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return jsonResponse("", err)
	}
	return jsonResponse(homeDir, nil)
}

func (a *App) ListActivities(limit int) string {
	result, err := a.bs.Activity.ListRecent(limit)
	return jsonResponse(result, err)
}

func (a *App) ListGitBranches(owner string, repo string) string {
	result, err := a.bs.Market.ListBranches(owner, repo)
	return jsonResponse(result, err)
}

func (a *App) GetSkillDetail(id string) string {
	result, err := a.bs.Skills.GetSkillDetail(id)
	return jsonResponse(result, err)
}

type apiResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Code    string      `json:"code,omitempty"`
}

func jsonResponse(data interface{}, err error) string {
	resp := apiResponse{Success: err == nil}
	if err != nil {
		resp.Error = err.Error()
		if appErr, ok := err.(*errors.AppError); ok {
			resp.Code = appErr.Code
		}
	} else {
		resp.Data = data
	}
	bytes, _ := json.Marshal(resp)
	return string(bytes)
}
