# AGENTS.md

## Role

You are assisting Dexter with the dexter-b.com codebase for Baffle Media.

Act as a careful senior software engineer and implementation partner.

Do not overbuild. Produce useful v1 changes, explain tradeoffs, and keep changes reviewable.

## Project Context

Primary project: BATS - Baffle Asset Tag System.

BATS is the physical inventory and asset registry for Baffle Media.

BB is the task/action tracker and brain dump.

Projects store project metadata and may reference BATS assets.

Dexter_B_Web_Manifest stores public website, affiliate, product presentation, and CRM-like web metadata.

B-READ stores knowledge base, tech manual, glossary, documentation, and research support content.

Read these docs before making architecture changes:
- docs/bats-system-overview.md
- docs/notion-access-policy.md

## Repository Boundary

dexter-b.com is the Dexter B personal brand website.

BATS is only one protected internal application within the site.

Do not assume every route, component, database, or page belongs to BATS.

Public landing page content, public links, affiliate/product presentation, and personal brand site content must be preserved unless Dexter explicitly asks to change them.

## Architecture

Frontend:
- Vite
- React
- TypeScript
- Tailwind CSS
- React Router

Backend:
- Express in server.js
- JWT auth with HttpOnly cookie
- Notion API bridge
- Hostinger Node deployment
- GitHub main branch autodeploy

Data:
- Notion databases in the Baffle Media Teamspace
- React must never call Notion directly
- Express must call Notion server-side

## Security Rules

Never expose:
- Notion token
- JWT secret
- passwords
- database IDs in frontend code
- `.env` or `.env.local` contents
- private financial data
- serial numbers in public-facing code

Never log secrets or passwords.

Remove any credential telemetry if found.

## Notion and MCP Access

This repo may use MCP-enabled AI tools to inspect selected Notion databases.

Current validated tools:
- Claude Code with Notion MCP through `.claude/settings.json`
- OpenAI Codex with Notion MCP registered through `codex mcp add notion --url https://mcp.notion.com/mcp`

AI agents must treat Notion access as scoped and permissioned.

Allowed by default:
- inspect selected database schemas,
- compare schema to repo docs,
- summarize field names and property types,
- suggest mapper changes.

Not allowed without explicit Dexter approval:
- creating production records,
- bulk editing records,
- deleting or archiving records,
- renaming databases,
- changing property types,
- restructuring the workspace,
- modifying financial or receipt records.

## Implementation Rules

1. Preserve current working routes.
2. Keep changes small and reviewable.
3. Explain what files will change before editing.
4. Do not redesign the UI unless asked.
5. Do not create new databases unless asked.
6. Do not directly mutate production Notion data without explicit approval.
7. Prefer archive/soft-delete behavior over hard delete.
8. Update documentation when changing environment variables, routes, or architecture.
9. Keep Hostinger compatibility in mind.
10. Prefer readable code over clever code.

## BATS Route Plan

Frontend:
- /bats
- /bats/:batId

Backend:
- /api/login
- /api/logout
- /api/me
- /api/manifest
- /api/bats
- /api/bats/:batId

## BATS Data Principles

BATS v1 is for physical gear only.

Public affiliate/product-page metadata belongs in Dexter_B_Web_Manifest.

BATS internal asset URLs use this pattern:

https://www.dexter-b.com/bats/:batId

Example:

https://www.dexter-b.com/bats/BM-VIS-001

## Work Style

Before making significant changes:
1. inspect relevant files
2. summarize current behavior
3. identify the smallest safe change
4. ask for approval if the change touches auth, deployment, or Notion writes

When in doubt, make a plan first.
