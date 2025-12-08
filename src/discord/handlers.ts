import { ChatInputCommandInteraction, CacheType, EmbedBuilder, Colors } from 'discord.js';
import { appendTask, getTasks, getRandomTask, uploadImage } from 'google/service.js';
import { setGuildSetting } from 'google/config.js';
import { createTaskListEmbed } from './embeds.js';
import { COMMAND_NAMES } from './constants.js';

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

  const embed = new EmbedBuilder()
    .setTitle('✅ 追加しました！')
    .setDescription(`「**${task}**」をやりたいことリストに追加しました。`)
    .setColor(Colors.Green)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
};

/** /やりたいことりすと */
export const handleListTasks: CommandHandler = async (interaction) => {
  await interaction.deferReply();
  const tasks = await getTasks();
  const embed = createTaskListEmbed(tasks);
  await interaction.editReply({ embeds: [embed] });
};

/** /やりたいこととりだし */
export const handlePickTask: CommandHandler = async (interaction) => {
  await interaction.deferReply();
  const task = await getRandomTask();

  const embed = new EmbedBuilder()
    .setColor(Colors.Gold)
    .setTimestamp();

  if (task) {
    embed.setTitle('🎲 今日のご提案')
         .setDescription(`これはいかがですか？\n\n**「${task}」**`);
  } else {
    embed.setTitle('😢 リストが空です')
         .setDescription('まずは `/やりたいことついか` で追加してね！');
  }

  await interaction.editReply({ embeds: [embed] });
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

  const embed = new EmbedBuilder()
    .setTitle('🖼️ 画像を保存しました')
    .addFields(
        { name: 'メモ', value: memo || 'なし', inline: true },
        { name: 'Drive Link', value: `[開く](${link})`, inline: true }
    )
    .setImage(image.url)
    .setColor(Colors.Aqua)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
};

/** /レポート設定 */
export const handleConfigureReport: CommandHandler = async (interaction) => {
  const status = interaction.options.getString('状態');
  const isEnable = status === 'enable';

  if (!interaction.guildId) {
    await interaction.reply({ content: 'サーバー内でのみ実行できます。', ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    await setGuildSetting(interaction.guildId, isEnable);

    const embed = new EmbedBuilder()
      .setTitle('⚙️ 設定を変更しました')
      .setDescription(`定期レポートを **${isEnable ? '有効' : '無効'}** にしました。`)
      .setColor(isEnable ? Colors.Green : Colors.Grey)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (e) {
    console.error(e);
    await interaction.editReply('設定の保存に失敗しました。');
  }
};

export const commandHandlers: Record<string, CommandHandler> = {
  [COMMAND_NAMES.ADD_TASK]: handleAddTask,
  [COMMAND_NAMES.LIST_TASKS]: handleListTasks,
  [COMMAND_NAMES.PICK_TASK]: handlePickTask,
  [COMMAND_NAMES.ADD_IMAGE]: handleAddImage,
  [COMMAND_NAMES.CONFIGURE_REPORT]: handleConfigureReport,
};
