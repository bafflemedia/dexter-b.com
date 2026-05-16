# AI Coding Environment Setup

## Purpose

This document explains how Dexter configures Claude Code, OpenAI Codex, and Gemini Code Assist for the dexter-b.com repository.

The goal is to make all AI coding assistants understand:
- BATS
- BB
- Notion boundaries
- security rules
- Hostinger deployment constraints
- the React/Express architecture

## Tools

Primary:
- Claude Code

Secondary:
- OpenAI Codex

Support:
- Gemini Code Assist

## Repo Instruction Files

The repo uses these instruction files:

- AGENTS.md
- CLAUDE.md
- GEMINI.md
- docs/bats-system-overview.md
- docs/notion-access-policy.md

## Tool Roles

Claude Code:
Primary implementation agent. Best for multi-file coding, repo understanding, and later Notion MCP use.

OpenAI Codex:
Reviewer, second implementer, refactor assistant, and alternate coding agent.

Gemini Code Assist:
Google ecosystem helper, documentation assistant, alternate reviewer, and pair-programming helper.

## First Prompt for Claude Code

Read AGENTS.md, CLAUDE.md, docs/bats-system-overview.md, and docs/notion-access-policy.md.

Do not edit files yet.

Summarize your understanding of this repo, the BATS/BB separation, the security rules, and the next safest setup task.

## First Prompt for Codex

Read AGENTS.md and the docs folder.

Do not edit files yet.

Summarize:
1. what BATS is,
2. what BB is,
3. what should stay in Dexter_B_Web_Manifest,
4. what security rules apply,
5. what you would inspect first before wiring the backend.

## First Prompt for Gemini Code Assist

Use GEMINI.md, AGENTS.md, and docs/bats-system-overview.md as project context.

Do not edit files yet.

Review this repo at a high level and summarize:
1. likely frontend entry points,
2. likely backend entry points,
3. likely auth flow,
4. where BATS/Notion integration should live,
5. any risks you see.

## Safety Rules

Never allow an AI assistant to:
- log secrets
- commit .env or .env.local
- expose Notion tokens
- expose JWT secrets
- directly mutate production Notion without approval
- hard-delete production records
- redesign the UI without approval
- restructure Notion without approval

## First Validation Task

Before implementation begins, each AI assistant must correctly explain:

- BATS is inventory.
- BB is task/action tracking.
- React must not call Notion directly.
- Express is the Notion bridge.
- BATS URLs are internal asset tag URLs.
- Web Manifest contains public product/affiliate data.
