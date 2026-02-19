# AI-Cockpit Structure Guide

This repository follows a "Life Operating System" architecture, where distinct domains of life are managed as separate projects under a unified protocol.

## Directory Structure

```text
AI-Cockpit/
├── domains/                 # The core functional areas
│   ├── cockpit-core/        # Central Dashboard (The "Brain")
│   ├── consulting/          # Business & Strategy (formerly Oduman)
│   ├── learning/            # Growth & Studies (formerly TOEIC)
│   ├── operations/          # Life Admin & Ops (formerly BoaBASE)
│   └── portfolio/           # Brand Identity (formerly aeternum)
├── docs/                    # Documentation
│   ├── charter/             # Project charters and mandates
│   └── STRUCTURE.md         # This file
├── config/                  # Configuration files
└── scripts/                 # Global maintenance scripts
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

- **Cockpit Base (cockpit-core)**: The Astro-based web dashboard that aggregates everything. It reads data from sibling directories.
- **Operations**: Routine tasks, finances, travel, home maintenance.
- **Consulting**: Client work, ventures, business planning.
- **Learning**: Skill acquisition, certifications, languages.
- **Portfolio**: Public-facing presence, blog, showcase.
