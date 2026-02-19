import { getProjects, findProject } from './project-utils.js';

console.log("--- Testing Project Discovery ---");
const projects = getProjects();
console.log(`Found ${projects.length} projects:`);
projects.forEach(p => console.log(` - ${p.name} (${p.path})`));

console.log("\n--- Testing Aliases ---");
['bp', 'ae', 'od', 'bb', 'eg'].forEach(alias => {
    const p = findProject(alias);
    console.log(`Alias '${alias}' -> ${p ? p.name : 'NOT FOUND'}`);
});
