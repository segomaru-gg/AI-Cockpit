
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COCKPIT_ROOT = path.resolve(__dirname, '../../../');

// --- Helper: Project Discovery ---
function findProject(targetName) {
    if (!targetName) return null;

    // 1. Direct match (Case Insensitive)
    const domainsDir = path.join(COCKPIT_ROOT, 'domains');
    if (fs.existsSync(domainsDir)) {
        const entries = fs.readdirSync(domainsDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory() && entry.name.toLowerCase() === targetName.toLowerCase()) {
                return { name: entry.name, path: path.join(domainsDir, entry.name) };
            }
        }
    }

    // 2. Alias match
    const aliases = {
        'bp': 'cockpit-core',
        'ae': 'portfolio',
        'od': 'consulting',
        'bb': 'operations',
        'eg': 'learning'
    };
    const resolved = aliases[targetName.toLowerCase()];
    if (resolved) return findProject(resolved);

    return null;
}

// --- Helper: Slugify ---
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

// --- Main Logic ---
async function main() {
    const importFile = process.argv[2];

    if (!importFile) {
        console.error("Usage: node output-plan.js <path-to-json-file>");
        process.exit(1);
    }

    if (!fs.existsSync(importFile)) {
        console.error(`Error: File not found: ${importFile}`);
        process.exit(1);
    }

    console.log(`\n🚀 Ingesting Plan from: ${importFile}...`);

    let plan;
    try {
        const content = fs.readFileSync(importFile, 'utf8');
        // Handle Code Blocks if present (ChatGPT sometimes wraps in ```json ... ```)
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        plan = JSON.parse(cleanContent);
    } catch (e) {
        console.error("❌ Failed to parse JSON:", e.message);
        process.exit(1);
    }

    // 1. Validate Project
    const project = findProject(plan.target_project);
    if (!project) {
        console.error(`❌ Project '${plan.target_project}' not found in Cockpit.`);
        process.exit(1);
    }
    console.log(`✅ Target Project: ${project.name}`);

    // 2. Handle Goal (Update or Create)
    let currentGoalId = null;
    if (plan.goal && plan.goal.title) {
        // Simple logic: Assume if goal title matches existing active goal, update it. 
        // Or if it's new, we might need manual intervention or just warn.
        // For now, let's just Log it. Updating goal.yaml programmatically is risky without ID.
        console.log(`ℹ️  Goal specified: "${plan.goal.title}". Please verify goal.yaml manually if this is a new goal.`);
    }

    // 3. Handle Phase (Create or Update)
    let phaseDirName = null;
    let phaseTitle = "Tasks"; // Default if no phase

    if (plan.phase && plan.phase.name) {
        const phaseSlug = slugify(plan.phase.name);

        // We need to find where phases are stored.
        // Strategy: Look at blueprint.yaml -> active_goal_id -> goals/<id>/phases/
        // OR: Just put it in 'tasks/' if no goal structure?
        // Let's read blueprint.yaml to find active goal

        let goalPath = null;
        const bpPath = path.join(project.path, 'blueprint.yaml');
        if (fs.existsSync(bpPath)) {
            const bpContent = fs.readFileSync(bpPath, 'utf8');
            const match = bpContent.match(/active_goal_id:\s*(.+)/);
            if (match) {
                const goalId = match[1].replace(/["']/g, '').trim();
                goalPath = path.join(project.path, 'goals', goalId);
            }
        }

        if (goalPath && fs.existsSync(goalPath)) {
            // Check/Create Phases dir
            const phasesRoot = path.join(goalPath, 'phases');
            if (!fs.existsSync(phasesRoot)) fs.mkdirSync(phasesRoot);

            // Look for existing phase with same name or slug
            // (Simplification: just use slug for now)
            // But we often use prompts like "p1-phase-name".
            // Let's Auto-Prefix if not present? Too complex.
            // Let's just use the slug.

            phaseDirName = phaseSlug;
            const phasePath = path.join(phasesRoot, phaseDirName);

            if (!fs.existsSync(phasePath)) {
                console.log(`✨ Creating New Phase: ${plan.phase.name} (${phaseDirName})`);
                fs.mkdirSync(phasePath);
                fs.mkdirSync(path.join(phasePath, 'tasks'));

                const phaseYaml = `phase_id: "${phaseDirName}"\nphase_name: "${plan.phase.name}"\nstatus: "active"\nprogress: 0\ndeadline: "${plan.phase.deadline || ''}"\n`;
                fs.writeFileSync(path.join(phasePath, 'phase.yaml'), phaseYaml);

                // Also need to add to goal.yaml phases list? 
                // That's tricky parsing. We will skip for now and ask user to register it? 
                // Or maybe just Append it if simple?
                console.warn(`⚠️  New phase created. Don't forget to add "${phaseDirName}" to goal.yaml phases list!`);
            } else {
                console.log(`✅ Phase found: ${phaseDirName}`);
            }

            phaseTitle = plan.phase.name;

            // 4. Ingest Tasks into Phase
            if (plan.tasks && Array.isArray(plan.tasks)) {
                const tasksDir = path.join(phasePath, 'tasks');
                let count = 0;

                for (const t of plan.tasks) {
                    const title = typeof t === 'string' ? t : t.title;
                    const content = (typeof t === 'string' ? '' : t.content) || '';
                    const priority = (typeof t === 'string' ? 'medium' : t.priority) || 'medium';

                    const filename = `${slugify(title)}.md`;
                    const filePath = path.join(tasksDir, filename);

                    if (!fs.existsSync(filePath)) {
                        const fileContent = `---\ntitle: "${title}"\nstatus: pending\npriority: ${priority}\norder: ${999}\n---\n\n${content}`;
                        fs.writeFileSync(filePath, fileContent);
                        count++;
                    }
                }
                console.log(`📥 Imported ${count} tasks into phase '${phaseTitle}'.`);
            }

        } else {
            console.log(`⚠️  No active goal found (or path invalid). Importing to Project Root task.md instead.`);
            // Fallback to root import
            fallbackImport(project.path, plan.tasks);
        }

    } else {
        // No Phase specified, Import to Root
        console.log(`ℹ️  No phase specified. Importing to Project Root task.md.`);
        fallbackImport(project.path, plan.tasks);
    }
}

// --- Helper: Fallback Import ---
function fallbackImport(projectPath, tasks) {
    if (!tasks || !Array.isArray(tasks)) return;

    const taskMdPath = path.join(projectPath, 'task.md');
    // Create if not exists
    if (!fs.existsSync(taskMdPath)) {
        fs.writeFileSync(taskMdPath, `# Tasks\n\n`);
    }

    let appendContent = `\n`;
    for (const t of tasks) {
        const title = typeof t === 'string' ? t : t.title;
        appendContent += `- [ ] ${title}\n`;
    }

    fs.appendFileSync(taskMdPath, appendContent);
    console.log(`📥 Appended ${tasks.length} tasks to task.md.`);
}

main().catch(err => console.error(err));
