# BATS System Overview

## Project

Repository: bafflemedia/dexter-b.com  
Primary route: /bats  
Primary application: BATS - Baffle Asset Tag System

## Definitions

BATS = Baffle Asset Tag System.  
BATS is the physical inventory and asset registry for Baffle Media.

BB = Baffle Blocks.  
BB is the task/action tracker, brain dump, inbox, and classification system.

Projects = project metadata.  
Projects may reference BATS assets but should not store inventory metadata.

Dexter_B_Web_Manifest = public website, affiliate, product presentation, and CRM-like web metadata.

B-READ = Baffle knowledge base, tech manual, glossary, documentation, and research support.

## Repository Scope

This repository powers dexter-b.com.

dexter-b.com is the Dexter B personal brand website. It includes:
- the public landing page,
- personal brand content,
- public links,
- affiliate/product presentation,
- Dexter B site sections,
- and the protected BATS inventory route.

BATS is one protected application inside the larger dexter-b.com site.

BATS must not be treated as the entire website.

## Current Architecture

Frontend:
- Vite
- React
- TypeScript
- Tailwind CSS
- React Router

Backend:
- Express in server.js
- JWT auth using HttpOnly cookie
- Notion API bridge
- Hosted on Hostinger
- Autodeployed from GitHub main branch

Data Layer:
- Notion databases inside the Baffle Media Teamspace
- React must never call Notion directly
- Express talks to Notion using server-side environment variables

## Current BATS Scope

BATS v1 tracks physical gear only.

Examples:
- cameras
- audio gear
- lighting
- computers
- displays
- networking equipment
- storage devices
- rigging
- accessories
- tools

Software and subscriptions should not be wedged into BATS v1. They may get their own database later.

## Routing

Internal inventory list/capture route:

/bats

Internal asset tag route:

/bats/:batId

Example:

/bats/BM-VIS-001

The full internal asset tag URL pattern should be:

https://www.dexter-b.com/bats/BM-VIS-001

## Public vs Internal Separation

BATS is internal and login-protected.

BATS may contain:
- serial numbers
- receipt links
- cost basis
- warranty details
- private notes
- tax year
- QuickBooks references

Public product pages, affiliate links, public descriptions, slugs, and storefront data belong in Dexter_B_Web_Manifest, not BATS.

## Current Development Priority

First priority:
Configure Claude Code, OpenAI Codex, and Gemini Code Assist in VS Code with correct project instructions.

Second priority:
Use the configured tools to refine the BATS backend, Notion schema mapping, and documentation.

Do not redesign the UI unless explicitly asked.
Do not restructure Notion unless explicitly asked.
Do not add new databases unless the need is proven.
