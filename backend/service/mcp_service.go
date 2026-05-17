package service

import (
	"aether-dock/backend/constants"
	"aether-dock/backend/errors"
	"aether-dock/backend/models"
	"aether-dock/backend/repository"
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"
)

type McpService struct {
	repo     *repository.RepositoryFactory
	activity *ActivityService
}

func NewMcpService(repo *repository.RepositoryFactory, activity *ActivityService) *McpService {
	return &McpService{repo: repo, activity: activity}
}

type McpServerListResult struct {
	Servers []models.McpServer `json:"servers"`
	Total   int64              `json:"total"`
}

func (s *McpService) ListServers(page, pageSize int, status constants.McpServerStatus) (*McpServerListResult, error) {
	offset := (page - 1) * pageSize
	servers, total, err := s.repo.Mcp.ListServers(offset, pageSize, status)
	if err != nil {
		return nil, err
	}
	return &McpServerListResult{Servers: servers, Total: total}, nil
}

func (s *McpService) GetServerByID(id string) (*models.McpServer, error) {
	server, err := s.repo.Mcp.GetServerByID(id)
	if err != nil {
		return nil, errors.ErrMcpNotFound
	}
	return server, nil
}

type AddMcpServerRequest struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Command     string                 `json:"command"`
	Args        []string               `json:"args"`
	Env         map[string]interface{} `json:"env"`
	SourceType  string                 `json:"sourceType"`
	SourceURL   string                 `json:"sourceUrl"`
}

func (s *McpService) AddServer(req AddMcpServerRequest) (*models.McpServer, error) {
	if req.Command == "" {
		return nil, errors.ErrMcpConfigInvalid
	}

	existing, _ := s.repo.Mcp.GetServerByName(req.Name)
	if existing != nil {
		return nil, errors.ErrMcpAlreadyExists
	}

	server := &models.McpServer{
		Name:         req.Name,
		Description:  req.Description,
		Command:      req.Command,
		Args:         models.StringList(req.Args),
		Env:          models.JSONMap(req.Env),
		SourceType:   constants.McpSourceType(req.SourceType),
		SourceURL:    req.SourceURL,
		EnabledTools: models.StringList{},
		Status:       constants.McpServerEnabled,
	}

	if server.SourceType == "" {
		server.SourceType = constants.McpSourceManual
	}

	if err := s.repo.Mcp.CreateServer(server); err != nil {
		return nil, fmt.Errorf("failed to create MCP server: %w", err)
	}
	s.activity.Record("install", server.Name, "mcp", "", "Added MCP server: "+server.Command)
	return server, nil
}

func (s *McpService) UpdateServer(id string, req AddMcpServerRequest) (*models.McpServer, error) {
	server, err := s.repo.Mcp.GetServerByID(id)
	if err != nil {
		return nil, errors.ErrMcpNotFound
	}

	server.Name = req.Name
	server.Description = req.Description
	server.Command = req.Command
	server.Args = models.StringList(req.Args)
	server.Env = models.JSONMap(req.Env)

	if err := s.repo.Mcp.UpdateServer(server); err != nil {
		return nil, err
	}
	return server, nil
}

func (s *McpService) DeleteServer(id string) error {
	server, err := s.repo.Mcp.GetServerByID(id)
	if err == nil && server != nil {
		s.activity.Record("delete", server.Name, "mcp", "", "Deleted MCP server")
	}
	return s.repo.Mcp.DeleteServer(id)
}

func (s *McpService) EnableForTool(id string, toolName string) error {
	server, err := s.repo.Mcp.GetServerByID(id)
	if err != nil {
		return errors.ErrMcpNotFound
	}
	for _, t := range server.EnabledTools {
		if t == toolName {
			return nil
		}
	}
	server.EnabledTools = append(server.EnabledTools, toolName)
	return s.repo.Mcp.UpdateServer(server)
}

func (s *McpService) DisableForTool(id string, toolName string) error {
	server, err := s.repo.Mcp.GetServerByID(id)
	if err != nil {
		return errors.ErrMcpNotFound
	}
	filtered := make(models.StringList, 0, len(server.EnabledTools))
	for _, t := range server.EnabledTools {
		if t != toolName {
			filtered = append(filtered, t)
		}
	}
	server.EnabledTools = filtered
	return s.repo.Mcp.UpdateServer(server)
}

func (s *McpService) DiscoverTools(id string) ([]models.McpTool, error) {
	server, err := s.repo.Mcp.GetServerByID(id)
	if err != nil {
		return nil, errors.ErrMcpNotFound
	}

	s.repo.Mcp.DeleteToolsByServerID(id)

	discovered, err := s.discoverToolsFromServer(server)
	if err != nil {
		return nil, fmt.Errorf("failed to discover tools: %w", err)
	}

	for i := range discovered {
		discovered[i].ServerID = id
		if err := s.repo.Mcp.CreateTool(&discovered[i]); err != nil {
			continue
		}
	}

	return discovered, nil
}

type mcpRequest struct {
	JSONRPC string        `json:"jsonrpc"`
	ID      int           `json:"id"`
	Method  string        `json:"method"`
	Params  mcpInitParams `json:"params"`
}

type mcpInitParams struct {
	ProtocolVersion string          `json:"protocolVersion"`
	Capabilities    mcpCapabilities `json:"capabilities"`
	ClientInfo      mcpClientInfo   `json:"clientInfo"`
}

type mcpCapabilities struct{}

type mcpClientInfo struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

type mcpToolsRequest struct {
	JSONRPC string      `json:"jsonrpc"`
	ID      int         `json:"id"`
	Method  string      `json:"method"`
	Params  interface{} `json:"params"`
}

type mcpResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      int             `json:"id"`
	Result  json.RawMessage `json:"result,omitempty"`
	Error   *mcpError       `json:"error,omitempty"`
}

type mcpError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type mcpToolsResult struct {
	Tools []mcpToolDef `json:"tools"`
}

type mcpToolDef struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	InputSchema map[string]interface{} `json:"inputSchema"`
}

func (s *McpService) discoverToolsFromServer(server *models.McpServer) ([]models.McpTool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	args := make([]string, len(server.Args))
	for i, a := range server.Args {
		args[i] = string(a)
	}

	cmd := exec.CommandContext(ctx, server.Command, args...)

	env := os.Environ()
	for k, v := range server.Env {
		env = append(env, fmt.Sprintf("%s=%v", k, v))
	}
	cmd.Env = env

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdin pipe: %w", err)
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdout pipe: %w", err)
	}

	if err = cmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start MCP server: %w", err)
	}
	defer func() {
		stdin.Close()
		cmd.Process.Kill()
		cmd.Wait()
	}()

	writer := bufio.NewWriter(stdin)

	initReq := mcpRequest{
		JSONRPC: "2.0",
		ID:      1,
		Method:  "initialize",
		Params: mcpInitParams{
			ProtocolVersion: "2024-11-05",
			Capabilities:    mcpCapabilities{},
			ClientInfo:      mcpClientInfo{Name: "aether-dock", Version: "1.0.0"},
		},
	}
	initBytes, _ := json.Marshal(initReq)
	fmt.Fprintf(writer, "Content-Length: %d\r\n\r\n%s", len(initBytes), initBytes)
	writer.Flush()

	reader := bufio.NewReader(stdout)
	_, err = readMcpMessage(reader)
	if err != nil {
		return nil, fmt.Errorf("initialize failed: %w", err)
	}

	initializedNotif := map[string]interface{}{
		"jsonrpc": "2.0",
		"method":  "notifications/initialized",
	}
	notifBytes, _ := json.Marshal(initializedNotif)
	fmt.Fprintf(writer, "Content-Length: %d\r\n\r\n%s", len(notifBytes), notifBytes)
	writer.Flush()

	toolsReq := mcpToolsRequest{
		JSONRPC: "2.0",
		ID:      2,
		Method:  "tools/list",
		Params:  struct{}{},
	}
	toolsBytes, _ := json.Marshal(toolsReq)
	fmt.Fprintf(writer, "Content-Length: %d\r\n\r\n%s", len(toolsBytes), toolsBytes)
	writer.Flush()

	msgBytes, err := readMcpMessage(reader)
	if err != nil {
		return nil, fmt.Errorf("tools/list failed: %w", err)
	}

	var resp mcpResponse
	if err := json.Unmarshal(msgBytes, &resp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	if resp.Error != nil {
		return nil, fmt.Errorf("MCP error: %s", resp.Error.Message)
	}

	var toolsResult mcpToolsResult
	if err := json.Unmarshal(resp.Result, &toolsResult); err != nil {
		return nil, fmt.Errorf("failed to parse tools result: %w", err)
	}

	tools := make([]models.McpTool, 0, len(toolsResult.Tools))
	for _, td := range toolsResult.Tools {
		tool := models.McpTool{
			Name:        td.Name,
			Description: td.Description,
			InputSchema: models.JSONMap(td.InputSchema),
		}
		tools = append(tools, tool)
	}

	return tools, nil
}

func readMcpMessage(reader *bufio.Reader) ([]byte, error) {
	header, err := reader.ReadString('\n')
	if err != nil {
		return nil, fmt.Errorf("failed to read header: %w", err)
	}
	header = strings.TrimSpace(header)

	var contentLength int
	fmt.Sscanf(header, "Content-Length: %d", &contentLength)

	_, err = reader.ReadString('\n')
	if err != nil {
		return nil, fmt.Errorf("failed to read separator: %w", err)
	}

	buf := make([]byte, contentLength)
	_, err = reader.Read(buf)
	if err != nil {
		return nil, fmt.Errorf("failed to read body: %w", err)
	}

	return buf, nil
}
