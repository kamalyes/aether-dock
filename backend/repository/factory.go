package repository

import (
	"aether-dock/backend/models"
	"sync"

	"gorm.io/gorm"
)

type RepositoryFactory struct {
	db       *gorm.DB
	Skill    *SkillRepository
	Source   *SourceRepository
	Mcp      *McpRepository
	Tool     *ToolRepository
	Sync     *SyncRepository
	Setting  *SettingsRepository
	Activity *ActivityRepository
}

var (
	factoryInstance *RepositoryFactory
	factoryOnce     sync.Once
)

func NewRepositoryFactory(db *gorm.DB) *RepositoryFactory {
	factoryOnce.Do(func() {
		factoryInstance = &RepositoryFactory{
			db:       db,
			Skill:    NewSkillRepository(db),
			Source:   NewSourceRepository(db),
			Mcp:      NewMcpRepository(db),
			Tool:     NewToolRepository(db),
			Sync:     NewSyncRepository(db),
			Setting:  NewSettingsRepository(db),
			Activity: NewActivityRepository(db),
		}
	})
	return factoryInstance
}

func (f *RepositoryFactory) GetDB() *gorm.DB {
	return f.db
}

func ResetFactory() {
	factoryOnce = sync.Once{}
	factoryInstance = nil
}

func (f *RepositoryFactory) AutoMigrate() error {
	return f.db.AutoMigrate(
		&models.Skill{},
		&models.SkillSource{},
		&models.McpServer{},
		&models.McpTool{},
		&models.ToolConfig{},
		&models.SyncRecord{},
		&models.Settings{},
		&models.Activity{},
	)
}
