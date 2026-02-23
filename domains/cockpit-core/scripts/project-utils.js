import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cockpit Root is three levels up from scripts/ (domains/cockpit-core/scripts/ -> domains/cockpit-core/ -> domains/ -> AI-Cockpit/)
const COCKPIT_ROOT = path.resolve(__dirname, '../../../');

/**
 * Discovers all valid project directories (folders containing blueprint.yaml)
 * Now searches in domains/ directory
 * @returns {Array<{name: string, path: string}>}
 */
export function getProjects() {
    const domainsDir = path.join(COCKPIT_ROOT, 'domains');
    if (!fs.existsSync(domainsDir)) return [];

    const projects = [];
    const entries = fs.readdirSync(domainsDir, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') continue;

        const dirPath = path.join(domainsDir, entry.name);
        const blueprintPath = path.join(dirPath, 'blueprint.yaml');

        if (fs.existsSync(blueprintPath)) {
            // Level 1: domains/<project>/blueprint.yaml
            projects.push({ name: entry.name, path: dirPath });
        } else {
            // Level 2: domains/<domain>/<subproject>/blueprint.yaml
            const subEntries = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const sub of subEntries) {
                if (!sub.isDirectory() || sub.name.startsWith('.')) continue;
                const subPath = path.join(dirPath, sub.name);
                const subBlueprint = path.join(subPath, 'blueprint.yaml');
                if (fs.existsSync(subBlueprint)) {
                    projects.push({ name: sub.name, path: subPath });
                }
            }
        }
    }

    return projects;
}

/**
 * Finds a project by name (case-insensitive)
 * @param {string} name 
 * @returns {{name: string, path: string} | null}
 */
export function findProject(name) {
    if (!name) return { name: 'cockpit-core', path: path.join(COCKPIT_ROOT, 'domains', 'cockpit-core') }; // Default

    // Project Aliases
    const aliases = {
        'bp': 'cockpit-core',
        'ae': 'brand',
        'od': 'oduman',
        'bb': 'boabase',
        'eg': 'toeic',
        // Old names for backward compatibility
        'blueprint': 'cockpit-core',
        'aeternum': 'brand',
        'oduman': 'oduman',
        'boabase': 'boabase',
        'toeic': 'toeic'
    };

    const normalized = name.toLowerCase();
    const resolvedName = aliases[normalized] || name;

    const projects = getProjects();
    return projects.find(p => p.name.toLowerCase() === resolvedName.toLowerCase()) || null;
}

/**
 * Appends text to the project's inbox.md
 */
export function appendToInbox(projectPath, text) {
    const inboxPath = path.join(projectPath, 'inbox.md');
    const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    const line = `- [${timestamp}] ${text}\n`;

    // Create file if not exists
    if (!fs.existsSync(inboxPath)) {
        fs.writeFileSync(inboxPath, `# Inbox\n\n`);
    }

    fs.appendFileSync(inboxPath, line);
    return inboxPath;
}

/**
 * Reads the latest journal log
 */
export function getLatestLog(projectPath) {
    const journalDir = path.join(projectPath, 'journal');
    if (!fs.existsSync(journalDir)) return null;

    const files = fs.readdirSync(journalDir)
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse();

    if (files.length === 0) return null;

    const content = fs.readFileSync(path.join(journalDir, files[0]), 'utf8');
    return { filename: files[0], content };
}

/**
 * Reads pending tasks from task.md or tasks/*.md
 * For simplicity, we primarily look for 'task.md' in the root or 'tasks/' folder.
 */
export function getPendingTasks(projectPath) {
    const locations = [
        path.join(projectPath, 'task.md'),
        path.join(projectPath, 'tasks', 'task.md') // Some setup might put it here
    ];

    let content = '';
    for (const loc of locations) {
        if (fs.existsSync(loc)) {
            content = fs.readFileSync(loc, 'utf8');
            break;
        }
    }

    if (!content) return [];

    return content.split('\n')
        .filter(line => line.trim().match(/^-\s*\[( |\/)\]/)) // Matches "- [ ]" or "- [/]"
        .slice(0, 10);
}
