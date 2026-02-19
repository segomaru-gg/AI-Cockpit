import fs from 'node:fs';
import path from 'node:path';

const cockpitRoot = '/Users/ryosaigo/AI-Cockpit';
const projects = fs.readdirSync(cockpitRoot, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && dirent.name !== 'node_modules')
    .map(dirent => dirent.name);

console.log('🔍 Auditing Journal Filenames for YYYY-MM-DD compliance...\n');

let issuesFound = 0;

projects.forEach(project => {
    const journalDir = path.join(cockpitRoot, project, 'journal');
    if (fs.existsSync(journalDir)) {
        const files = fs.readdirSync(journalDir).filter(f => f.endsWith('.md'));
        files.forEach(file => {
            if (!file.match(/^(\d{4}-\d{2}-\d{2})/)) {
                console.warn(`[${project}] ⚠️ Non-standard filename: ${file}`);
                issuesFound++;
            }
        });
    }
});

if (issuesFound === 0) {
    console.log('\n✅ All journal files match YYYY-MM-DD pattern.');
} else {
    console.log(`\n⚠️ Found ${issuesFound} non-standard filenames. Recommendations: Rename to YYYY-MM-DD-title.md`);
}
