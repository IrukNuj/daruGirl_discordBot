import { SlashCommandBuilder, REST, Routes } from 'discord.js';
import { COMMAND_NAMES } from 'discord/constants.js';

const commands = [
  new SlashCommandBuilder().setName(COMMAND_NAMES.ADD_TASK).setDescription('タスクを追加します').addStringOption(option => option.setName('内容').setDescription('タスクの内容').setRequired(true)),
  new SlashCommandBuilder().setName(COMMAND_NAMES.LIST_TASKS).setDescription('タスク一覧を表示します'),
  new SlashCommandBuilder().setName(COMMAND_NAMES.PICK_TASK).setDescription('ランダムにタスクを提案します'),
  new SlashCommandBuilder().setName(COMMAND_NAMES.ADD_IMAGE).setDescription('イラストをDriveに保存します').addAttachmentOption(option => option.setName('画像').setDescription('保存する画像').setRequired(true)).addStringOption(option => option.setName('メモ').setDescription('画像のメモ')),
  new SlashCommandBuilder().setName(COMMAND_NAMES.CONFIGURE_REPORT).setDescription('定期レポートのON/OFFを設定します').addStringOption(option => option.setName('状態').setDescription('有効 or 無効').setRequired(true).addChoices({ name: '有効', value: 'enable' }, { name: '無効', value: 'disable' })),
  new SlashCommandBuilder().setName(COMMAND_NAMES.DELETE_TASK).setDescription('タスクを選択して削除します'),
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
