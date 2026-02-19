import 'dotenv/config';
import { REST, Routes } from 'discord.js';

const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    {
        name: 'status',
        description: 'Checks the status of the dashboard and bot.',
    },
    {
        name: 'capture',
        description: 'Save a note to Inbox.',
        options: [
            {
                name: 'text',
                description: 'The content of your note',
                type: 3, // STRING
                required: true,
            },
            {
                name: 'project',
                description: 'Target project (e.g. Oduman)',
                type: 3, // STRING
                required: false,
            },
        ],
    },
    {
        name: 'log',
        description: 'Read the latest journal entry.',
        options: [
            {
                name: 'project',
                description: 'Target project (e.g. Oduman)',
                type: 3, // STRING
                required: false,
            },
        ],
    },
    {
        name: 'tasks',
        description: 'List pending tasks.',
        options: [
            {
                name: 'project',
                description: 'Target project (e.g. Oduman)',
                type: 3, // STRING
                required: false,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const clientId = process.env.CLIENT_ID;
        if (!clientId) throw new Error("CLIENT_ID is missing in .env");

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
