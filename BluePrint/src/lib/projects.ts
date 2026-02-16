import fs from 'node:fs';
import path from 'node:path';

export interface Task {
    id: string;
    title: string;
    phase: string;
    status: 'pending' | 'doing' | 'done';
    priority: 'low' | 'medium' | 'high';
    order: number;
    project: string;
    projectColor?: string;
}

export interface Project {
    id: string;
    name: string;
    category: string;
    status: string;
    path: string;
    tasks: Task[];
    progress: number;
    latestLog?: string;
    latestLogPreview?: string;
    latestLogFull?: string;
    dashboardUrl?: string;
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

export async function discoverProjects(cockpitRoot: string): Promise<Project[]> {
    const entries = fs.readdirSync(cockpitRoot, { withFileTypes: true });
    const projects: Project[] = [];

    for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            const projectPath = path.join(cockpitRoot, entry.name);
            const sentinelPath = path.join(projectPath, 'blueprint.yaml');

            if (fs.existsSync(sentinelPath)) {
                const sentinelContent = fs.readFileSync(sentinelPath, 'utf8');
                // Quick YAML parse for top-level keys
                const metadata: any = {};
                sentinelContent.split('\n').forEach(line => {
                    const idx = line.indexOf(':');
                    if (idx > -1) {
                        metadata[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
                    }
                });

                const tasksDir = path.join(projectPath, 'tasks');
                const tasks: Task[] = [];

                if (fs.existsSync(tasksDir)) {
                    const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
                    taskFiles.forEach(file => {
                        const content = fs.readFileSync(path.join(tasksDir, file), 'utf8');
                        const { data: taskData } = parseFrontmatter(content);

                        tasks.push({
                            id: file,
                            title: taskData.title || file,
                            phase: taskData.phase || 'Default',
                            status: taskData.status || 'pending',
                            priority: taskData.priority || 'medium',
                            order: parseInt(taskData.order) || 999,
                            project: metadata.name || entry.name,
                        });
                    });
                }

                // Get latest log from journal/
                const journalDir = path.join(projectPath, 'journal');
                let latestLog = '';
                let latestLogPreview = '';
                let latestLogFull = '';

                if (fs.existsSync(journalDir)) {
                    const logFiles = fs.readdirSync(journalDir)
                        .filter(f => f.endsWith('.md'))
                        .sort()
                        .reverse();
                    if (logFiles.length > 0) {
                        const latestFileName = logFiles[0];
                        latestLog = latestFileName.replace('.md', '');

                        try {
                            const logFullContent = fs.readFileSync(path.join(journalDir, latestFileName), 'utf8');
                            const { content: logBody } = parseFrontmatter(logFullContent);
                            latestLogPreview = logBody.trim().slice(0, 150).replace(/\r?\n/g, ' ') + (logBody.length > 150 ? '...' : '');
                            latestLogFull = logBody.trim();
                        } catch (e) {
                            console.error(`Failed to read log preview for ${latestFileName}`);
                        }
                    }
                }

                const doneTasks = tasks.filter(t => t.status === 'done').length;
                const doingTasks = tasks.filter(t => t.status === 'doing').length;
                const points = doneTasks + (doingTasks * 0.5);
                const progress = tasks.length > 0 ? (points / tasks.length) * 100 : 0;

                // Dashboard URL Discovery
                let dashboardUrl = metadata.dashboard_url || '';
                if (!dashboardUrl) {
                    const localDashboardPath = path.join(projectPath, 'dashboard', 'index.html');
                    if (fs.existsSync(localDashboardPath)) {
                        // Use the public symlink path for serving
                        dashboardUrl = `/projects_root/${entry.name}/dashboard/index.html`;
                    }
                }

                projects.push({
                    id: metadata.id || entry.name,
                    name: metadata.name || entry.name,
                    category: metadata.category || 'uncategorized',
                    status: metadata.status || 'active',
                    path: projectPath,
                    tasks,
                    progress,
                    latestLog,
                    latestLogPreview,
                    latestLogFull,
                    dashboardUrl
                });
            }
        }
    }

    return projects;
}
