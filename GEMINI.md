# GEMINI.md

## Project Context for Gemini Code Assist

You are helping with the dexter-b.com repository for Baffle Media.

Primary system:
BATS - Baffle Asset Tag System.

BATS is the internal physical inventory and asset registry.

BB is the task/action tracker and brain dump.

Projects store project metadata and may reference BATS assets.

Dexter_B_Web_Manifest stores public web, affiliate, product, CRM-like, and storefront metadata.

B-READ stores technical documentation, manuals, glossary entries, and research support.

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

## Rules

React must not call Notion directly.

Notion secrets and database IDs must stay server-side.

Never expose or log:
- Notion tokens
- JWT secrets
- passwords
- API keys
- private credentials

BATS is internal.

Public product and affiliate metadata belongs in Dexter_B_Web_Manifest, not BATS.

Prefer small, reviewable changes.

Do not redesign the UI unless asked.

Do not restructure Notion unless asked.

## Useful First Tasks

Help review:
- server.js auth flow
- App.tsx protected routing
- /api/bats routes
- Notion schema mapping
- Hostinger deployment compatibility
- documentation clarity
