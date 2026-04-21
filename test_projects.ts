import { discoverProjects } from './domains/cockpit-core/src/lib/projects';

async function run() {
    const projects = await discoverProjects('/Users/ryosaigo/AI-Cockpit/domains');
    for (const p of projects) {
        console.log(`\nProject: ${p.name} (${p.category})`);
        if (p.activeGoals && p.activeGoals.length > 0) {
            console.log(`Goals: ${p.activeGoals.map(g => g.title).join(', ')}`);
        } else if (p.activeGoal) {
            console.log(`Goal: ${p.activeGoal.title}`);
        } else {
            console.log("No active goals");
        }
    }
}

run().catch(console.error);
