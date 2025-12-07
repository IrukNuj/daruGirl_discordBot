import { ChatInputCommandInteraction, CacheType } from 'discord.js';
import { appendTask, getTasks, getRandomTask, uploadImage } from '@/google/service.js';
import { COMMAND_NAMES } from '@/discord/constants.js';

export type CommandHandler = (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>;

/** /やりたいことついか */
export const handleAddTask: CommandHandler = async (interaction) => {
  const task = interaction.options.getString('内容');
  if (!task) {
    await interaction.reply({ content: '内容が空だよ！', ephemeral: true });
    return;
  }
  await interaction.deferReply();
  await appendTask(task);
  await interaction.editReply(`「${task}」をリストに追加したよ！`);
};

/** /やりたいことりすと */
export const handleListTasks: CommandHandler = async (interaction) => {
  await interaction.deferReply();
  const tasks = await getTasks();
  const taskList = tasks.map(t => `- ${t}`).join('\n') || 'リストは空だよ！';
  await interaction.editReply(`**やりたいことリスト**\n${taskList}`);
};

/** /やりたいこととりだし */
export const handlePickTask: CommandHandler = async (interaction) => {
  await interaction.deferReply();
  const task = await getRandomTask();
  await interaction.editReply(task ? `これどう？: **${task}**` : 'リストは空だよ！');
};

/** /いらすとついか */
export const handleAddImage: CommandHandler = async (interaction) => {
  const image = interaction.options.getAttachment('画像');
  const memo = interaction.options.getString('メモ') || '';

  if (!image || !image.contentType?.startsWith('image/')) {
    await interaction.reply({ content: '画像ファイルを選択してね！', ephemeral: true });
    return;
  }

  await interaction.deferReply();
  const link = await uploadImage(image.url, memo);
  await interaction.editReply(`画像を保存したよ！\nリンク: ${link}\nメモ: ${memo}`);
};

export const commandHandlers: Record<string, CommandHandler> = {
  [COMMAND_NAMES.ADD_TASK]: handleAddTask,
  [COMMAND_NAMES.LIST_TASKS]: handleListTasks,
  [COMMAND_NAMES.PICK_TASK]: handlePickTask,
  [COMMAND_NAMES.ADD_IMAGE]: handleAddImage,
};
