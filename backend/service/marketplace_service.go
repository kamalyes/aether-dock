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

func (s *MarketplaceService) SearchSkills(query string) (*MarketplaceResult, error) {
	if query == "" {
		return s.getTrendingSkills()
	}

	skills, err := s.searchGitHub(query, "skill")
	if err != nil {
		return &MarketplaceResult{Skills: []MarketplaceSkill{}, Total: 0}, nil
	}
	return &MarketplaceResult{Skills: skills, Total: len(skills)}, nil
}

func (s *MarketplaceService) SearchMcpServers(query string) (*MarketplaceResult, error) {
	if query == "" {
		return s.getTrendingMcp()
	}

	skills, err := s.searchGitHub(query, "mcp+server")
	if err != nil {
		return &MarketplaceResult{Skills: []MarketplaceSkill{}, Total: 0}, nil
	}
	return &MarketplaceResult{Skills: skills, Total: len(skills)}, nil
}

func (s *MarketplaceService) ListCategories() ([]string, error) {
	return []string{"All", "Skills", "MCP Servers", "Popular", "Recent"}, nil
}

func (s *MarketplaceService) getTrendingSkills() (*MarketplaceResult, error) {
	skills, err := s.searchGitHub("ai+skill+SKILL.md", "")
	if err != nil {
		return &MarketplaceResult{Skills: []MarketplaceSkill{}, Total: 0}, nil
	}
	return &MarketplaceResult{Skills: skills, Total: len(skills)}, nil
}

func (s *MarketplaceService) getTrendingMcp() (*MarketplaceResult, error) {
	skills, err := s.searchGitHub("mcp+server+modelcontextprotocol", "")
	if err != nil {
		return &MarketplaceResult{Skills: []MarketplaceSkill{}, Total: 0}, nil
	}
	return &MarketplaceResult{Skills: skills, Total: len(skills)}, nil
}

func (s *MarketplaceService) searchGitHub(query string, extra string) ([]MarketplaceSkill, error) {
	searchQuery := query
	if extra != "" {
		searchQuery = query + "+" + extra
	}

	apiURL := fmt.Sprintf("https://api.github.com/search/repositories?q=%s&sort=stars&order=desc&per_page=20",
		url.QueryEscape(searchQuery))

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
		Items []githubRepo `json:"items"`
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
			ID:          fmt.Sprintf("gh-%d", i),
			Name:        repo.FullName,
			Description: repo.Description,
			Author:      repo.Owner.Login,
			URL:         repo.HTMLURL,
			Category:    skillType,
			Stars:       repo.Stargazers,
			Type:        skillType,
		})
	}

	return skills, nil
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
