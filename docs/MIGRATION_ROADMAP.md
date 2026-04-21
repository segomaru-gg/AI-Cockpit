# AI-Cockpit Migration Roadmap (Slow & Live Migration)

## Goal (Post–May State)
- Mac mini runs AI-Cockpit repo continuously
- OpenClaw runs agents persistently
- Inbox auto-processed
- Tasks auto-updated
- Journals generated
- Dashboard auto-refreshed

## Core Principle
Do not rebuild. Gradually add autonomy to an already-running OS.

---

## CURRENT STATE
Static OS + Manual Agents

Git repo          = canonical data layer  
Obsidian Vault    = UI  
rsync sync        = transport  
Astro dashboard   = view  
Human AI actions  = intelligence  

**Target:**
Autonomous OS (persistent agents)

---

## MIGRATION STRATEGY

### Phase 0 — Structure Freeze (Now → March)
**Purpose:** stabilize agent-readable structure

**Actions:**
- Finalize Blueprint protocol layout
- Fix Inbox flow
- Fix tasks/journal granularity
- Fix naming conventions
- Stabilize AGENTS.md
- Confirm domain boundaries

**Rule:**
No structural changes after this phase.

---

### Phase 1 — Manual Agent Simulation (March → April)
**Purpose:** simulate OpenClaw behavior manually

**Define stable prompts for:**
- Inbox processing
- Task update
- Journal generation
- Dashboard update

**Human executes:**
“Run Inbox”  
“Update Tasks”  
“Generate Journal”  

*This equals: Human-driven runtime*

---

### Phase 2 — Semi-Automation Prep (April → May)
**Purpose:** make repo OpenClaw-ready

**Create agent definitions:**
```text
AI-Cockpit/agents/
  inbox.yaml
  planner.yaml
  task.yaml
  journal.yaml
```

**Create state layer:**
```text
AI-Cockpit/_state/
  last_run.json
  queue.json
  agent_state.json
```

**Create logs:**
```text
AI-Cockpit/_logs/
```

**Define triggers:**
- Inbox change
- Task change
- Repo start
- Daily tick

*After this phase: Repo is agent-native.*

---

### Phase 3 — Mac mini Deployment (May)
**Purpose:** enable persistent autonomy

**On Mac mini:**
- clone repo
- install OpenClaw
- register agents
- set schedules
- enable auto-run

**Agents:**
- startup → process Inbox
- daily → evaluate tasks
- commit → summarize
- change → refresh dashboard

**Result:**
Human → Inbox → OpenClaw → Agents → Repo → Dashboard

---

## FIRST AGENTS TO DEPLOY

1. **Inbox Processor**
   raw notes → structured data
2. **Task Updater**
   status / next / priority
3. **Journal Generator**
   decisions / logs

*These three = living OS*

---

## TIMELINE

**Feb–Mar:**
- Blueprint fixed
- AGENTS stabilized
- Inbox flow locked

**Mar–Apr:**
- Manual agents
- Prompt stabilization

**Apr–May:**
- agent yaml definitions
- state/log layers

**May:**
- Mac mini purchase
- OpenClaw install
- persistent runtime

---

## MIGRATION RULES

1. Finish repo structure before runtime
2. Define agents before automation
3. Install OpenClaw last

**Reverse order breaks system.**

---

## CONCEPTUAL TRANSITION

**Current:**
Human → Inbox → AI → Repo

**Final:**
Human → Inbox → OpenClaw → Agents → Repo → Dashboard

---

## ESSENCE

You are not building an OS.
You are giving autonomy to an existing OS.

Mac mini = persistent cognition layer.  
OpenClaw = runtime.  
Agents = behavior.  

**End state:**
AI-Cockpit becomes a self-running personal operating system.
