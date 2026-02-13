# It's My Birthday

> **Party planner and RSVP hub for Omar's 50th birthday**

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/2076/mybirthday.myx.is)

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Cloudflare Workers |
| **Framework** | Hono v4 |
| **Database** | Cloudflare D1 (SQLite) |
| **Storage** | Cloudflare R2 |
| **Images** | Cloudflare Images (optional) |
| **Search** | Cloudflare Vectorize (optional) |
| **AI** | Workers AI / Gemini (optional) |
| **CSS** | Tailwind CSS v4 |
| **Language** | TypeScript (strict) |
| **Testing** | Vitest + Playwright |
| **Linting** | ESLint 9 + Prettier |
| **Git Hooks** | Husky + lint-staged |
| **CI/CD** | GitHub Actions + Claude Code Action |
| **AI Assistant** | Claude Code with 13 MCP servers |

---

## Prerequisites

### System Requirements

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org/) |
| **npm** | v9+ | Comes with Node.js |
| **Git** | v2.30+ | [git-scm.com](https://git-scm.com/) |
| **Wrangler CLI** | v4+ | `npm install -g wrangler` |
| **Claude Code** | Latest | `npm install -g @anthropic-ai/claude-code` |

### Optional Tools

| Tool | Purpose | Install |
|------|---------|---------|
| **Python 3.10+** | Required for Serena plugin (LSP) | [python.org](https://www.python.org/) |
| **uv** | Python package runner (for icelandic-morphology MCP) | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| **gh** | GitHub CLI (for PR automation) | `brew install gh` or [cli.github.com](https://cli.github.com/) |
| **Docker** | For Docker MCP server | [docker.com](https://www.docker.com/) |

### Accounts Required

| Account | Purpose | Sign Up |
|---------|---------|---------|
| **Cloudflare** | Workers, D1, R2, KV | [dash.cloudflare.com](https://dash.cloudflare.com/sign-up) |
| **GitHub** | Repository, Actions, MCP | [github.com](https://github.com/) |
| **Anthropic** | Claude Code CLI | [console.anthropic.com](https://console.anthropic.com/) |

---

## Quick Start

### 1. Clone & Install

```bash
# Clone the template
git clone https://github.com/2076/mybirthday.myx.is.git my-project
cd my-project

# Install dependencies
npm install
```

### 2. Configure Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Copy config templates
cp wrangler.toml.example wrangler.toml
cp .env.example .env

# Create Cloudflare resources
npx wrangler d1 create my-database
npx wrangler r2 bucket create my-bucket

# Update wrangler.toml with the IDs from the commands above
```

### 3. Set Secrets

```bash
# Required secrets
npx wrangler secret put JWT_SECRET
npx wrangler secret put ADMIN_PASSWORD

# Generate a secure JWT secret
openssl rand -base64 32
```

### 4. Development

```bash
# Generate TypeScript types from wrangler bindings
npm run cf-typegen

# Build Tailwind CSS
npm run build:css

# Start local development server
npm run dev
# Opens http://localhost:8787
```

### 5. Deploy

```bash
# Apply database migrations first
npx wrangler d1 execute its_my_birthday_db --remote --file=migrations/0001_init.sql

# Deploy worker
npx wrangler deploy
```

### One-Click Deploy

Use the button at the top of this README, or:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/2076/mybirthday.myx.is)

This will:
1. Fork the repository to your GitHub account
2. Create a Cloudflare Workers project
3. Set up CI/CD with GitHub Actions
4. Deploy the worker automatically

After one-click deploy, you still need to:
- Create D1 database and R2 bucket manually
- Set secrets via `wrangler secret put`
- Update `wrangler.toml` with resource IDs
- Replace `YOUR_VALUE` values in `CLAUDE.md`

---

## Claude Code Setup

This template comes pre-configured with Claude Code plugins, MCP servers, rules, skills, and agents.

### Installing Claude Code

```bash
# Install Claude Code CLI globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version

# Authenticate (opens browser)
claude auth login
```

### Plugin Setup

Plugins are defined in `.claude/settings.json` and activate automatically when Claude Code runs in this project.

#### Core Plugins (included)

| Plugin | Purpose | Requires |
|--------|---------|----------|
| **Serena** | Symbol-level code navigation via LSP | Python 3.10+ |
| **Context7** | Up-to-date library documentation | Nothing extra |
| **TypeScript LSP** | TypeScript language server | Nothing extra |
| **Playwright** | Browser automation & E2E testing | Chromium (auto-installs) |
| **Frontend Design** | UI/UX design assistance | Nothing extra |
| **PR Review Toolkit** | Automated pull request reviews | Nothing extra |
| **Sentry** | Error tracking integration | Sentry account |
| **HuggingFace Skills** | ML model & dataset integration | HuggingFace account |
| **Greptile** | Codebase search & indexing | Nothing extra |
| **Superpowers** | Extended Claude Code capabilities | Nothing extra |

#### Third-Party Plugins

| Plugin | Source | Purpose |
|--------|--------|---------|
| **docs-cleaner** | @daymade-skills | Documentation cleanup |
| **skill-creator** | @daymade-skills | Create custom skills |
| **code-history-finder** | @daymade-skills | Browse Claude Code history files |

#### Enabling/Disabling Plugins

Edit `.claude/settings.json`:

```json
{
  "enabledPlugins": {
    "serena@claude-plugins-official": true,
    "context7@claude-plugins-official": true,
    "playwright@claude-plugins-official": false
  }
}
```

Or toggle in Claude Code:

```bash
# List available plugins
claude plugins list

# Enable a plugin
claude plugins enable serena

# Disable a plugin
claude plugins disable sentry
```

---

### Serena Setup (Symbol-Level Code Navigation)

Serena provides intelligent code navigation using Language Server Protocol (LSP). It enables Claude to find symbols, references, and navigate your codebase semantically instead of just text search.

#### Prerequisites

```bash
# Serena requires Python 3.10+
python3 --version  # Must be 3.10 or higher

# Install pip if not present
python3 -m ensurepip --upgrade
```

#### How Serena Works

Once enabled in `.claude/settings.json`, Serena automatically:

1. **Detects your project language** (TypeScript, Python, etc.)
2. **Starts an LSP server** in the background
3. **Provides symbolic tools** to Claude Code:

| Tool | Purpose | Example |
|------|---------|---------|
| `find_symbol` | Find any symbol by name | Find class `UserService` |
| `get_symbols_overview` | List all symbols in a file | See all exports in `index.ts` |
| `find_referencing_symbols` | Find where a symbol is used | Who calls `createUser()`? |
| `replace_symbol_body` | Replace a function/class body | Rewrite `handleLogin()` |
| `insert_after_symbol` | Add code after a symbol | Add method to class |
| `rename_symbol` | Rename across entire codebase | Rename `userId` to `user_id` |
| `search_for_pattern` | Regex search in codebase | Find all `TODO` comments |

#### Serena Configuration

Serena creates a `.serena/` directory in your project on first use. You can configure it with:

```bash
# Project-level config (optional)
mkdir -p .serena
```

Serena supports memories that persist across sessions. It writes to `.serena/memories/` to remember patterns, conventions, and project-specific context.

#### Activating a Project in Serena

When starting Claude Code in a new project, Serena may need to be activated:

```
# Claude Code will automatically run:
# serena.activate_project("/path/to/your/project")
# serena.check_onboarding_performed()
```

If onboarding hasn't been performed, Serena will guide through initial setup (analyzing the codebase structure, identifying languages, etc.).

#### Troubleshooting Serena

| Issue | Solution |
|-------|----------|
| "Python not found" | Install Python 3.10+: `brew install python@3.12` |
| "LSP server failed" | Check TypeScript is installed: `npm install` |
| Symbols not found | Run `npm run cf-typegen` to generate types |
| Slow first run | Normal - LSP needs to index the project |

---

### MCP Servers Setup

MCP (Model Context Protocol) servers extend Claude Code with external service integrations. They are configured in `.claude/mcp-config.json`.

#### Cloudflare MCP Suite (7 servers)

These connect Claude directly to your Cloudflare account:

| Server | Purpose | Requires |
|--------|---------|----------|
| `cloudflare-bindings` | D1, R2, KV, Workers AI, Vectorize | Account ID + API Token |
| `cloudflare-docs` | Search Cloudflare documentation | Nothing |
| `cloudflare-builds` | Deploy and build management | Account ID + API Token |
| `cloudflare-observability` | Logs, analytics, monitoring | Account ID + API Token |
| `cloudflare-ai-gateway` | AI Gateway management | Account ID + API Token |
| `cloudflare-graphql` | GraphQL API access | Account ID + API Token |
| `cloudflare-radar` | Internet insights & trends | Nothing |

**Setup:**

```bash
# 1. Get your Cloudflare Account ID from the dashboard
#    https://dash.cloudflare.com → Overview → Account ID

# 2. Create an API token
#    https://dash.cloudflare.com/profile/api-tokens
#    Use the "Edit Cloudflare Workers" template

# 3. Set environment variables
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_API_TOKEN="your-api-token"
```

#### Third-Party MCP Servers

| Server | Purpose | Environment Variables |
|--------|---------|---------------------|
| `github` | Issues, PRs, repos | `GITHUB_TOKEN`, `SMITHERY_KEY` |
| `airtable` | Database operations | `AIRTABLE_API_KEY`, `SMITHERY_KEY` |
| `supabase` | Database & auth | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `railway` | Deployments | `RAILWAY_TOKEN` |
| `docker` | Container management | `SMITHERY_KEY` |
| `icelandic-morphology` | BIN word inflections | None (requires `uv`) |

**Setup for Smithery-based servers:**

```bash
# Get a Smithery API key from https://smithery.ai
export SMITHERY_KEY="your-smithery-key"
export SMITHERY_PROFILE="your-profile"

# GitHub-specific
export GITHUB_TOKEN="ghp_your_github_token"
```

**Setup for icelandic-morphology (requires uv):**

```bash
# Install uv (Python package runner)
curl -LsSf https://astral.sh/uv/install.sh | sh

# The server auto-installs via uvx on first use
```

#### Removing Unused MCP Servers

Edit `.claude/mcp-config.json` and delete servers you don't need:

```json
{
  "mcpServers": {
    "cloudflare-bindings": { ... },
    "cloudflare-docs": { ... }
  }
}
```

> **Important:** Never hardcode API keys in `mcp-config.json`. Always use `${ENV_VAR}` syntax.

---

### Permissions Setup

Copy the example permissions file to customize what Claude Code can do automatically:

```bash
cp .claude/settings.local.json.example .claude/settings.local.json
```

The default permissions allow:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(git:*)",
      "Bash(wrangler:*)",
      "Bash(curl:*)",
      "WebSearch",
      "mcp__cloudflare__*",
      "mcp__github__*"
    ]
  }
}
```

> **Note:** `.claude/settings.local.json` is gitignored and specific to your machine.

---

## Project Structure

```
mybirthday.myx.is/
├── src/
│   ├── index.ts              # Main worker entry (Hono app)
│   ├── routes/               # API route handlers
│   ├── pages/                # HTML page generators
│   ├── services/             # Business logic
│   ├── components/           # Reusable UI components
│   └── utils/                # Helper functions
├── migrations/               # D1 SQL migrations
├── public/                   # Static assets (CSS, icons)
├── scripts/                  # Utility scripts
├── tests/                    # Test suites
│   ├── unit/                 # Unit tests (Vitest)
│   ├── integration/          # Integration tests
│   └── e2e/                  # E2E tests (Playwright)
├── .claude/                  # Claude Code configuration
│   ├── settings.json         # Enabled plugins
│   ├── mcp-config.json       # MCP server connections
│   ├── rules/                # 35+ development rules
│   ├── skills/               # 7 reusable skills
│   ├── Agents/               # 5 specialized AI agents
│   └── commands/             # 5 slash commands
├── .github/workflows/        # CI/CD pipelines
│   ├── claude.yml            # @claude mention trigger
│   ├── claude-code-review.yml # Auto PR reviews
│   └── auto-fix-issues.yml   # Issue → PR automation
├── wrangler.toml.example     # Cloudflare config template
├── .env.example              # Environment variables template
├── CLAUDE.md                 # AI assistant instructions
├── tsconfig.json             # TypeScript config
└── package.json
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development server (port 8787) |
| `npm run build` | Build CSS + worker |
| `npm run build:css` | Compile Tailwind CSS |
| `npm run deploy` | Deploy worker to Cloudflare |
| `npm run deploy:pages` | Build & deploy to Cloudflare Pages |
| `npm run cf-typegen` | Generate TS types from wrangler bindings |
| `npm run typecheck` | TypeScript type validation |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Prettier formatting |
| `npm run test` | Run all tests (Vitest) |
| `npm run test:watch` | Watch mode tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests only |
| `npm run test:coverage` | Coverage report |
| `npm run test:e2e` | E2E tests (Playwright) |
| `npm run test:e2e:ui` | E2E with Playwright UI |
| `npm run db:backup` | Export D1 database to SQL |

---

## Claude Code Integration

### Rules (`.claude/rules/`)

35+ development rules that Claude Code follows automatically:

| Category | Rules |
|----------|-------|
| **Core** | golden-rules, confirmation-workflow, database-order, timing-safe-comparison |
| **Cloudflare** | workers-assets, pages-build, pages-limits, cron |
| **Security** | timing-safe-comparison, html-content-escaping, hono-csrf-exemptions |
| **UI/Frontend** | mobile-touch-targets, tailwind-production, modal-close-handlers |
| **Database** | database-order, api-pagination-response, naming-conventions |
| **Auth** | google-oauth-integration, auth0-hybrid-migration |
| **Icelandic** | icelandic-ui, icelandic-onclick-escaping |

### Skills (`.claude/skills/`)

Reusable commands available as `/skill-name`:

| Skill | Command | Purpose |
|-------|---------|---------|
| check-types | `/check-types` | Run TypeScript type checking |
| db-backup | `/db-backup` | Backup D1 database |
| deploy-all | `/deploy-all` | Deploy all workers |
| test-critical | `/test-critical` | Run critical path tests |
| icelandic-grammar | `/icelandic-grammar` | Review Icelandic text via Yfirlestur.is |

### Agents (`.claude/Agents/`)

| Agent | Purpose |
|-------|---------|
| api-method-checker | Verify API methods match documentation |
| code-example-validator | Validate code examples work |
| content-accuracy-auditor | Compare docs vs official sources |
| version-checker | Check package version references |
| icelandic-reviewer | Review Icelandic grammar & spelling |

### GitHub Actions

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `claude.yml` | `@claude` mention in issues/PRs | Claude responds to mentions |
| `claude-code-review.yml` | PR opened/updated | Automated code review |
| `auto-fix-issues.yml` | Issue labeled `claude-fix` | Auto-generate fix PRs |

**Required GitHub Secrets:**

```
CLAUDE_CODE_OAUTH_TOKEN  # For Claude Code Action
ANTHROPIC_API_KEY        # For Claude API (issue automation)
CF_API_TOKEN             # For Cloudflare deployment
```

---

## Template Usage

### 1. Create Your Project

```bash
# Option A: Use GitHub template button
# Click "Use this template" on the GitHub repo page

# Option B: Clone manually
git clone https://github.com/2076/mybirthday.myx.is.git my-project
cd my-project
rm -rf .git
git init
```

### 2. Replace Placeholders

Find and replace all `YOUR_VALUE` values in:

| File | Placeholders |
|------|-------------|
| `package.json` | `PROJECT_NAME`, `PROJECT_DESCRIPTION`, `GITHUB_ORG`, `REPO_NAME`, `DOMAIN` |
| `wrangler.toml.example` | `WORKER_NAME`, `D1_DATABASE_NAME`, `D1_DATABASE_ID`, `R2_BUCKET_NAME` |
| `.env.example` | All `{{...}}` values |
| `CLAUDE.md` | All `{{...}}` values (project metadata, domains, resources) |
| `README.md` | `PROJECT_NAME`, `PROJECT_DESCRIPTION`, `GITHUB_ORG`, `REPO_NAME` |

### 3. Set Up Cloudflare Resources

```bash
# Login
wrangler login

# Create D1 database
npx wrangler d1 create my-database
# Copy the database_id to wrangler.toml

# Create R2 bucket
npx wrangler r2 bucket create my-bucket

# Create KV namespace (optional)
npx wrangler kv namespace create MY_KV
```

### 4. Configure Environment

```bash
# Copy templates
cp wrangler.toml.example wrangler.toml
cp .env.example .env

# Set production secrets
npx wrangler secret put JWT_SECRET
npx wrangler secret put ADMIN_PASSWORD

# Set MCP environment variables in .env
# CLOUDFLARE_ACCOUNT_ID=...
# CLOUDFLARE_API_TOKEN=...
```

### 5. Set Up Claude Code

```bash
# Copy permissions template
cp .claude/settings.local.json.example .claude/settings.local.json

# Start Claude Code - plugins auto-activate
claude

# Serena will onboard on first run (analyzes project)
```

### 6. Configure GitHub Actions

Add these secrets to your GitHub repository (Settings → Secrets):

| Secret | How to Get |
|--------|-----------|
| `CLAUDE_CODE_OAUTH_TOKEN` | [Claude Code Action docs](https://github.com/anthropics/claude-code-action) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |
| `CF_API_TOKEN` | [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) |

### 7. Start Building!

```bash
npm run dev
```

---

## Environment Variables Reference

See `.env.example` for the full list. Key variables:

| Variable | Required | Purpose |
|----------|----------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account identifier |
| `CLOUDFLARE_API_TOKEN` | Yes | API access for MCP servers & deployment |
| `JWT_SECRET` | Yes | JWT signing key (32+ chars) |
| `ADMIN_PASSWORD` | Yes | Admin access password |
| `SMITHERY_KEY` | For MCP | Smithery API key for third-party MCP servers |
| `GITHUB_TOKEN` | For MCP | GitHub personal access token |
| `GEMINI_API_KEY` | Optional | Google Gemini AI integration |
| `ANTHROPIC_API_KEY` | Optional | Claude API for GitHub Actions |

---

## License

MIT - [2076 ehf](https://2076.is)

---

**Built with Cloudflare Workers + Claude Code by 2076 ehf**
