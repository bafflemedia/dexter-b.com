# Notion Access Policy

## Purpose

This repo may use AI coding agents to inspect and modify code that connects to Notion.

The agents may help create, review, and modify:
- Express API routes
- Notion schema mappers
- documentation
- environment variable templates
- controlled Notion scripts
- BATS implementation plans

## Hard Rules

1. React must never call the Notion API directly.
2. Notion tokens must never be exposed in frontend code.
3. Notion database IDs should remain server-side unless intentionally documented for setup.
4. Never commit `.env`, `.env.local`, secrets, passwords, JWT secrets, API keys, or Notion tokens.
5. Never log passwords, tokens, or private credentials.
6. BATS data should be treated as internal.
7. Public product and affiliate content belongs in Dexter_B_Web_Manifest, not BATS.
8. Default deletion behavior should be archive/soft-delete, not hard delete.
9. AI agents must not perform broad Notion cleanup without explicit user approval.
10. AI agents should prefer small, reviewable changes.

## Permitted AI/Notion Actions

Allowed with approval:
- inspect selected database schemas
- compare Notion schema to repo docs
- create or update documentation pages
- create test records in a sandbox/test database
- create controlled scripts for Notion API operations
- update BATS records through approved API routes

Not allowed without explicit approval:
- deleting Notion records
- bulk editing databases
- changing database property types
- renaming production databases
- moving large workspace sections
- modifying financial records
- altering QuickBooks-related references
