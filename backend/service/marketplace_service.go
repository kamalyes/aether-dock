package service

import (
	"aether-dock/backend/repository"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

type MarketplaceService struct {
	repo   *repository.RepositoryFactory
	client *http.Client
}

func NewMarketplaceService(repo *repository.RepositoryFactory) *MarketplaceService {
	return &MarketplaceService{
		repo: repo,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type MarketplaceSkill struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Author      string `json:"author"`
	URL         string `json:"url"`
	Category    string `json:"category"`
	Stars       int    `json:"stars"`
	Downloads   int    `json:"downloads"`
	Type        string `json:"type"`
}

type MarketplaceResult struct {
	Skills []MarketplaceSkill `json:"skills"`
	Total  int                `json:"total"`
}

type githubRepo struct {
	FullName    string `json:"full_name"`
	Description string `json:"description"`
	HTMLURL     string `json:"html_url"`
	Stargazers  int    `json:"stargazers_count"`
	Owner       struct {
		Login string `json:"login"`
	} `json:"owner"`
}

func (s *MarketplaceService) SearchSkills(query string, page, pageSize int) (*MarketplaceResult, error) {
	if query == "" {
		return s.getTrendingSkills(page, pageSize)
	}

	result, err := s.searchGitHub(query, "skill", page, pageSize)
	if err != nil {
		return &MarketplaceResult{Skills: []MarketplaceSkill{}, Total: 0}, nil
	}
	return result, nil
}

func (s *MarketplaceService) SearchMcpServers(query string, page, pageSize int) (*MarketplaceResult, error) {
	if query == "" {
		return s.getTrendingMcp(page, pageSize)
	}

	result, err := s.searchGitHub(query, "mcp+server", page, pageSize)
	if err != nil {
		return &MarketplaceResult{Skills: []MarketplaceSkill{}, Total: 0}, nil
	}
	return result, nil
}

func (s *MarketplaceService) ListCategories() ([]string, error) {
	return []string{"All", "Skills", "MCP Servers", "Popular", "Recent"}, nil
}

func (s *MarketplaceService) getTrendingSkills(page, pageSize int) (*MarketplaceResult, error) {
	result, err := s.searchGitHub("ai+skill+SKILL.md", "", page, pageSize)
	if err != nil {
		return &MarketplaceResult{Skills: []MarketplaceSkill{}, Total: 0}, nil
	}
	return result, nil
}

func (s *MarketplaceService) getTrendingMcp(page, pageSize int) (*MarketplaceResult, error) {
	result, err := s.searchGitHub("mcp+server+modelcontextprotocol", "", page, pageSize)
	if err != nil {
		return &MarketplaceResult{Skills: []MarketplaceSkill{}, Total: 0}, nil
	}
	return result, nil
}

func (s *MarketplaceService) searchGitHub(query string, extra string, page, pageSize int) (*MarketplaceResult, error) {
	page, pageSize = normalizeMarketplacePagination(page, pageSize)
	searchQuery := query
	if extra != "" {
		searchQuery = query + "+" + extra
	}

	apiURL := fmt.Sprintf("https://api.github.com/search/repositories?q=%s&sort=stars&order=desc&page=%d&per_page=%d",
		url.QueryEscape(searchQuery), page, pageSize)

	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("User-Agent", "AetherDock/0.1.0")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("GitHub API returned %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		TotalCount int          `json:"total_count"`
		Items      []githubRepo `json:"items"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	skills := make([]MarketplaceSkill, 0, len(result.Items))
	for i, repo := range result.Items {
		skillType := "skill"
		if extra == "mcp+server" || query == "mcp+server+modelcontextprotocol" {
			skillType = "mcp"
		}
		skills = append(skills, MarketplaceSkill{
			ID:          fmt.Sprintf("gh-%d", (page-1)*pageSize+i+1),
			Name:        repo.FullName,
			Description: repo.Description,
			Author:      repo.Owner.Login,
			URL:         repo.HTMLURL,
			Category:    skillType,
			Stars:       repo.Stargazers,
			Type:        skillType,
		})
	}

	total := result.TotalCount
	if total > 1000 {
		total = 1000
	}
	return &MarketplaceResult{Skills: skills, Total: total}, nil
}

func normalizeMarketplacePagination(page, pageSize int) (int, int) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 50 {
		pageSize = 50
	}
	return page, pageSize
}

type githubBranch struct {
	Name string `json:"name"`
}

func (s *MarketplaceService) ListBranches(owner, repo string) ([]string, error) {
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/branches?per_page=100",
		url.QueryEscape(owner), url.QueryEscape(repo))

	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("User-Agent", "AetherDock/0.1.0")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return []string{}, nil
	}

	var branches []githubBranch
	if err := json.NewDecoder(resp.Body).Decode(&branches); err != nil {
		return nil, err
	}

	names := make([]string, 0, len(branches))
	for _, b := range branches {
		names = append(names, b.Name)
	}

	return names, nil
}
