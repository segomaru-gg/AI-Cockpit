# BluePrint AI Import Schema

This document defines the JSON structure that BluePrint's `ingest-plan` script accepts. External AIs (like ChatGPT) should generate plans in this format.

## JSON Structure

```json
{
  "target_project": "ProjectName", // Required. Must match a folder name in AI-Cockpit (e.g., "Oduman", "BluePrint")
  "goal": {
    "title": "Goal Title",         // Optional. If provided, updates or creates the active goal.
    "deadline": "YYYY-MM-DD",      // Optional.
    "progress": 0                  // Optional.
  },
  "phase": {
    "name": "Phase Name",          // Required if tasks are phase-specific.
    "deadline": "YYYY-MM-DD",      // Optional.
    "status": "active"             // Optional. Default: "active"
  },
  "tasks": [                       // Required. List of tasks.
    // Format A: Simple String
    "Task title only",
    
    // Format B: Detailed Object
    {
      "title": "Task Title",       // Required
      "priority": "high",          // Optional: low, medium, high
      "status": "pending",         // Optional: pending, doing, done
      "content": "Detailed description or checklist..." // Optional
    }
  ]
}
```

## YAML Structure (Alternative)

```yaml
target_project: Oduman
goal:
  title: MVP Launch
  deadline: 2026-03-31
phase:
  name: Phase 1: Foundation
tasks:
  - Setup Supabase
  - title: Initialize Repository
    priority: high
    content: Use Next.js 14 and Tailwind.
```

## Logic
1. **Project Resolution**: The script looks for `target_project` in the specific alias list or folder names.
2. **Goal/Phase Handling**:
   - If `goal` is provided, it updates `goal.yaml`.
   - If `phase` is provided, it creates a new phase directory (slugified name) and `phase.yaml`.
3. **Task Ingestion**:
   - Tasks are appended to the phase's `tasks/` directory (as individual files) or `task.md`.
   - If no phase is specified, tasks go to the project's root `task.md`.
