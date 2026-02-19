# BluePrint OS

**AI-Cockpit Master Control System**

BluePrint is the "OS" for the Antigravity workspace, managing goals, phases, and tasks across multiple projects (Oduman, aeternum, BoaBASE, etc.).

## 🚀 Key Features

### 1. Dashboard
The central command center for all projects.
- **URL**: `http://localhost:4321/`
- **Features**: Global Progress, Phase Status, Domain Filters, Activity Heatmap.

### 2. Focus Mode (Mobile PWA)
A distracted-free interface for "doing" tasks. Optimized for iPhone.
- **URL**: `http://localhost:4321/focus`
- **Install**: Open in Safari on iPhone -> "Add to Home Screen".
- **Usage**: Shows the current active task. Click "Complete" to mark it done.

### 3. AI Context Pipeline (Phase 14)
A mechanism to ingest plans created by external AIs (ChatGPT, etc.).

#### Step 1: Configure ChatGPT
Copy the contents of [`docs/chatgpt-instructions.md`](docs/chatgpt-instructions.md) into your ChatGPT "Custom Instructions" or "Project Instructions". 
This teaches ChatGPT to output plans in the correct JSON format.

#### Step 2: Generate Plan
Ask ChatGPT: *"Create a plan for Oduman MVP launch."*
It will output a JSON code block.

#### Step 3: Ingest Plan
Save the JSON to a file (e.g., `plan.json`) and run:
```sh
node scripts/ingest-plan.js plan.json
```
This will:
- Identify the target project.
- Create/Update Goal and Phases.
- Generate task files in `tasks/` or `task.md`.

## 📂 Project Structure
```text
/
├── dashboard/      # Legacy dashboard (html)
├── docs/           # Documentation & Schemas
├── goals/          # Structured Goal/Phase YAMLs
├── journal/        # Daily logs
├── scripts/        # Automation scripts (ingest, bot, etc.)
├── src/            # Astro Dashboard Source
│   ├── pages/      # Routes (index, focus)
│   └── lib/        # Core Logic (projects.ts)
└── blueprint.yaml  # Project Metadata
```

## 🧞 Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start Dashboard & Focus Mode |
| `node scripts/ingest-plan.js <file>` | Import AI Plan |
| `node scripts/discord-bot.js` | Start Discord Interface |

