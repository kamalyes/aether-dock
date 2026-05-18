package service

import (
	"aether-dock/backend/errors"
	"aether-dock/backend/repository"
	"fmt"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
)

type GitService struct {
	repo *repository.RepositoryFactory
}

func NewGitService(repo *repository.RepositoryFactory) *GitService {
	return &GitService{repo: repo}
}

type GitStatusResult struct {
	IsGitRepo      bool   `json:"isGitRepo"`
	Branch         string `json:"branch"`
	Commit         string `json:"commit"`
	HasChanges     bool   `json:"hasChanges"`
	AheadCount     int    `json:"aheadCount"`
	BehindCount    int    `json:"behindCount"`
	RemoteURL      string `json:"remoteUrl"`
	StagedFiles    int    `json:"stagedFiles"`
	UnstagedFiles  int    `json:"unstagedFiles"`
	UntrackedFiles int    `json:"untrackedFiles"`
}

func (s *GitService) Clone(url, branch, dest string) error {
	refName := plumbing.ReferenceName(fmt.Sprintf("refs/heads/%s", branch))
	_, err := git.PlainClone(dest, false, &git.CloneOptions{
		URL:           url,
		ReferenceName: refName,
		SingleBranch:  true,
		Depth:         1,
	})
	if err != nil {
		return fmt.Errorf("%w: %v", errors.ErrGitOperationFailed, err)
	}
	return nil
}

func (s *GitService) Pull(repoPath string) error {
	r, err := git.PlainOpen(repoPath)
	if err != nil {
		return fmt.Errorf("%w: %v", errors.ErrGitRepoNotFound, err)
	}

	w, err := r.Worktree()
	if err != nil {
		return err
	}

	err = w.Pull(&git.PullOptions{})
	if err != nil && err != git.NoErrAlreadyUpToDate {
		return fmt.Errorf("%w: %v", errors.ErrGitOperationFailed, err)
	}
	return nil
}

func (s *GitService) GetStatus(repoPath string) (*GitStatusResult, error) {
	result := &GitStatusResult{}

	r, err := git.PlainOpen(repoPath)
	if err != nil {
		result.IsGitRepo = false
		return result, nil
	}
	result.IsGitRepo = true

	head, err := r.Head()
	if err == nil {
		result.Branch = head.Name().Short()
		result.Commit = head.Hash().String()[:8]
	}

	remotes, err := r.Remotes()
	if err == nil && len(remotes) > 0 {
		config := remotes[0].Config()
		if len(config.URLs) > 0 {
			result.RemoteURL = config.URLs[0]
		}
	}

	w, err := r.Worktree()
	if err != nil {
		return result, nil
	}

	status, err := w.Status()
	if err != nil {
		return result, nil
	}

	for _, s := range status {
		if s.Staging != git.Unmodified {
			result.StagedFiles++
		}
		if s.Worktree != git.Unmodified {
			result.UnstagedFiles++
		}
		if s.Staging == git.Untracked {
			result.UntrackedFiles++
		}
	}

	result.HasChanges = len(status) > 0
	return result, nil
}

func (s *GitService) IsGitRepo(path string) bool {
	_, err := git.PlainOpen(path)
	return err == nil
}

func (s *GitService) GetDiff(repoPath string) (string, error) {
	r, err := git.PlainOpen(repoPath)
	if err != nil {
		return "", errors.ErrGitRepoNotFound
	}

	w, err := r.Worktree()
	if err != nil {
		return "", err
	}

	status, err := w.Status()
	if err != nil {
		return "", err
	}

	diff := ""
	for file, s := range status {
		diff += fmt.Sprintf("%s %s\n", string(s.Staging), file)
	}
	return diff, nil
}

func (s *GitService) GetCommitLog(repoPath string, limit int) ([]map[string]string, error) {
	r, err := git.PlainOpen(repoPath)
	if err != nil {
		return nil, errors.ErrGitRepoNotFound
	}

	logOpts := &git.LogOptions{}
	if limit <= 0 {
		limit = 20
	}

	commits, err := r.Log(logOpts)
	if err != nil {
		return nil, err
	}

	result := make([]map[string]string, 0, limit)
	count := 0
	commits.ForEach(func(c *object.Commit) error {
		if count >= limit {
			return fmt.Errorf("stop")
		}
		result = append(result, map[string]string{
			"hash":    c.Hash.String()[:8],
			"message": c.Message,
			"author":  c.Author.Name,
			"date":    c.Author.When.Format("2006-01-02 15:04:05"),
		})
		count++
		return nil
	})

	return result, nil
}

func (s *GitService) HasRemoteUpdates(repoPath string) (bool, error) {
	r, err := git.PlainOpen(repoPath)
	if err != nil {
		return false, errors.ErrGitRepoNotFound
	}

	remotes, err := r.Remotes()
	if err != nil || len(remotes) == 0 {
		return false, nil
	}

	head, err := r.Head()
	if err != nil {
		return false, nil
	}

	_ = remotes[0].Fetch(&git.FetchOptions{})

	remoteRef, err := r.Reference(plumbing.ReferenceName("refs/remotes/origin/"+head.Name().Short()), false)
	if err != nil {
		return false, nil
	}

	return head.Hash() != remoteRef.Hash(), nil
}
