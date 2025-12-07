import { SlashCommandBuilder, REST, Routes } from 'discord.js';
import { COMMAND_NAMES } from './constants.js';

const commands = [
  new SlashCommandBuilder().setName(COMMAND_NAMES.ADD_TASK).setDescription('タスクを追加します').addStringOption(option => option.setName('内容').setDescription('タスクの内容').setRequired(true)),
  new SlashCommandBuilder().setName(COMMAND_NAMES.LIST_TASKS).setDescription('タスク一覧を表示します'),
  new SlashCommandBuilder().setName(COMMAND_NAMES.PICK_TASK).setDescription('ランダムにタスクを提案します'),
  new SlashCommandBuilder().setName(COMMAND_NAMES.ADD_IMAGE).setDescription('イラストをDriveに保存します').addAttachmentOption(option => option.setName('画像').setDescription('保存する画像').setRequired(true)).addStringOption(option => option.setName('メモ').setDescription('画像のメモ')),
].map(command => command.toJSON());

export const registerGuildCommands = async (token: string, clientId: string, guildId: string) => {
    const rest = new REST({ version: '10' }).setToken(token);
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Failed to reload commands:', error);
    }
};
