import { ChatInputCommandInteraction, CacheType, StringSelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js';
// Relative path from src/discord/handlers/taskHandler.ts to src/google/service.ts is ../../../google/service.js
import { appendTask, getTasks, getRandomTask, deleteTasks } from '@/google/service';
// Relative path to embeds is ../embeds.js
import { createListTasksEmbed, createTaskAddedEmbed, createTaskPickedEmbed, createTaskDeletedEmbed } from '@/discord/embeds';
import { CommandHandler } from '@/discord/handlers/index';

/** /やること_ついか */
export const handleAddTask: CommandHandler = async (interaction) => {
  const task = interaction.options.getString('内容');
  if (!task) {
    await interaction.reply({ content: '内容が空だよ！', ephemeral: true });
    return;
  }
  await interaction.deferReply();
  await appendTask(task);

  const embed = createTaskAddedEmbed(task);
  await interaction.editReply({ embeds: [embed] });
};

/** /やること_りすと */
export const handleListTasks: CommandHandler = async (interaction) => {
  await interaction.deferReply();
  const tasks = await getTasks();
  const embed = createListTasksEmbed(tasks);
  await interaction.editReply({ embeds: [embed] });
};

/** /やること_とりだし */
export const handlePickTask: CommandHandler = async (interaction) => {
  await interaction.deferReply();
  const task = await getRandomTask();

  const embed = createTaskPickedEmbed(task);
  await interaction.editReply({ embeds: [embed] });
};

/** /やること_さくじょ */
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
            content: createTaskDeletedEmbed(selectedTasks)
        });
    }
};
