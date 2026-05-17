package service

import (
	"aether-dock/backend/constants"
	"aether-dock/backend/models"
	"aether-dock/backend/repository"
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

type ImportExportService struct {
	repo *repository.RepositoryFactory
}

func NewImportExportService(repo *repository.RepositoryFactory) *ImportExportService {
	return &ImportExportService{repo: repo}
}

type ImportSkillsZipRequest struct {
	ZipPath    string `json:"zipPath"`
	TargetRoot string `json:"targetRoot"`
}

type ImportSkillsZipResult struct {
	TargetRoot         string   `json:"targetRoot"`
	ImportedSkillPaths []string `json:"importedSkillPaths"`
}

type ExportSkillsZipRequest struct {
	OutputPath string          `json:"outputPath"`
	Skills     []ZipSkillEntry `json:"skills"`
}

type ZipSkillEntry struct {
	SkillID         string `json:"skillId"`
	SourceSkillPath string `json:"sourceSkillPath"`
}

type ExportSkillsZipResult struct {
	OutputPath        string `json:"outputPath"`
	ExportedSkillCount int   `json:"exportedSkillCount"`
}

func (s *ImportExportService) ImportSkillsZip(req ImportSkillsZipRequest) (*ImportSkillsZipResult, error) {
	if req.ZipPath == "" {
		return nil, fmt.Errorf("zip path is required")
	}
	if req.TargetRoot == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return nil, fmt.Errorf("failed to get home directory: %w", err)
		}
		req.TargetRoot = filepath.Join(homeDir, constants.DefaultDataDirName, constants.DefaultSkillsDir)
	}

	if err := os.MkdirAll(req.TargetRoot, 0755); err != nil {
		return nil, fmt.Errorf("failed to create target directory: %w", err)
	}

	reader, err := zip.OpenReader(req.ZipPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open zip file: %w", err)
	}
	defer reader.Close()

	var importedPaths []string

	for _, f := range reader.File {
		if f.FileInfo().IsDir() {
			targetDir := filepath.Join(req.TargetRoot, f.Name)
			if err := os.MkdirAll(targetDir, 0755); err != nil {
				continue
			}
			continue
		}

		if strings.HasPrefix(filepath.Base(f.Name), ".") {
			continue
		}

		targetPath := filepath.Join(req.TargetRoot, f.Name)
		targetDir := filepath.Dir(targetPath)
		if err := os.MkdirAll(targetDir, 0755); err != nil {
			continue
		}

		if err := extractFile(f, targetPath); err != nil {
			continue
		}

		dir := filepath.Dir(targetPath)
		if !contains(importedPaths, dir) {
			importedPaths = append(importedPaths, dir)
		}
	}

	for _, skillPath := range importedPaths {
		skillName := filepath.Base(skillPath)
		existing, _ := s.repo.Skill.GetByName(skillName)
		if existing != nil {
			continue
		}

		source := &models.SkillSource{
			Name:      skillName + "-imported",
			Type:      constants.SkillSourceLocal,
			LocalPath: skillPath,
		}
		if err := s.repo.Source.Create(source); err != nil {
			continue
		}

		skill := &models.Skill{
			Name:         skillName,
			SourceID:     source.ID,
			InstallPath:  skillPath,
			Status:       constants.SkillStatusInstalled,
			EnabledTools: models.StringList{},
		}
		s.repo.Skill.Create(skill)
	}

	return &ImportSkillsZipResult{
		TargetRoot:         req.TargetRoot,
		ImportedSkillPaths: importedPaths,
	}, nil
}

func (s *ImportExportService) ExportSkillsZip(req ExportSkillsZipRequest) (*ExportSkillsZipResult, error) {
	if req.OutputPath == "" {
		return nil, fmt.Errorf("output path is required")
	}
	if len(req.Skills) == 0 {
		return nil, fmt.Errorf("no skills to export")
	}

	outputDir := filepath.Dir(req.OutputPath)
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create output directory: %w", err)
	}

	outFile, err := os.Create(req.OutputPath)
	if err != nil {
		return nil, fmt.Errorf("failed to create output file: %w", err)
	}
	defer outFile.Close()

	writer := zip.NewWriter(outFile)
	defer writer.Close()

	exportedCount := 0

	for _, entry := range req.Skills {
		sourcePath := entry.SourceSkillPath
		if sourcePath == "" {
			skill, err := s.repo.Skill.GetByID(entry.SkillID)
			if err != nil {
				continue
			}
			sourcePath = skill.InstallPath
		}

		if sourcePath == "" {
			continue
		}

		info, err := os.Stat(sourcePath)
		if err != nil {
			continue
		}

		if info.IsDir() {
			count, err := addDirToZip(writer, sourcePath, filepath.Base(sourcePath))
			if err != nil {
				continue
			}
			if count > 0 {
				exportedCount++
			}
		} else {
			if err := addFileToZip(writer, sourcePath, filepath.Base(sourcePath)); err != nil {
				continue
			}
			exportedCount++
		}
	}

	return &ExportSkillsZipResult{
		OutputPath:         req.OutputPath,
		ExportedSkillCount: exportedCount,
	}, nil
}

func extractFile(f *zip.File, targetPath string) error {
	rc, err := f.Open()
	if err != nil {
		return err
	}
	defer rc.Close()

	outFile, err := os.OpenFile(targetPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, f.Mode())
	if err != nil {
		return err
	}
	defer outFile.Close()

	_, err = io.Copy(outFile, rc)
	return err
}

func addDirToZip(writer *zip.Writer, dirPath, prefix string) (int, error) {
	count := 0
	err := filepath.Walk(dirPath, func(filePath string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(dirPath, filePath)
		if err != nil {
			return err
		}
		zipPath := filepath.Join(prefix, relPath)

		if info.IsDir() {
			_, err := writer.Create(zipPath + "/")
			return err
		}

		if err := addFileToZip(writer, filePath, zipPath); err != nil {
			return err
		}
		count++
		return nil
	})
	return count, err
}

func addFileToZip(writer *zip.Writer, filePath, zipPath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	w, err := writer.Create(zipPath)
	if err != nil {
		return err
	}

	_, err = io.Copy(w, file)
	return err
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
