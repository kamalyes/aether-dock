package repository

import (
	"aether-dock/backend/constants"
	"aether-dock/backend/models"

	"gorm.io/gorm"
)

type McpRepository struct {
	db *gorm.DB
}

func NewMcpRepository(db *gorm.DB) *McpRepository {
	return &McpRepository{db: db}
}

func (r *McpRepository) ListServers(offset, limit int, status constants.McpServerStatus) ([]models.McpServer, int64, error) {
	var servers []models.McpServer
	var total int64
	query := r.db.Model(&models.McpServer{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Preload("Tools").Offset(offset).Limit(limit).Order("updated_at DESC").Find(&servers).Error; err != nil {
		return nil, 0, err
	}
	return servers, total, nil
}

func (r *McpRepository) GetServerByID(id string) (*models.McpServer, error) {
	var server models.McpServer
	if err := r.db.Preload("Tools").First(&server, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &server, nil
}

func (r *McpRepository) GetServerByName(name string) (*models.McpServer, error) {
	var server models.McpServer
	if err := r.db.Preload("Tools").First(&server, "name = ?", name).Error; err != nil {
		return nil, err
	}
	return &server, nil
}

func (r *McpRepository) CreateServer(server *models.McpServer) error {
	return r.db.Create(server).Error
}

func (r *McpRepository) UpdateServer(server *models.McpServer) error {
	return r.db.Save(server).Error
}

func (r *McpRepository) DeleteServer(id string) error {
	return r.db.Select("Tools").Delete(&models.McpServer{}, "id = ?", id).Error
}

func (r *McpRepository) UpdateServerStatus(id string, status constants.McpServerStatus) error {
	return r.db.Model(&models.McpServer{}).Where("id = ?", id).Update("status", status).Error
}

func (r *McpRepository) CreateTool(tool *models.McpTool) error {
	return r.db.Create(tool).Error
}

func (r *McpRepository) DeleteToolsByServerID(serverID string) error {
	return r.db.Where("server_id = ?", serverID).Delete(&models.McpTool{}).Error
}

func (r *McpRepository) ListToolsByServer(serverID string) ([]models.McpTool, error) {
	var tools []models.McpTool
	if err := r.db.Where("server_id = ?", serverID).Find(&tools).Error; err != nil {
		return nil, err
	}
	return tools, nil
}
