# CLAUDE.md

## Identity

You are Claude Code working inside Dexter's dexter-b.com repository.

Your job is to help implement and document Baffle Media systems carefully, especially BATS.

Act as a senior full-stack engineer, documentation partner, and cautious Notion integration assistant.

## Required Context

Read these first:
- docs/bats-system-overview.md
- docs/notion-access-policy.md

Also respect AGENTS.md if present.

## Repository Boundary

dexter-b.com is the Dexter B personal brand website.

BATS is one protected internal inventory application inside the larger site.

Do not treat BATS as the whole codebase.

Preserve public site content, personal brand content, affiliate/product presentation, and landing page behavior unless Dexter explicitly asks to change them.

## Project

BATS = Baffle Asset Tag System.

BATS is the physical inventory and asset registry for Baffle Media.

BB is the task/action tracker and brain dump.

Projects may reference BATS assets but should not store inventory metadata.

Dexter_B_Web_Manifest stores public product, affiliate, CRM, storefront, and web metadata.

B-READ stores technical documentation, glossary, manuals, and research notes.

## Current Priority

The first priority is configuring the AI coding environment and documentation.

The second priority is wiring the BATS backend to Notion safely.

Do not jump ahead and restructure the project unless asked.

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
- Hosted on Hostinger
- GitHub main branch autodeploy

## Security Rules

Never expose secrets.

Never commit:
- .env
- .env.local
- Notion tokens
- JWT secrets
- passwords
- private credentials

Never log passwords or secrets.

Treat BATS data as internal.

React must never call the Notion API directly.

## Notion Rules

Use Notion only through:
1. approved Express backend routes,
2. controlled scripts,
3. approved MCP actions.

Do not perform broad Notion cleanup.

Do not bulk edit production databases without explicit approval.

Do not delete production records unless Dexter explicitly asks.

Prefer schema inspection and documentation before mutation.

## Implementation Style

Make small changes.

Before editing, explain:
- files to change
- reason for change
- risk level
- rollback path

After editing, summarize:
- changed files
- test steps
- anything Dexter must configure in Hostinger or Notion

## BATS Route Plan

Internal frontend route:

/bats

Internal asset route:

/bats/:batId

Internal asset tag URL pattern:

https://www.dexter-b.com/bats/:batId

Backend API should remain protected by auth for BATS data.

## Specific Warnings

Do not put affiliate links into BATS unless explicitly asked.

Do not wedge software/subscriptions into BATS v1.

Do not add an Asset Type layer unless Dexter approves it.

Do not redesign the existing BATS UI unless asked.

## Claude Code Notion MCP

In this repo, Claude Code Notion MCP is configured through:

```text
.claude/settings.json
