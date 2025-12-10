import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { handleReady, handleInteraction, handleGuildCreate } from '@/discord/events.js';
import { setupScheduledTasks } from '@/discord/cron.js';
import { initDb } from '@/db/client.js';

dotenv.config();

// Initialize Database
initDb();

const main = async () => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.on('ready', () => {
        handleReady(client);
        setupScheduledTasks(client);
    });
    client.on('interactionCreate', handleInteraction);
    client.on('guildCreate', handleGuildCreate);

    await client.login(process.env.DISCORD_TOKEN);
};

main().catch(console.error);
