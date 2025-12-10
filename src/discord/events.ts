import { Client, Interaction } from 'discord.js';
import { registerGuildCommands } from '@/discord/commands.js';
import { commandHandlers, handleDeleteSelect } from '@/discord/handlers/index.js';

export const handleReady = async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}!`);
    const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

    if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
        console.error('Environment variables missing: DISCORD_TOKEN or DISCORD_CLIENT_ID');
        return;
    }

    // 参加している全サーバーにコマンドを登録
    const registerPromises = client.guilds.cache.map(guild => {
        console.log(`Registering commands for guild: ${guild.name} (${guild.id})`);
        return registerGuildCommands(DISCORD_TOKEN, DISCORD_CLIENT_ID, guild.id);
    });

    await Promise.all(registerPromises);
};

export const handleGuildCreate = async (guild: import('discord.js').Guild) => {
    console.log(`Joined new guild: ${guild.name} (${guild.id})`);
    const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

    if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) return;

    await registerGuildCommands(DISCORD_TOKEN, DISCORD_CLIENT_ID, guild.id);
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
