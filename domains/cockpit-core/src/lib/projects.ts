import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export interface GitInfo {
    branch: string;
    commitHash: string;
    commitMessage: string;
    commitDate: string;
    isDirty: boolean;
}

export interface Task {
    id: string;
    title: string;
    phase: string;
    status: 'pending' | 'doing' | 'done';
    priority: 'low' | 'medium' | 'high';
    order: number;
    project: string;
    projectColor?: string;
    content?: string;
    deadline?: string;
    filePath?: string; // Added for API access
}

export interface Phase {
    id: string;
    name: string;
    status: 'planned' | 'active' | 'done';
    progress: number;
    tasks: Task[];
    deadline?: string;
}

export interface Goal {
    id: string;
    title: string;
    progress: number;
    phases: Phase[];
}

export interface Project {
    id: string;
    name: string;
    category: string;
    status: string;
    path: string;
    tasks: Task[];
    progress: number;
    activeGoal?: Goal; // Aggregated or Primary Goal
    activeGoals?: Goal[]; // List of all active goals
    latestLog?: string;
    latestLogPreview?: string;
    latestLogFull?: string;
    dashboardUrl?: string;
    activity: Record<string, number>;
    git?: GitInfo;
}

function parseFrontmatter(content: string) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return { data: {}, content };

    const yaml = match[1];
    const data: any = {};
    yaml.split('\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx > -1) {
            const k = line.slice(0, idx).trim();
            const v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
            data[k] = v;
        }
    });

    return { data, content: content.slice(match[0].length) };
}

function getGitInfo(projectPath: string): GitInfo | undefined {
    if (!fs.existsSync(path.join(projectPath, '.git'))) return undefined;

    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath, encoding: 'utf-8' }).trim();
        const log = execSync('git log -1 --format="%h|%s|%ar"', { cwd: projectPath, encoding: 'utf-8' }).trim();
        const [commitHash, commitMessage, commitDate] = log.split('|');
        const status = execSync('git status --porcelain', { cwd: projectPath, encoding: 'utf-8' }).trim();
        const isDirty = status.length > 0;

        return {
            branch,
            commitHash,
            commitMessage,
            commitDate,
            isDirty
        };
    } catch (e) {
        return undefined;
    }
}

export async function discoverProjects(cockpitRoot: string): Promise<Project[]> {
    const entries = fs.readdirSync(cockpitRoot, { withFileTypes: true });
    const projects: Project[] = [];

    // Dynamic import for utility
    const { toLocalISOString } = await import('./dateUtils');

    for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            const projectPath = path.join(cockpitRoot, entry.name);
            const sentinelPath = path.join(projectPath, 'blueprint.yaml');

            if (fs.existsSync(sentinelPath)) {
                // Parse Project Metadata
                const sentinelContent = fs.readFileSync(sentinelPath, 'utf8');
                const metadata: any = {};
                sentinelContent.split('\n').forEach(line => {
                    const idx = line.indexOf(':');
                    if (idx > -1) {
                        metadata[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
                    }
                });

                // Initialize Project Data Containers
                const tasks: Task[] = [];
                const activity: Record<string, number> = {};
                let activeGoal: Goal | undefined;
                let goalCentric = false;

                // Progress Tracking Variables
                let donePhases = 0;
                let totalPhases = 0;
                let collectedPhases: Phase[] = [];
                let activeGoalsList: Goal[] = [];

                // === GOAL-CENTRIC LOGIC ===
                // Check if active_goal_id is present. 
                // Metadata parsing above is simple line-split. If active_goal_id is a list, it might be missed or partial.
                // We use a regex to be sure.
                let goalIds: string[] = [];
                const activeGoalBlock = sentinelContent.match(/active_goal_id:\s*(\n(?:\s+-\s+.+)+)/);

                if (activeGoalBlock) {
                    // It's a multiline formatted list
                    const listContent = activeGoalBlock[1];
                    goalIds = listContent.split('\n')
                        .map(l => l.trim())
                        .filter(l => l.startsWith('-'))
                        .map(l => l.replace(/^-\s*/, '').replace(/^["']|["']$/g, '').trim());
                    goalCentric = true;
                } else if (metadata.active_goal_id) {
                    // It's a single value or an inline list like [a, b]
                    if (metadata.active_goal_id.startsWith('[') && metadata.active_goal_id.endsWith(']')) {
                        goalIds = metadata.active_goal_id.slice(1, -1).split(',').map((s: string) => s.trim().replace(/^["']|["']$/g, ''));
                    } else {
                        goalIds = [metadata.active_goal_id];
                    }
                    goalCentric = true;
                }

                if (goalCentric) {
                    let aggregatedProgress = 0;
                    let primaryGoalTitle = "";

                    for (const goalId of goalIds) {
                        const goalPath = path.join(projectPath, 'goals', goalId);
                        const goalYamlPath = path.join(goalPath, 'goal.yaml');

                        if (fs.existsSync(goalYamlPath)) {
                            // Get goal title
                            let currentGoalTitle = goalId;
                            const gc = fs.readFileSync(goalYamlPath, 'utf8');
                            const matchTitle = gc.match(/goal_title:\s*(.+)/);
                            if (matchTitle) currentGoalTitle = matchTitle[1].replace(/^["']|["']$/g, '').trim();

                            if (!primaryGoalTitle) primaryGoalTitle = currentGoalTitle;

                            // Process Phases
                            const phasesDir = path.join(goalPath, 'phases');
                            const currentGoalPhases: Phase[] = [];
                            let goalTotalPhases = 0;
                            let goalDonePhases = 0;

                            if (fs.existsSync(phasesDir)) {
                                const phaseDirs = fs.readdirSync(phasesDir);
                                for (const pDir of phaseDirs) {
                                    const phasePath = path.join(phasesDir, pDir);
                                    if (!fs.statSync(phasePath).isDirectory()) continue;

                                    const phaseYamlPath = path.join(phasePath, 'phase.yaml');
                                    let phaseName = pDir;
                                    let phaseStatus = 'planned';
                                    let phaseProgress = 0;
                                    let phaseDeadline: string | undefined;

                                    if (fs.existsSync(phaseYamlPath)) {
                                        const pc = fs.readFileSync(phaseYamlPath, 'utf8');
                                        const matchName = pc.match(/phase_name:\s*(.+)/);
                                        if (matchName) phaseName = matchName[1].replace(/^["']|["']$/g, '').trim();

                                        const matchStatus = pc.match(/status:\s*(.+)/);
                                        if (matchStatus) phaseStatus = matchStatus[1].replace(/^["']|["']$/g, '').toLowerCase();

                                        const matchProgress = pc.match(/progress:\s*(\d+)/);
                                        if (matchProgress) phaseProgress = parseInt(matchProgress[1]);

                                        const matchDeadline = pc.match(/deadline:\s*(.+)/);
                                        if (matchDeadline) phaseDeadline = matchDeadline[1].replace(/^["']|["']$/g, '').trim();
                                    }

                                    goalTotalPhases++;
                                    totalPhases++;
                                    if (phaseStatus === 'done') {
                                        goalDonePhases++;
                                        donePhases++;
                                    }

                                    const phaseTasks: Task[] = [];
                                    const taskDir = path.join(phasePath, 'tasks');

                                    if (fs.existsSync(taskDir)) {
                                        const tFiles = fs.readdirSync(taskDir).filter(f => f.endsWith('.md'));
                                        tFiles.forEach(file => {
                                            const tPath = path.join(taskDir, file);
                                            const content = fs.readFileSync(tPath, 'utf8');
                                            const { data: taskData } = parseFrontmatter(content);

                                            const stats = fs.statSync(tPath);
                                            const dateStr = toLocalISOString(stats.mtime);
                                            activity[dateStr] = (activity[dateStr] || 0) + 1;

                                            const taskObj: Task = {
                                                id: file,
                                                title: taskData.title || file,
                                                phase: taskData.phase || phaseName,
                                                status: (taskData.status || 'pending').toLowerCase() as any,
                                                priority: (taskData.priority || 'medium') as any,
                                                order: parseInt(taskData.order) || 999,
                                                project: metadata.name || entry.name,
                                                content: content.trim(),
                                                deadline: taskData.deadline,
                                                filePath: tPath
                                            };
                                            tasks.push(taskObj);
                                            phaseTasks.push(taskObj);
                                        });
                                    }

                                    let computedProgress = 0;
                                    if (phaseTasks.length > 0) {
                                        const completedTasks = phaseTasks.filter(t => t.status === 'done').length;
                                        computedProgress = Math.round((completedTasks / phaseTasks.length) * 100);
                                    } else if (phaseProgress > 0) {
                                        computedProgress = phaseProgress;
                                    }

                                    const phaseObj: Phase = {
                                        id: pDir,
                                        name: phaseName,
                                        status: phaseStatus as any,
                                        progress: computedProgress,
                                        deadline: phaseDeadline,
                                        tasks: phaseTasks.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
                                    };

                                    collectedPhases.push(phaseObj);
                                    currentGoalPhases.push(phaseObj);
                                }
                            }

                            // Calculate individual Goal Progress
                            const goalProgress = goalTotalPhases > 0 ? Math.round((goalDonePhases / goalTotalPhases) * 100) : 0;
                            aggregatedProgress += goalProgress;

                            activeGoalsList.push({
                                id: goalId,
                                title: currentGoalTitle,
                                progress: goalProgress,
                                phases: currentGoalPhases.sort((a, b) => a.id.localeCompare(b.id))
                            });
                        }
                    }

                    const progress = goalIds.length > 0 ? Math.round(aggregatedProgress / goalIds.length) : 0;

                    activeGoal = {
                        id: goalIds.join('+'),
                        title: goalIds.length > 1 ? `${primaryGoalTitle} + ${goalIds.length - 1} Goals` : primaryGoalTitle,
                        progress: progress,
                        phases: collectedPhases.sort((a, b) => a.id.localeCompare(b.id))
                    };
                }

                // === LEGACY LOGIC ===
                // Only run if not goal centric
                if (!goalCentric) {
                    const tasksDir = path.join(projectPath, 'tasks');
                    if (fs.existsSync(tasksDir)) {
                        const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
                        taskFiles.forEach(file => {
                            const tPath = path.join(tasksDir, file);
                            const content = fs.readFileSync(tPath, 'utf8');
                            const { data: taskData } = parseFrontmatter(content);

                            const stats = fs.statSync(tPath);
                            const dateStr = toLocalISOString(stats.mtime);
                            activity[dateStr] = (activity[dateStr] || 0) + 1;

                            tasks.push({
                                id: file,
                                title: taskData.title || file,
                                phase: taskData.phase || 'Default',
                                status: (taskData.status || 'pending').toLowerCase() as any,
                                priority: (taskData.priority || 'medium') as any,
                                order: parseInt(taskData.order) || 999,
                                project: metadata.name || entry.name,
                                content: content.trim(),
                                deadline: taskData.deadline,
                                filePath: tPath
                            });
                        });
                    }
                }

                // === JOURNAL LOGIC ===
                const journalDirs = [path.join(projectPath, 'journal')];

                // Add journals from active goals
                if (goalCentric) {
                    goalIds.forEach(gid => {
                        journalDirs.push(path.join(projectPath, 'journals', gid));
                    });
                }

                let latestLog = '';
                let latestLogPreview = '';
                let latestLogFull = '';
                let latestLogTime = 0;

                journalDirs.forEach(jDir => {
                    if (fs.existsSync(jDir)) {
                        const logFiles = fs.readdirSync(jDir).filter(f => f.endsWith('.md'));
                        logFiles.forEach(file => {
                            const jPath = path.join(jDir, file);
                            const stats = fs.statSync(jPath);

                            // Date parsing logic
                            const isoMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
                            const shortMatch = file.match(/^(\d{2})(\d{2})_/);
                            let dateStr = '';
                            if (isoMatch) {
                                dateStr = isoMatch[1];
                            } else if (shortMatch) {
                                const year = new Date().getFullYear();
                                dateStr = `${year}-${shortMatch[1]}-${shortMatch[2]}`;
                            } else {
                                dateStr = toLocalISOString(stats.mtime);
                            }
                            if (dateStr) activity[dateStr] = (activity[dateStr] || 0) + 1;

                            if (stats.mtimeMs > latestLogTime) {
                                latestLogTime = stats.mtimeMs;
                                latestLog = file.replace('.md', '');
                                try {
                                    const logFullContent = fs.readFileSync(jPath, 'utf8');
                                    const { content: logBody } = parseFrontmatter(logFullContent);
                                    latestLogPreview = logBody.trim().slice(0, 150).replace(/\r?\n/g, ' ') + (logBody.length > 150 ? '...' : '');
                                    latestLogFull = logBody.trim();
                                } catch (e) {
                                    console.error(`Failed to parse log ${file}`);
                                }
                            }
                        });
                    }
                });

                // Calculate Overall Project Progress
                let progress = 0;
                if (goalCentric && activeGoal) {
                    progress = activeGoal.progress;
                } else {
                    const doneTasks = tasks.filter(t => t.status === 'done').length;
                    const doingTasks = tasks.filter(t => t.status === 'doing').length;
                    const points = doneTasks + (doingTasks * 0.5);
                    progress = tasks.length > 0 ? (points / tasks.length) * 100 : 0;
                }

                let dashboardUrl = metadata.dashboard_url || '';
                if (!dashboardUrl) {
                    const localDashboardPath = path.join(projectPath, 'dashboard', 'index.html');
                    if (fs.existsSync(localDashboardPath)) {
                        dashboardUrl = `/projects_root/${entry.name}/dashboard/index.html`;
                    }
                }

                const git = getGitInfo(projectPath);

                projects.push({
                    id: metadata.id || entry.name,
                    name: metadata.name || entry.name,
                    category: metadata.category || 'uncategorized',
                    status: metadata.status || 'active',
                    path: projectPath,
                    tasks,
                    progress,
                    activeGoal,
                    activeGoals: activeGoalsList,
                    latestLog,
                    latestLogPreview,
                    latestLogFull,
                    dashboardUrl,
                    activity,
                    git
                });
            }
        }
    }

    return projects;
}
