import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DASHBOARD_URL = 'https://cockpit.aeternum-gg.jp';

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    console.log(`Dashboard URL: ${DASHBOARD_URL}`);
});

import { findProject, appendToInbox, getLatestLog, getPendingTasks } from './project-utils.js';

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    const projectArg = interaction.options.getString('project');

    // Resolve Project
    const project = findProject(projectArg);
    const projectName = project ? project.name : (projectArg || 'BluePrint');
    const projectPath = project ? project.path : null;

    if (commandName === 'ping') {
        await interaction.reply('Pong! 🏓');

    } else if (commandName === 'status') {
        await interaction.reply({
            content: `**System Status: ONLINE**\n\n🌍 **Dashboard:** ${DASHBOARD_URL}\n✅ **Bot:** Active\n🚀 **Tunnel:** (Assumed Active)`,
        });

    } else if (commandName === 'capture') {
        if (!project) {
            return interaction.reply({ content: `❌ Project "${projectArg}" not found.`, ephemeral: true });
        }
        const text = interaction.options.getString('text');
        appendToInbox(project.path, text);
        await interaction.reply(`✅ Saved to **${projectName}/inbox.md**:\n> ${text}`);

    } else if (commandName === 'log') {
        if (!project) {
            return interaction.reply({ content: `❌ Project "${projectArg}" not found.`, ephemeral: true });
        }
        const log = getLatestLog(project.path);
        if (!log) {
            await interaction.reply(`ℹ️ No journal logs found in **${projectName}**.`);
        } else {
            // Discord message limit is 2000 chars. Truncate if needed.
            const preview = log.content.length > 1800 ? log.content.substring(0, 1800) + '...' : log.content;
            await interaction.reply(`**📄 Latest Log for ${projectName}: ${log.filename}**\n\`\`\`md\n${preview}\n\`\`\``);
        }

    } else if (commandName === 'tasks') {
        if (!project) {
            return interaction.reply({ content: `❌ Project "${projectArg}" not found.`, ephemeral: true });
        }
        const tasks = getPendingTasks(project.path); // Expects array of strings
        if (tasks.length === 0) {
            await interaction.reply(`✅ No pending tasks found in **${projectName}/task.md**!`);
        } else {
            await interaction.reply(`**📝 Pending Tasks for ${projectName}:**\n${tasks.map(t => t.trim()).join('\n')}`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
