import { ChatInputCommandInteraction, CacheType, StringSelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js';
// google/service.ts のインポートを削除 (移行完了のため)
import { addTask, getTasks, getRandomTask, getTasksByIds, completeTasksByIds, Task } from '@/db/tasks.js';
import { createListTasksEmbed, createTaskAddedEmbed, createTaskPickedEmbed, createTaskCompletedMessage } from '@/discord/embeds.js';
import { CommandHandler } from '@/discord/handlers/index.js';

/** /やること_ついか */
export const handleAddTask: CommandHandler = async (interaction) => {
  const title = interaction.options.getString('内容');
  const description = interaction.options.getString('詳細') || '';
  const category = interaction.options.getString('カテゴリ') || 'やること';

  if (!title) {
    await interaction.reply({ content: '内容が空だよ！', ephemeral: true });
    return;
  }

  await interaction.deferReply();

  if (!interaction.guildId) {
      await interaction.editReply('サーバー内でのみ使用できます。');
      return;
  }

  addTask({
      guild_id: interaction.guildId,
      title,
      description,
      category,
      author: interaction.user.tag // または interaction.user.id
  });

  const embed = createTaskAddedEmbed(title, category, description);
  await interaction.editReply({ embeds: [embed] });
};

/** /やること_りすと */
export const handleListTasks: CommandHandler = async (interaction) => {
  await interaction.deferReply();
  if (!interaction.guildId) return;

  const category = interaction.options.getString('カテゴリ');
  const tasks = getTasks(interaction.guildId, category || undefined);
  // Taskオブジェクトを直接新しいWeb生成関数に渡す
  const embed = createListTasksEmbed(tasks);
  await interaction.editReply({ embeds: [embed] });
};

/** /やること_とりだし */
export const handlePickTask: CommandHandler = async (interaction) => {
  await interaction.deferReply();
  if (!interaction.guildId) return;

  const category = interaction.options.getString('カテゴリ');
  const taskObj = getRandomTask(interaction.guildId, category || undefined);
  if (!taskObj) {
      await interaction.editReply('やることは全部終わったか、まだ登録されてないよ！');
      return;
  }

  // Taskオブジェクトを渡す
  const embed = createTaskPickedEmbed(taskObj);

  // OGP展開のためにURLが含まれていれば content にも含める
  const urlMatch = taskObj.description ? taskObj.description.match(/(https?:\/\/[^\s]+)/) : null;
  const content = urlMatch ? `これを見るよ！ ${urlMatch[0]}` : '';

  await interaction.editReply({ content, embeds: [embed] });
};

/** /やること_さくじょ */
export const handleDeleteTask: CommandHandler = async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  if (!interaction.guildId) return;

  // TODOのみか全件か？ 現状は全件表示
  const tasks = getTasks(interaction.guildId);
  if (tasks.length === 0) {
     await interaction.editReply('現在リストは空です。');
     return;
  }

  const recentTasks = tasks.slice(0, 25);

  const select = new StringSelectMenuBuilder()
			.setCustomId('select_delete_task')
			.setPlaceholder('削除するタスクを選択してください')
            .setMinValues(1)
            .setMaxValues(recentTasks.length)
			.addOptions(
                recentTasks.map(task =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(task.title.substring(0, 25))
                        .setValue(task.id.toString()) // IDをValueに使用
                        .setDescription(`Status: ${task.status}`)
                )
			);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    await interaction.editReply({
        content: '削除する項目を選んでください：',
        components: [row]
    });
};

/** セレクトメニューのインタラクションハンドラ */
export const handleDeleteSelect = async (interaction: StringSelectMenuInteraction<CacheType>) => {
    if (interaction.customId === 'select_delete_task') {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guildId) return;

        const selectedIds = interaction.values.map(v => parseInt(v, 10));

        // 完了メッセージ用にタイトルを取得
        const tasks = getTasksByIds(interaction.guildId, selectedIds);
        const titles = tasks.map(t => t.title);

        // ステータスをDONEに更新
        completeTasksByIds(interaction.guildId, selectedIds);

        await interaction.editReply({
            content: createTaskCompletedMessage(titles)
        });
    }
};
