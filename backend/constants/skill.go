package constants

type SkillStatus string

const (
	SkillStatusInstalled      SkillStatus = "installed"
	SkillStatusUpdateAvailable SkillStatus = "update_available"
	SkillStatusModified       SkillStatus = "modified"
	SkillStatusError          SkillStatus = "error"
	SkillStatusInstalling     SkillStatus = "installing"
)

type SkillSourceType string

const (
	SkillSourceGit         SkillSourceType = "git"
	SkillSourceLocal       SkillSourceType = "local"
	SkillSourceMarketplace SkillSourceType = "marketplace"
)
