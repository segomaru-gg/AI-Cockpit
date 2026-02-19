import fs from 'fs';
import path from 'path';
import { getProjects } from './project-utils.js';
import yaml from 'js-yaml'; // check if js-yaml is available, otherwise use simple parsing or install it. 
// Note: package.json didn't list js-yaml, but typically needed. I will try to use simple regex or check if I can install it.
// Actually, `blueprint.yaml` parsing is likely needed. 
// Let's check package.json again. 

// Wait, I don't see js-yaml in the package.json I read earlier (Step 17). 
// "dependencies": { "astro": "^5.17.1", "discord.js": "^14.25.1", "dotenv": "^17.3.1" }
// I should probably add js-yaml or use a very simple parser since blueprint.yaml is simple key-value.
// For robustness, I'll assume I can install it or use a simple regex for now to avoid dependency issues if user doesn't want installs.
// But the user approves migration, so installing `js-yaml` is probably fine.
// I'll stick to a simple parser for the validator to be standalone if possible, 
// OR I will PROPOSE to install `js-yaml` if I need it. 
// Actually, let's just use regex for the simple `blueprint.yaml` structure we have.

const TERM_COLORS = {
    RESET: '\x1b[0m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    BOLD: '\x1b[1m'
};

function parseYamlSimple(content) {
    const result = {};
    const lines = content.split('\n');
    for (const line of lines) {
        const match = line.match(/^([a-zA-Z0-9_]+):\s*(.+)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            result[key] = value;
        }
    }
    return result;
}

function validateSchema() {
    console.log(`${TERM_COLORS.BOLD}Starting Schema Validation...${TERM_COLORS.RESET}\n`);

    const projects = getProjects();
    const stats = {
        legacy: 0,
        goalCentric: 0,
        partial: 0
    };

    projects.forEach(p => {
        let status = 'UNKNOWN';
        let details = [];

        const blueprintPath = path.join(p.path, 'blueprint.yaml');
        const goalsDir = path.join(p.path, 'goals');

        let meta = {};
        if (fs.existsSync(blueprintPath)) {
            try {
                const content = fs.readFileSync(blueprintPath, 'utf8');
                meta = parseYamlSimple(content);
            } catch (e) {
                details.push(`Error reading blueprint.yaml: ${e.message}`);
            }
        }

        const hasGoalsDir = fs.existsSync(goalsDir) && fs.statSync(goalsDir).isDirectory();
        const hasActiveGoalId = !!meta.active_goal_id;

        if (hasGoalsDir && hasActiveGoalId) {
            status = 'GOAL-CENTRIC';
            stats.goalCentric++;
            // Further validation: check if active goal exists
            const activeGoalPath = path.join(goalsDir, meta.active_goal_id, 'goal.yaml');
            if (!fs.existsSync(activeGoalPath)) {
                details.push(`${TERM_COLORS.RED}Missing active goal definitions: ${meta.active_goal_id}${TERM_COLORS.RESET}`);
                status = 'PARTIAL (Broken Link)';
                stats.goalCentric--;
                stats.partial++;
            }
        } else if (hasGoalsDir || hasActiveGoalId) {
            status = 'PARTIAL';
            stats.partial++;
            if (!hasGoalsDir) details.push('Missing "goals" directory');
            if (!hasActiveGoalId) details.push('Missing "active_goal_id" in blueprint.yaml');
        } else {
            status = 'LEGACY';
            stats.legacy++;
        }

        const color = status === 'GOAL-CENTRIC' ? TERM_COLORS.GREEN : (status === 'LEGACY' ? TERM_COLORS.YELLOW : TERM_COLORS.RED);
        console.log(`[${p.name}] ${color}${status}${TERM_COLORS.RESET}`);
        if (details.length > 0) {
            details.forEach(d => console.log(`  - ${d}`));
        }
    });

    console.log(`\n${TERM_COLORS.BOLD}Summary:${TERM_COLORS.RESET}`);
    console.log(`Total Projects: ${projects.length}`);
    console.log(`Goal-Centric: ${TERM_COLORS.GREEN}${stats.goalCentric}${TERM_COLORS.RESET}`);
    console.log(`Legacy: ${TERM_COLORS.YELLOW}${stats.legacy}${TERM_COLORS.RESET}`);
    console.log(`Partial/Broken: ${TERM_COLORS.RED}${stats.partial}${TERM_COLORS.RESET}`);
}

validateSchema();
