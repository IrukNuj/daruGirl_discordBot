import { ChatInputCommandInteraction, CacheType, StringSelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js';
import { ChatInputCommandInteraction, CacheType, StringSelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js';
// Removed google/service.ts import
import { addTask, getTasks, getRandomTask, deleteTasksByTitle, Task } from '@/db/tasks.js';
import { createListTasksEmbed, createTaskAddedEmbed, createTaskPickedEmbed, createTaskDeletedEmbed } from '@/discord/embeds.js';
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
      author: interaction.user.tag // or interaction.user.id
  });

  const embed = createTaskAddedEmbed(title);
  await interaction.editReply({ embeds: [embed] });
};

/** /やること_りすと */
export const handleListTasks: CommandHandler = async (interaction) => {
  await interaction.deferReply();
  if (!interaction.guildId) return;

  const tasks = getTasks(interaction.guildId);
  // mapping Task objects to string for existing embed compatibility or updating embed
  // For now, let's update call to pass Task objects if we update embed, OR map to string.
  // The existing embed expects string[]. We should update embed later.
  // Mapping to string format "[Category] Title [Status]"
  const taskStrings = tasks.map(t => `[${t.category}] ${t.title} [${t.status}]`);

  const embed = createListTasksEmbed(taskStrings);
  await interaction.editReply({ embeds: [embed] });
};

/** /やること_とりだし */
export const handlePickTask: CommandHandler = async (interaction) => {
  await interaction.deferReply();
  if (!interaction.guildId) return;

  const taskObj = getRandomTask(interaction.guildId);
  if (!taskObj) {
      await interaction.editReply('やることは全部終わったか、まだ登録されてないよ！');
      return;
  }

  // existing embed expects string
  const embed = createTaskPickedEmbed(taskObj.title);
  await interaction.editReply({ embeds: [embed] });
};

/** /やること_さくじょ */
export const handleDeleteTask: CommandHandler = async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  if (!interaction.guildId) return;

  // Only TODO tasks? or all? Let's show all
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
                        .setValue(task.title) // Still using title for value for now to match handleDeleteSelect signature logic
                        .setDescription(`Status: ${task.status}`)
                )
			);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    await interaction.editReply({
        content: '削除する項目を選んでください：',
        components: [row]
    });
};

/** Select Menu Interaction Handler */
export const handleDeleteSelect = async (interaction: StringSelectMenuInteraction<CacheType>) => {
    if (interaction.customId === 'select_delete_task') {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guildId) return;

        const selectedTitles = interaction.values;
        deleteTasksByTitle(interaction.guildId, selectedTitles);

        await interaction.editReply({
            content: createTaskDeletedEmbed(selectedTitles)
        });
    }
};
