package bootstrap

import (
	"aether-dock/backend/constants"
	"aether-dock/backend/repository"
	"aether-dock/backend/service"
	"fmt"
	"os"
	"path/filepath"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type AppBootstrap struct {
	Repo         *repository.RepositoryFactory
	Skills       *service.SkillService
	Sources      *service.SourceService
	Mcp          *service.McpService
	Sync         *service.SyncService
	Git          *service.GitService
	Market       *service.MarketplaceService
	Tools        *service.ToolService
	Settings     *service.SettingsService
	ImportExport *service.ImportExportService
	Activity     *service.ActivityService
}

func NewAppBootstrap() *AppBootstrap {
	return &AppBootstrap{}
}

func (b *AppBootstrap) Init() error {
	dataDir, err := b.ensureDataDir()
	if err != nil {
		return fmt.Errorf("failed to initialize data directory: %w", err)
	}

	db, err := b.initDatabase(dataDir)
	if err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}

	repository.ResetFactory()
	b.Repo = repository.NewRepositoryFactory(db)

	if err := b.Repo.AutoMigrate(); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	b.initServices()

	if err := b.Settings.InitDefaults(); err != nil {
		fmt.Printf("Warning: failed to init default settings: %v\n", err)
	}

	b.Tools.DetectAllTools()

	return nil
}

func (b *AppBootstrap) ensureDataDir() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	dataDir := filepath.Join(homeDir, constants.DefaultDataDirName)
	dirs := []string{
		dataDir,
		filepath.Join(dataDir, constants.DefaultSkillsDir),
		filepath.Join(dataDir, constants.DefaultMcpDir),
	}

	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return "", fmt.Errorf("failed to create directory %s: %w", dir, err)
		}
	}

	return dataDir, nil
}

func (b *AppBootstrap) initDatabase(dataDir string) (*gorm.DB, error) {
	dbPath := filepath.Join(dataDir, constants.DefaultDbName)

	db, err := gorm.Open(sqlite.Open(dbPath+"?_journal_mode=WAL"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetMaxIdleConns(1)

	return db, nil
}

func (b *AppBootstrap) initServices() {
	b.Git = service.NewGitService(b.Repo)
	b.Activity = service.NewActivityService(b.Repo)
	b.Skills = service.NewSkillService(b.Repo, b.Git, b.Activity)
	b.Sources = service.NewSourceService(b.Repo)
	b.Mcp = service.NewMcpService(b.Repo, b.Activity)
	b.Sync = service.NewSyncService(b.Repo)
	b.Market = service.NewMarketplaceService(b.Repo)
	b.Tools = service.NewToolService(b.Repo)
	b.Settings = service.NewSettingsService(b.Repo)
	b.ImportExport = service.NewImportExportService(b.Repo)
}
