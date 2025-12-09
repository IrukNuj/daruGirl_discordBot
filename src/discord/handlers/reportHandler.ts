import { ChatInputCommandInteraction, CacheType } from 'discord.js';
import { setGuildSetting } from '@/google/config';
import { createConfigUpdatedEmbed } from '@/discord/embeds';
import { CommandHandler } from '@/discord/handlers/index';

/** /れぽーと_せってい */
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

    const embed = createConfigUpdatedEmbed(isEnable);
    await interaction.editReply({ embeds: [embed] });
  } catch (e) {
    console.error(e);
    await interaction.editReply('設定の保存に失敗しました。');
  }
};
