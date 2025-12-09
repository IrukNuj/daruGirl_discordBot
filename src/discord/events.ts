import { Client, Interaction } from 'discord.js';
import { registerGuildCommands } from 'discord/commands.js';
import { registerGuildCommands } from 'discord/commands.js';
import { commandHandlers, handleDeleteSelect } from './handlers.js';

export const handleReady = async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}!`);
    const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;

    if (DISCORD_TOKEN && DISCORD_CLIENT_ID && DISCORD_GUILD_ID) {
        await registerGuildCommands(DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID);
    } else {
        console.error('Environment variables missing: DISCORD_TOKEN, DISCORD_CLIENT_ID, or DISCORD_GUILD_ID');
    }
};

export const handleInteraction = async (interaction: Interaction) => {
    if (interaction.isStringSelectMenu()) {
        await handleDeleteSelect(interaction);
        return;
    }

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
