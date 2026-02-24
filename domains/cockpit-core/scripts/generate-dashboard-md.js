#!/usr/bin/env node
/**
 * generate-dashboard-md.js
 * 
 * Cockpit Dashboard の情報をMarkdown形式で生成する。
 * Obsidianモバイルからテキストベースでダッシュボードを確認するためのスクリプト。
 * 
 * 出力: domains/cockpit-core/DASHBOARD.md
 * 実行: node scripts/generate-dashboard-md.js  or  npm run dashboard:md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve paths
const COCKPIT_ROOT = path.resolve(__dirname, '../../../');
const DOMAINS_DIR = path.join(COCKPIT_ROOT, 'domains');
const OUTPUT_PATH = path.join(COCKPIT_ROOT, 'domains', 'cockpit-core', 'DASHBOARD.md');

// --- Data Loading ---

function parseFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return { data: {}, content };
    const yaml = match[1];
    const data = {};
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

function loadGlobalGoals() {
    const configPath = path.join(COCKPIT_ROOT, 'cockpit.yaml');
    if (!fs.existsSync(configPath)) return null;

    const content = fs.readFileSync(configPath, 'utf8');
    const config = { current_quarter: '', goals: [] };

    const qMatch = content.match(/current_quarter:\s*["']?([^"'\n]+)["']?/);
    if (qMatch) config.current_quarter = qMatch[1].trim();

    const goalBlocks = content.split(/^\s*- id:/m).slice(1);
    for (const block of goalBlocks) {
        const fullBlock = '- id:' + block;
        const getId = fullBlock.match(/id:\s*["']?([^"'\n]+)["']?/);
        const getTitle = fullBlock.match(/title:\s*["']?([^"'\n]+)["']?/);
        const getDesc = fullBlock.match(/description:\s*["']?([^"'\n]+)["']?/);
        const getPriority = fullBlock.match(/priority:\s*(\d+)/);

        const alignment = {};
        const alignBlock = fullBlock.match(/alignment:\s*\n((?:\s+\w[\w-]*:\s*\d+\s*\n?)+)/);
        if (alignBlock) {
            alignBlock[1].split('\n').forEach(line => {
                const m = line.match(/^\s+([\w-]+):\s*(\d+)/);
                if (m) alignment[m[1]] = parseInt(m[2]);
            });
        }

        config.goals.push({
            id: getId?.[1]?.trim() || '',
            title: getTitle?.[1]?.trim() || '',
            description: getDesc?.[1]?.trim() || '',
            priority: parseInt(getPriority?.[1] || '99'),
            alignment
        });
    }

    config.goals.sort((a, b) => a.priority - b.priority);
    return config;
}

function discoverProjects() {
    const entries = fs.readdirSync(DOMAINS_DIR, { withFileTypes: true });
    const globalGoals = loadGlobalGoals();
    const projectEntries = [];

    for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            const dirPath = path.join(DOMAINS_DIR, entry.name);
            const sentinelPath = path.join(dirPath, 'blueprint.yaml');

            if (fs.existsSync(sentinelPath)) {
                projectEntries.push({ projectPath: dirPath, entryName: entry.name, domainName: entry.name });
            } else {
                const subEntries = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const sub of subEntries) {
                    if (sub.isDirectory() && !sub.name.startsWith('.')) {
                        const subPath = path.join(dirPath, sub.name);
                        if (fs.existsSync(path.join(subPath, 'blueprint.yaml'))) {
                            projectEntries.push({ projectPath: subPath, entryName: sub.name, domainName: entry.name });
                        }
                    }
                }
            }
        }
    }

    const projects = [];

    for (const { projectPath, entryName, domainName } of projectEntries) {
        const sentinelPath = path.join(projectPath, 'blueprint.yaml');
        const sentinelContent = fs.readFileSync(sentinelPath, 'utf8');
        const metadata = {};
        sentinelContent.split('\n').forEach(line => {
            const idx = line.indexOf(':');
            if (idx > -1) {
                metadata[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
            }
        });

        const tasks = [];
        let activeGoalsList = [];
        let goalCentric = false;

        // Parse goal IDs
        let goalIds = [];
        const activeGoalBlock = sentinelContent.match(/active_goal_id:\s*(\n(?:\s+-\s+.+)+)/);
        if (activeGoalBlock) {
            goalIds = activeGoalBlock[1].split('\n')
                .map(l => l.trim())
                .filter(l => l.startsWith('-'))
                .map(l => l.replace(/^-\s*/, '').replace(/^["']|["']$/g, '').trim());
            goalCentric = true;
        } else if (metadata.active_goal_id) {
            if (metadata.active_goal_id.startsWith('[') && metadata.active_goal_id.endsWith(']')) {
                goalIds = metadata.active_goal_id.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
            } else {
                goalIds = [metadata.active_goal_id];
            }
            goalCentric = true;
        }

        if (goalCentric) {
            for (const goalId of goalIds) {
                const goalPath = path.join(projectPath, 'goals', goalId);
                const goalYamlPath = path.join(goalPath, 'goal.yaml');

                if (!fs.existsSync(goalYamlPath)) continue;

                let goalTitle = goalId;
                const gc = fs.readFileSync(goalYamlPath, 'utf8');
                const matchTitle = gc.match(/goal_title:\s*(.+)/);
                if (matchTitle) goalTitle = matchTitle[1].replace(/^["']|["']$/g, '').trim();

                const phasesDir = path.join(goalPath, 'phases');
                const goalPhases = [];
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
                        let phaseDeadline = undefined;

                        if (fs.existsSync(phaseYamlPath)) {
                            const pc = fs.readFileSync(phaseYamlPath, 'utf8');
                            const mn = pc.match(/phase_name:\s*(.+)/);
                            if (mn) phaseName = mn[1].replace(/^["']|["']$/g, '').trim();
                            const ms = pc.match(/status:\s*(.+)/);
                            if (ms) phaseStatus = ms[1].replace(/^["']|["']$/g, '').toLowerCase();
                            const mp = pc.match(/progress:\s*(\d+)/);
                            if (mp) phaseProgress = parseInt(mp[1]);
                            const md = pc.match(/deadline:\s*(.+)/);
                            if (md) phaseDeadline = md[1].replace(/^["']|["']$/g, '').trim();
                        }

                        goalTotalPhases++;
                        if (phaseStatus === 'done') goalDonePhases++;

                        // Load tasks
                        const phaseTasks = [];
                        const taskDir = path.join(phasePath, 'tasks');
                        if (fs.existsSync(taskDir)) {
                            const tFiles = fs.readdirSync(taskDir).filter(f => f.endsWith('.md'));
                            for (const file of tFiles) {
                                const tPath = path.join(taskDir, file);
                                const content = fs.readFileSync(tPath, 'utf8');
                                const { data: taskData } = parseFrontmatter(content);
                                const taskObj = {
                                    id: file,
                                    title: taskData.title || file.replace('.md', ''),
                                    status: (taskData.status || 'pending').toLowerCase(),
                                    priority: taskData.priority || 'medium',
                                    order: parseInt(taskData.order) || 999,
                                };
                                tasks.push(taskObj);
                                phaseTasks.push(taskObj);
                            }
                        }

                        let computedProgress = 0;
                        if (phaseTasks.length > 0) {
                            computedProgress = Math.round((phaseTasks.filter(t => t.status === 'done').length / phaseTasks.length) * 100);
                        } else if (phaseProgress > 0) {
                            computedProgress = phaseProgress;
                        }

                        goalPhases.push({
                            id: pDir,
                            name: phaseName,
                            status: phaseStatus,
                            progress: computedProgress,
                            deadline: phaseDeadline,
                            tasks: phaseTasks.sort((a, b) => a.order - b.order)
                        });
                    }
                }

                const goalProgress = goalTotalPhases > 0 ? Math.round((goalDonePhases / goalTotalPhases) * 100) : 0;

                activeGoalsList.push({
                    id: goalId,
                    title: goalTitle,
                    progress: goalProgress,
                    phases: goalPhases.sort((a, b) => a.id.localeCompare(b.id))
                });
            }
        }

        // Journal: latest log
        let latestLog = '';
        let latestLogTime = 0;
        const journalDirs = [path.join(projectPath, 'journal')];
        if (goalCentric) {
            goalIds.forEach(gid => journalDirs.push(path.join(projectPath, 'journals', gid)));
        }
        for (const jDir of journalDirs) {
            if (!fs.existsSync(jDir)) continue;
            const logFiles = fs.readdirSync(jDir).filter(f => f.endsWith('.md'));
            for (const file of logFiles) {
                const stats = fs.statSync(path.join(jDir, file));
                if (stats.mtimeMs > latestLogTime) {
                    latestLogTime = stats.mtimeMs;
                    latestLog = file.replace('.md', '');
                }
            }
        }

        // Global alignment
        let globalAlignment = 0;
        if (globalGoals && globalGoals.goals.length > 0) {
            let totalWeight = 0;
            let weightedScore = 0;
            for (const g of globalGoals.goals) {
                const weight = 1 / g.priority;
                const score = g.alignment[domainName] || 0;
                weightedScore += score * weight;
                totalWeight += weight;
            }
            globalAlignment = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 10) / 10 : 0;
        }

        projects.push({
            id: metadata.id || entryName,
            name: metadata.name || entryName,
            category: domainName,
            status: metadata.status || 'active',
            tasks,
            activeGoals: activeGoalsList,
            latestLog,
            globalAlignment,
            priority: parseInt(metadata.priority) || 99
        });
    }

    return { projects, globalGoals };
}

// --- AI Advice Logic (mirrors index.astro) ---

function getAdvice(projects, globalGoals) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Critical: Phase Deadline Approaches
    for (const p of projects) {
        for (const goal of (p.activeGoals || [])) {
            for (const phase of goal.phases) {
                if (phase.status === 'active' && phase.deadline) {
                    const d = new Date(phase.deadline);
                    const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) {
                        return `⚠️ [CRITICAL] ${p.name} - ${phase.name} の期限 (${phase.deadline}) を超過しています。直ちに対処してください。`;
                    }
                    if (diffDays <= 14) {
                        return `🔥 [URGENT] ${p.name} - ${phase.name} の期限まであと ${diffDays} 日です (${phase.deadline})。優先的に進めてください。`;
                    }
                }
            }
        }
    }

    // 2. Strategy: High-alignment with no recent activity
    if (globalGoals) {
        const highAligned = projects
            .filter(p => p.globalAlignment >= 4)
            .sort((a, b) => b.globalAlignment - a.globalAlignment);

        for (const p of highAligned) {
            // Simplified: check if project has doing tasks
            const doingTasks = p.tasks.filter(t => t.status === 'doing');
            if (doingTasks.length === 0) {
                return `📌 [STRATEGY] ${p.name} はグローバル目標への貢献度が高い (★${Math.round(p.globalAlignment)}) ですが、進行中のタスクがありません。着手を検討してください。`;
            }
        }
    }

    // 3. Warning: Active Phases without Deadlines
    for (const p of projects) {
        for (const goal of (p.activeGoals || [])) {
            const noDeadline = goal.phases.find(ph => ph.status === 'active' && !ph.deadline);
            if (noDeadline) {
                return `📋 [ATTENTION] ${p.name} の "${noDeadline.name}" にDeadlineが設定されていません。phase.yamlにdeadlineを追加してください。`;
            }
        }
    }

    // 4. General: lowest progress
    let lowestProject = null;
    let lowestProgress = 101;
    for (const p of projects) {
        for (const goal of (p.activeGoals || [])) {
            if (goal.progress < lowestProgress) {
                lowestProgress = goal.progress;
                lowestProject = p;
            }
        }
    }
    if (lowestProject && lowestProgress < 100) {
        return `✅ 順調です。進捗が最も低い ${lowestProject.name} (${lowestProgress}%) のタスク消化に注力しましょう。`;
    }

    return '🎉 全プロジェクトの目標が達成されています。新たなGoalを設定するか、次のフェーズへ移行してください。';
}

// --- Markdown Generation ---

function generateProgressBar(percent) {
    const filled = Math.round(percent / 10);
    const empty = 10 - filled;
    return `${'█'.repeat(filled)}${'░'.repeat(empty)} ${percent}%`;
}

function generateStars(score) {
    const rounded = Math.round(score);
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

function generateMarkdown(projects, globalGoals) {
    const now = new Date();
    const timestamp = now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    let md = '';

    // Header
    md += `# 🎯 Cockpit Dashboard\n`;
    md += `> Generated: ${timestamp} JST\n\n`;

    // Global Objectives
    if (globalGoals && globalGoals.goals.length > 0) {
        md += `## Global Objectives // ${globalGoals.current_quarter}\n\n`;
        md += `| # | 目標 | 説明 |\n`;
        md += `|---|------|------|\n`;
        for (const g of globalGoals.goals) {
            md += `| P${g.priority} | **${g.title}** | ${g.description} |\n`;
        }
        md += '\n';
    }

    // AI Advice
    const advice = getAdvice(projects, globalGoals);
    md += `## 💡 AI Tactical Advice\n\n`;
    md += `> ${advice}\n\n`;
    md += `---\n\n`;

    // Top 2 Priority Projects
    const sortedProjects = [...projects].sort((a, b) => {
        // Sort by globalAlignment desc first, then by priority asc
        if (b.globalAlignment !== a.globalAlignment) return b.globalAlignment - a.globalAlignment;
        return a.priority - b.priority;
    });

    const topProjects = sortedProjects.slice(0, 2);

    md += `## 🚀 Focus Projects\n\n`;

    for (const project of topProjects) {
        const stars = generateStars(project.globalAlignment);
        md += `### ${stars} ${project.name} \`${project.category}\`\n\n`;

        // Active Goals & Phases
        for (const goal of (project.activeGoals || [])) {
            md += `**Goal**: ${goal.title}\n\n`;

            const activePhases = goal.phases.filter(p => p.status === 'active');
            for (const phase of activePhases) {
                const deadlineStr = phase.deadline ? ` ⏳ DUE: ${phase.deadline}` : '';
                md += `**Active Phase**: ${phase.name} — ${generateProgressBar(phase.progress)}${deadlineStr}\n\n`;

                // Doing tasks
                const doingTasks = phase.tasks.filter(t => t.status === 'doing');
                if (doingTasks.length > 0) {
                    md += `🔧 **Doing**:\n`;
                    for (const t of doingTasks) {
                        md += `- [ ] ${t.title}\n`;
                    }
                    md += '\n';
                }

                // Pending tasks (top 3 only for focus)
                const pendingTasks = phase.tasks.filter(t => t.status === 'pending').slice(0, 3);
                if (pendingTasks.length > 0) {
                    md += `📋 **Next Up**:\n`;
                    for (const t of pendingTasks) {
                        md += `- ${t.title}\n`;
                    }
                    const totalPending = phase.tasks.filter(t => t.status === 'pending').length;
                    if (totalPending > 3) {
                        md += `- _...他 ${totalPending - 3} 件_\n`;
                    }
                    md += '\n';
                }
            }
        }

        // Latest Journal
        if (project.latestLog) {
            md += `📓 **Latest Log**: ${project.latestLog}\n\n`;
        }

        md += `---\n\n`;
    }

    // Footer
    md += `_Cockpit Link Stable // Multi-Domain Aggregated_\n`;

    return md;
}

// --- Main ---

function main() {
    const { projects, globalGoals } = discoverProjects();
    const markdown = generateMarkdown(projects, globalGoals);
    fs.writeFileSync(OUTPUT_PATH, markdown, 'utf8');
    console.log(`✅ Dashboard generated: ${OUTPUT_PATH}`);
    console.log(`   Projects found: ${projects.length}`);
    console.log(`   Top 2 displayed: ${[...projects].sort((a, b) => {
        if (b.globalAlignment !== a.globalAlignment) return b.globalAlignment - a.globalAlignment;
        return a.priority - b.priority;
    }).slice(0, 2).map(p => p.name).join(', ')}`);
}

main();
