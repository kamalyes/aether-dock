package service

import (
	"aether-dock/backend/constants"
	"aether-dock/backend/errors"
	"aether-dock/backend/models"
	"aether-dock/backend/repository"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type SkillService struct {
	repo     *repository.RepositoryFactory
	git      *GitService
	activity *ActivityService
}

func NewSkillService(repo *repository.RepositoryFactory, git *GitService, activity *ActivityService) *SkillService {
	return &SkillService{repo: repo, git: git, activity: activity}
}

type SkillListResult struct {
	Skills []models.Skill `json:"skills"`
	Total  int64          `json:"total"`
}

func (s *SkillService) List(page, pageSize int, status constants.SkillStatus, sourceID string) (*SkillListResult, error) {
	offset := (page - 1) * pageSize
	skills, total, err := s.repo.Skill.List(offset, pageSize, status, sourceID)
	if err != nil {
		return nil, err
	}
	return &SkillListResult{Skills: skills, Total: total}, nil
}

func (s *SkillService) GetByID(id string) (*models.Skill, error) {
	skill, err := s.repo.Skill.GetByID(id)
	if err != nil {
		return nil, errors.ErrSkillNotFound
	}
	return skill, nil
}

type InstallFromGitRequest struct {
	URL        string `json:"url"`
	Branch     string `json:"branch"`
	Name       string `json:"name"`
	SourceName string `json:"sourceName"`
}

func (s *SkillService) InstallFromGit(req InstallFromGitRequest) (*models.Skill, error) {
	if req.URL == "" {
		return nil, errors.ErrInvalidInput
	}
	if req.Branch == "" {
		req.Branch = "main"
	}
	if req.Name == "" {
		parts := strings.Split(strings.TrimSuffix(req.URL, "/"), "/")
		req.Name = strings.TrimSuffix(parts[len(parts)-1], ".git")
	}

	existing, _ := s.repo.Skill.GetByName(req.Name)
	if existing != nil {
		return nil, errors.ErrSkillAlreadyExists
	}

	dataDir, err := s.getDataDir()
	if err != nil {
		return nil, err
	}

	installPath := filepath.Join(dataDir, constants.DefaultSkillsDir, req.Name)

	source := &models.SkillSource{
		Name:   req.SourceName,
		Type:   constants.SkillSourceGit,
		URL:    req.URL,
		Branch: req.Branch,
	}
	if source.Name == "" {
		source.Name = req.Name + "-source"
	}
	if err := s.repo.Source.Create(source); err != nil {
		return nil, fmt.Errorf("failed to create source: %w", err)
	}

	skill := &models.Skill{
		Name:         req.Name,
		SourceID:     source.ID,
		InstallPath:  installPath,
		GitURL:       req.URL,
		GitBranch:    req.Branch,
		Status:       constants.SkillStatusInstalling,
		EnabledTools: models.StringList{},
	}

	if err := s.repo.Skill.Create(skill); err != nil {
		return nil, fmt.Errorf("failed to create skill record: %w", err)
	}

	if err := s.git.Clone(req.URL, req.Branch, installPath); err != nil {
		s.repo.Skill.UpdateStatus(skill.ID, constants.SkillStatusError)
		return skill, fmt.Errorf("git clone failed: %w", err)
	}

	s.repo.Skill.UpdateStatus(skill.ID, constants.SkillStatusInstalled)
	s.activity.Record("install", skill.Name, "skill", "", "Installed from Git: "+req.URL)
	return skill, nil
}

type InstallFromLocalRequest struct {
	LocalPath  string `json:"localPath"`
	Name       string `json:"name"`
	SourceName string `json:"sourceName"`
}

func (s *SkillService) InstallFromLocal(req InstallFromLocalRequest) (*models.Skill, error) {
	if req.LocalPath == "" || req.Name == "" {
		return nil, errors.ErrInvalidInput
	}

	if _, err := os.Stat(req.LocalPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("local path does not exist: %s", req.LocalPath)
	}

	existing, _ := s.repo.Skill.GetByName(req.Name)
	if existing != nil {
		return nil, errors.ErrSkillAlreadyExists
	}

	dataDir, err := s.getDataDir()
	if err != nil {
		return nil, err
	}

	installPath := filepath.Join(dataDir, constants.DefaultSkillsDir, req.Name)

	source := &models.SkillSource{
		Name:      req.SourceName,
		Type:      constants.SkillSourceLocal,
		LocalPath: req.LocalPath,
	}
	if source.Name == "" {
		source.Name = req.Name + "-source"
	}
	if err := s.repo.Source.Create(source); err != nil {
		return nil, fmt.Errorf("failed to create source: %w", err)
	}

	skill := &models.Skill{
		Name:         req.Name,
		SourceID:     source.ID,
		InstallPath:  installPath,
		Status:       constants.SkillStatusInstalled,
		EnabledTools: models.StringList{},
	}

	if err := s.repo.Skill.Create(skill); err != nil {
		return nil, fmt.Errorf("failed to create skill record: %w", err)
	}

	if err := copyDir(req.LocalPath, installPath); err != nil {
		s.repo.Skill.UpdateStatus(skill.ID, constants.SkillStatusError)
		return skill, fmt.Errorf("failed to copy local skill: %w", err)
	}

	s.activity.Record("install", skill.Name, "skill", "", "Installed from local: "+req.LocalPath)
	return skill, nil
}

func (s *SkillService) Delete(id string) error {
	skill, err := s.repo.Skill.GetByID(id)
	if err != nil {
		return errors.ErrSkillNotFound
	}

	if skill.InstallPath != "" {
		os.RemoveAll(skill.InstallPath)
	}

	if skill.SourceID != "" {
		s.repo.Source.Delete(skill.SourceID)
	}

	s.activity.Record("delete", skill.Name, "skill", "", "Deleted skill")
	return s.repo.Skill.Delete(id)
}

func (s *SkillService) UpdateStatus(id string, status constants.SkillStatus) error {
	return s.repo.Skill.UpdateStatus(id, status)
}

func (s *SkillService) EnableForTool(id string, toolName string) error {
	skill, err := s.repo.Skill.GetByID(id)
	if err != nil {
		return errors.ErrSkillNotFound
	}

	for _, t := range skill.EnabledTools {
		if t == toolName {
			return nil
		}
	}
	skill.EnabledTools = append(skill.EnabledTools, toolName)
	return s.repo.Skill.Update(skill)
}

func (s *SkillService) DisableForTool(id string, toolName string) error {
	skill, err := s.repo.Skill.GetByID(id)
	if err != nil {
		return errors.ErrSkillNotFound
	}

	filtered := make(models.StringList, 0, len(skill.EnabledTools))
	for _, t := range skill.EnabledTools {
		if t != toolName {
			filtered = append(filtered, t)
		}
	}
	skill.EnabledTools = filtered
	return s.repo.Skill.Update(skill)
}

func (s *SkillService) ListBySource(sourceID string) ([]models.Skill, error) {
	return s.repo.Skill.ListBySource(sourceID)
}

func (s *SkillService) getDataDir() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	dataDir := filepath.Join(homeDir, constants.DefaultDataDirName)
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return "", err
	}
	skillsDir := filepath.Join(dataDir, constants.DefaultSkillsDir)
	if err := os.MkdirAll(skillsDir, 0755); err != nil {
		return "", err
	}
	return dataDir, nil
}

type SkillDetailResult struct {
	Skill            models.Skill      `json:"skill"`
	Content          string            `json:"content"`
	ContentHash      string            `json:"contentHash"`
	RelatedFiles     []string          `json:"relatedFiles"`
	InstallLocations []InstallLocation `json:"installLocations"`
	GitInfo          *GitRepoInfo      `json:"gitInfo,omitempty"`
}

type InstallLocation struct {
	ToolName  string `json:"toolName"`
	Icon      string `json:"icon"`
	Path      string `json:"path"`
	Installed bool   `json:"installed"`
	Hash      string `json:"hash,omitempty"`
}

type GitRepoInfo struct {
	Stars       int    `json:"stars"`
	Forks       int    `json:"forks"`
	OpenIssues  int    `json:"openIssues"`
	License     string `json:"license"`
	LastUpdated string `json:"lastUpdated"`
	Language    string `json:"language"`
	Description string `json:"description"`
	Readme      string `json:"readme"`
}

func (s *SkillService) GetSkillDetail(skillID string) (*SkillDetailResult, error) {
	skill, err := s.repo.Skill.GetByID(skillID)
	if err != nil {
		return nil, err
	}

	result := &SkillDetailResult{Skill: *skill}

	skillFile := filepath.Join(skill.InstallPath, "SKILL.md")
	if content, err := os.ReadFile(skillFile); err == nil {
		result.Content = string(content)
		result.ContentHash = computeMD5(content)
	} else {
		result.Content = skill.Description
		result.ContentHash = ""
	}

	entries, err := os.ReadDir(skill.InstallPath)
	if err == nil {
		for _, entry := range entries {
			if !entry.IsDir() && entry.Name() != "SKILL.md" {
				result.RelatedFiles = append(result.RelatedFiles, entry.Name())
			}
		}
	}

	result.InstallLocations = s.detectInstallLocations(skill)

	if skill.GitURL != "" {
		gitInfo, err := s.fetchGitHubInfo(skill.GitURL)
		if err == nil {
			result.GitInfo = gitInfo
		}
	}

	return result, nil
}

func (s *SkillService) detectInstallLocations(skill *models.Skill) []InstallLocation {
	homeDir, _ := os.UserHomeDir()
	locations := []InstallLocation{}

	toolPaths := map[string][]string{
		"claude": {
			filepath.Join(homeDir, ".claude", "skills"),
		},
		"codex": {
			filepath.Join(homeDir, ".codex", "skills"),
		},
		"gemini": {
			filepath.Join(homeDir, ".gemini", "skills"),
		},
		"cursor": {
			filepath.Join(homeDir, ".cursor", "skills"),
		},
		"windsurf": {
			filepath.Join(homeDir, ".windsurf", "skills"),
		},
	}

	skillDirName := filepath.Base(skill.InstallPath)

	for toolName, paths := range toolPaths {
		for _, p := range paths {
			loc := InstallLocation{
				ToolName:  toolName,
				Icon:      toolName,
				Path:      filepath.Join(p, skillDirName),
				Installed: false,
			}
			if _, err := os.Stat(loc.Path); err == nil {
				loc.Installed = true
				if hash, err := computeFileHash(loc.Path); err == nil {
					loc.Hash = hash
				}
			}
			locations = append(locations, loc)
		}
	}

	if skill.InstallPath != "" {
		found := false
		for _, loc := range locations {
			if loc.Path == skill.InstallPath {
				found = true
				break
			}
		}
		if !found {
			locations = append(locations, InstallLocation{
				ToolName:  "custom",
				Icon:      "folder",
				Path:      skill.InstallPath,
				Installed: true,
				Hash:      "",
			})
		}
	}

	return locations
}

func (s *SkillService) fetchGitHubInfo(gitURL string) (*GitRepoInfo, error) {
	repoPath := extractGitHubRepoPath(gitURL)
	if repoPath == "" {
		return nil, fmt.Errorf("not a github url")
	}

	apiURL := fmt.Sprintf("https://api.github.com/repos/%s", repoPath)

	resp, err := httpGetJSON(apiURL)
	if err != nil {
		return nil, err
	}

	info := &GitRepoInfo{}
	if v, ok := resp["stargazers_count"].(float64); ok {
		info.Stars = int(v)
	}
	if v, ok := resp["forks_count"].(float64); ok {
		info.Forks = int(v)
	}
	if v, ok := resp["open_issues_count"].(float64); ok {
		info.OpenIssues = int(v)
	}
	if v, ok := resp["license"].(map[string]interface{}); ok {
		if name, ok := v["spdx_id"].(string); ok {
			info.License = name
		}
	}
	if v, ok := resp["pushed_at"].(string); ok {
		info.LastUpdated = v
	}
	if v, ok := resp["language"].(string); ok {
		info.Language = v
	}
	if v, ok := resp["description"].(string); ok {
		info.Description = v
	}

	readmeURL := fmt.Sprintf("https://api.github.com/repos/%s/readme", repoPath)
	if readmeResp, err := httpGetJSON(readmeURL); err == nil {
		if content, ok := readmeResp["content"].(string); ok {
			decoded, err := hex.DecodeString(content)
			if err == nil {
				info.Readme = string(decoded)
			}
		}
	}

	return info, nil
}

func extractGitHubRepoPath(rawURL string) string {
	u := strings.TrimSpace(rawURL)
	u = strings.TrimPrefix(u, "https://github.com/")
	u = strings.TrimPrefix(u, "http://github.com/")
	u = strings.TrimSuffix(u, ".git")
	parts := strings.SplitN(u, "/", 3)
	if len(parts) >= 2 {
		return parts[0] + "/" + parts[1]
	}
	return ""
}

func computeMD5(data []byte) string {
	hash := md5.Sum(data)
	return hex.EncodeToString(hash[:])
}

func computeFileHash(dirPath string) (string, error) {
	skillFile := filepath.Join(dirPath, "SKILL.md")
	data, err := os.ReadFile(skillFile)
	if err != nil {
		return "", err
	}
	return computeMD5(data), nil
}

func httpGetJSON(url string) (map[string]interface{}, error) {
	client := &http.Client{Timeout: 15 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("User-Agent", "aether-dock/0.1.0")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func copyDir(src, dst string) error {
	info, err := os.Stat(src)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(dst, info.Mode()); err != nil {
		return err
	}
	entries, err := os.ReadDir(src)
	if err != nil {
		return err
	}
	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())
		if entry.IsDir() {
			if err := copyDir(srcPath, dstPath); err != nil {
				return err
			}
		} else {
			if err := copyFile(srcPath, dstPath); err != nil {
				return err
			}
		}
	}
	return nil
}

func copyFile(src, dst string) error {
	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	if err := os.MkdirAll(filepath.Dir(dst), 0755); err != nil {
		return err
	}

	dstFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer dstFile.Close()

	_, err = io.Copy(dstFile, srcFile)
	return err
}
