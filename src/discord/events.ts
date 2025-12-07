import { Client, Interaction } from 'discord.js';
import { registerGuildCommands } from './commands.js';
import { commandHandlers } from './handlers.js';

export const handleReady = async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}!`);
    const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

    if (DISCORD_TOKEN && CLIENT_ID && GUILD_ID) {
        await registerGuildCommands(DISCORD_TOKEN, CLIENT_ID, GUILD_ID);
    } else {
        console.error('Environment variables missing: DISCORD_TOKEN, CLIENT_ID, or GUILD_ID');
    }
};

export const handleInteraction = async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const handler = commandHandlers[interaction.commandName];
    if (handler) {
        try {
            await handler(interaction);
        } catch (error) {
            console.error(error);
            const reply = { content: 'エラーが発生したよ...', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }
};
