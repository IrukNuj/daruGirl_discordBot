import { EmbedBuilder, Colors } from 'discord.js';

export const createTaskListEmbed = (tasks: string[]): EmbedBuilder => {
    const taskList = tasks.map(t => `・${t}`).join('\n') || '（まだ何もないよ！）';

    return new EmbedBuilder()
      .setTitle('📋 やることリスト')
      .setDescription(taskList)
      .setColor(Colors.Blue)
      .setTimestamp();
};
