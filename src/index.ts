import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { handleReady, handleInteraction } from 'discord/events.js';
import { setupScheduledTasks } from 'discord/cron.js';

dotenv.config();

const main = async () => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.on('ready', () => {
        handleReady(client);
        setupScheduledTasks(client);
    });
    client.on('interactionCreate', handleInteraction);

    await client.login(process.env.DISCORD_TOKEN);
};

main().catch(console.error);
