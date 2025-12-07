
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Interaction, ChatInputCommandInteraction, CacheType } from 'discord.js';
import dotenv from 'dotenv';
import { appendTask, getTasks, getRandomTask, uploadImage } from './googleClient.js';
import { handleAddTask, handleListTasks, handlePickTask, handleAddImage, CommandHandler } from './handlers.js';

dotenv.config();

const COMMAND_NAMES = {
  ADD_TASK: 'やりたいことついか',
  LIST_TASKS: 'やりたいことりすと',
  PICK_TASK: 'やりたいこととりだし',
  ADD_IMAGE: 'いらすとついか',
} as const;

const commands = [
  new SlashCommandBuilder().setName(COMMAND_NAMES.ADD_TASK).setDescription('タスクを追加します').addStringOption(option => option.setName('内容').setDescription('タスクの内容').setRequired(true)),
  new SlashCommandBuilder().setName(COMMAND_NAMES.LIST_TASKS).setDescription('タスク一覧を表示します'),
  new SlashCommandBuilder().setName(COMMAND_NAMES.PICK_TASK).setDescription('ランダムにタスクを提案します'),
  new SlashCommandBuilder().setName(COMMAND_NAMES.ADD_IMAGE).setDescription('イラストをDriveに保存します').addAttachmentOption(option => option.setName('画像').setDescription('保存する画像').setRequired(true)).addStringOption(option => option.setName('メモ').setDescription('画像のメモ')),
].map(command => command.toJSON());

const commandHandlers: Record<string, CommandHandler> = {
  [COMMAND_NAMES.ADD_TASK]: handleAddTask,
  [COMMAND_NAMES.LIST_TASKS]: handleListTasks,
  [COMMAND_NAMES.PICK_TASK]: handlePickTask,
  [COMMAND_NAMES.ADD_IMAGE]: handleAddImage,
};

const main = async () => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || '');

    client.on('ready', async () => {
        console.log(`Logged in as ${client.user?.tag}!`);
        if (process.env.CLIENT_ID && process.env.GUILD_ID) {
            try {
                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                    { body: commands },
                );
                console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.error('Failed to reload commands:', error);
            }
        } else {
            console.error('CLIENT_ID or GUILD_ID is missing in .env');
        }
    });

    client.on('interactionCreate', async (interaction: Interaction) => {
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
    });

    await client.login(process.env.DISCORD_TOKEN);
};

main().catch(console.error);
