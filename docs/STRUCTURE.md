# AI-Cockpit Structure Guide

This repository follows a "Life Operating System" architecture, where distinct domains of life are managed as separate projects under a unified protocol.

## Directory Structure

```text
AI-Cockpit/
├── domains/                 # The core functional areas
│   ├── cockpit-core/        # Central Dashboard (Astro)
│   ├── consulting/          # Business & Strategy
│   │   ├── oduman/          #   └ Oduman (EC / shisha business)
│   │   └── boabase/         #   └ BoaBASE (consulting ops)
│   ├── brand/               # Personal Brand & Portfolio (Aeternum)
│   ├── learning/            # Growth & Studies
│   │   └── toeic/           #   └ TOEIC study tracker
│   └── operations/          # Life Admin & Ops
├── docs/                    # Documentation
│   ├── charter/             # Project charters and mandates
│   └── STRUCTURE.md         # This file
├── config/                  # Configuration files
├── scripts/                 # Sync & maintenance scripts
├── _intake/                 # Mobile notes (from Obsidian)
└── cockpit.yaml             # Global goals & quarter config
```

## The Blueprint Protocol

Each folder in `domains/` is a self-contained "Project" that must contain a `blueprint.yaml` file. This allows the **Cockpit Core** to automatically discover and ingest its data.

### Project Layout
Every domain project should follow this standard:

1.  **`blueprint.yaml`**: Identity file.
    ```yaml
    name: "Consulting"
    id: "consulting"
    category: "business"
    status: "active"
    ```
2.  **`tasks/`**: Task management.
    - Tasks are Markdown files with frontmatter (status, priority).
    - `task.md`: Simple checklist for quick items.
3.  **`journal/`**: Immutable logs.
    - Daily or event-based markdown logs.

## Domain Roles

- **Cockpit Core (cockpit-core)**: The Astro-based web dashboard that aggregates everything. It reads data from sibling directories.
- **Consulting**: Client work, ventures, business planning. Contains sub-projects (Oduman, BoaBASE).
- **Brand**: Public-facing presence, portfolio, and brand identity (Aeternum).
- **Learning**: Skill acquisition, certifications, languages.
- **Operations**: Routine tasks, finances, travel, home maintenance.
