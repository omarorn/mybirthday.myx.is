# Serena Project Activation Check

**Purpose:** Ensure Serena is pointed at the correct project before using its tools
**Priority:** P0 (Must do first)
**Applies to:** Any session using Serena MCP tools

---

## Rule: Always Verify Serena's Active Project

Serena runs as a **shared remote SSE server**. The active project persists across sessions and often does NOT match the current working directory.

### Before Using ANY Serena Tool

1. **Call `check_onboarding_performed`** — read the returned memory names
2. **Verify memories match this project:**
   - Check that returned memory names correspond to your current project
   - If memories reference a different project → **WRONG PROJECT**
3. **If wrong project:** Try `activate_project("{{PROJECT_NAME}}")` or notify user

### Quick Check Pattern

```
check_onboarding_performed → look at memory names
  ✅ Memories match current project → correct project is active
  ❌ Memories reference different project → WRONG PROJECT, switch needed
```

### If activate_project Is Unavailable

The tool may not be exposed via SSE transport. User must restart service:
```bash
# SSH to server or run locally
cd /path/to/{{PROJECT_NAME}}
systemctl --user restart serena-mcp.service
```

### Common Mistake

Using Serena tools without checking the active project leads to:
- Reading wrong project's memories
- Searching wrong codebase
- Symbol lookups returning nothing or wrong results
- Wasted time debugging "missing" files

---

**This rule prevents working on the wrong project through Serena.**
