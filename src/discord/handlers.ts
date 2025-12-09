import { ChatInputCommandInteraction, CacheType, EmbedBuilder, Colors, StringSelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } from 'discord.js';
import { appendTask, getTasks, getRandomTask, uploadImage, deleteTasks } from 'google/service.js';
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
    .setDescription(`「**${task}**」をやることリストに追加しました。`)
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
         .setDescription('まずは `/やることついか` で追加してね！');
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

/** /やりたいことさくじょ */
export const handleDeleteTask: CommandHandler = async (interaction) => {
  await interaction.deferReply({ ephemeral: true }); // 他の人に見えないように

  const tasks = await getTasks();
  if (tasks.length === 0) {
     await interaction.editReply('現在リストは空です。');
     return;
  }

  // 直近25件 (Discord制限)
  const recentTasks = tasks.slice(0, 25);

  const select = new StringSelectMenuBuilder()
			.setCustomId('select_delete_task')
			.setPlaceholder('削除するタスクを選択してください（複数選択可）')
            .setMinValues(1)
            .setMaxValues(recentTasks.length) // 全選択可能
			.addOptions(
				recentTasks.map(task =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(task.length > 20 ? task.substring(0, 20) + '...' : task)
                        .setValue(task)
                        .setDescription(task.length > 50 ? task.substring(0, 50) + '...' : task)
                )
			);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    await interaction.editReply({
        content: '削除する項目を選んでください（選択すると即座に処理されます）：',
        components: [row]
    });
};

/** Select Menu Interaction Handler */
export const handleDeleteSelect = async (interaction: StringSelectMenuInteraction<CacheType>) => {
    if (interaction.customId === 'select_delete_task') {
        await interaction.deferReply({ ephemeral: true });

        const selectedTasks = interaction.values;
        await deleteTasks(selectedTasks);

        // 元のメッセージのコンポーネント（メニュー）を無効化あるいは削除すると親切だが、今回は単純に完了通知
        await interaction.editReply({
            content: `✅ 以下の${selectedTasks.length}件を削除しました。\n` + selectedTasks.map(t => `・${t}`).join('\n')
        });
    }
};

export const commandHandlers: Record<string, CommandHandler> = {
  [COMMAND_NAMES.ADD_TASK]: handleAddTask,
  [COMMAND_NAMES.LIST_TASKS]: handleListTasks,
  [COMMAND_NAMES.PICK_TASK]: handlePickTask,
  [COMMAND_NAMES.ADD_IMAGE]: handleAddImage,
  [COMMAND_NAMES.CONFIGURE_REPORT]: handleConfigureReport,
  [COMMAND_NAMES.DELETE_TASK]: handleDeleteTask,
};
