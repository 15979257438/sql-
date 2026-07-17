---
name: github-push
description: 将当前项目上传到指定 GitHub 仓库的完整流程
metadata:
  type: project
---

# GitHub 推送 Skill

这个 skill 用于将当前项目完整上传到用户指定的 GitHub 仓库，包括仓库初始化、忽略规则、README、LICENSE、提交与推送。

## 使用前提

- 用户已拥有 GitHub 账号
- 用户已准备好 GitHub Personal Access Token
- 项目目录在本地可写

## 引导用户获取 Token

如果用户还没有 token，按以下步骤引导：

1. 打开 https://github.com/settings/tokens
2. 点击 **Generate new token → Generate new token (classic)**
3. 勾选 `repo` 权限（完整仓库权限）
4. 生成后复制 token（只显示一次）
5. 将 token 发送给 Claude

## 需要向用户确认的信息

执行前必须收集：

| 信息 | 说明 |
|---|---|
| GitHub 用户名 | 例如 `15979257438` |
| GitHub 邮箱 | 用于 git commit 作者信息 |
| Token | GitHub Personal Access Token |
| 仓库名称 | 新建仓库的名称 |
| 是否开源 | 决定 LICENSE 与 README 风格 |

## 执行步骤

### 1. 检查环境

```bash
git --version
git status || echo "not a git repo"
```

### 2. 创建 GitHub 仓库（通过 GitHub API）

```bash
curl -X POST "https://api.github.com/user/repos" \
  -H "Authorization: token {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"{repo_name}","description":"{description}","private":false,"auto_init":false}'
```

### 3. 清理临时文件

删除不应上传的文件，例如：
- `baidu-screenshot.png`
- `screenshot-baidu.js`
- 其他临时文件

### 4. 创建 .gitignore

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Environment variables
.env

# Logs
*.log

# Editor / OS
.DS_Store
.vscode/
.idea/

# Claude Code local config
.claude/settings.local.json
.claude/notes.md
.claude/memory/
```

### 5. 创建 README.md

README 应包含：
- 项目标题与徽章
- 项目简介
- 功能特性
- 技术栈
- 项目结构
- 快速开始
- 环境变量
- API 概览
- 许可证

### 6. 创建 LICENSE

开源项目默认使用 MIT License。

### 7. 初始化 Git 并提交

```bash
git init
git config user.name "{github_username}"
git config user.email "{user_email}"
git add .
git commit -m "Initial commit"
git branch -M main
```

### 8. 添加远程仓库并推送

```bash
git remote add origin "https://{username}:{token}@github.com/{username}/{repo}.git"
git push -u origin main
```

如果远程仓库已有初始提交导致冲突：
```bash
git push -u origin main --force
```

### 9. 清理 token

推送成功后，立即从 remote URL 中移除 token：
```bash
git remote set-url origin "https://github.com/{username}/{repo}.git"
```

## 安全提醒

每次完成后必须提醒用户：
> 你提供的 GitHub token 已经暴露在这段对话中。push 完成后，建议去 https://github.com/settings/tokens 删除该 token 并重新生成一个新的。

## 故障处理

| 问题 | 解决方案 |
|---|---|
| `remote origin already exists` | `git remote remove origin` 后重新添加 |
| `failed to push some refs` | 远程有内容，使用 `git push -u origin main --force` |
| `not a git repository` | 先执行 `git init` |
| `Problems parsing JSON` | curl 的 `--data` 参数用单行 JSON 格式 |

## 注意事项

1. **使用 API 创建仓库**：不要让用户手动去 GitHub 网页创建仓库，直接调 GitHub API 完成
2. **一次性完成**：提前收集所有信息，确保流程不中断
3. **Token 安全**：推送完成后必须立即清理 token，提醒用户撤销
4. **强制推送**：新建仓库时直接用 `--force`，避免被初始提交阻挡
