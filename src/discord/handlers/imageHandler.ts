import { ChatInputCommandInteraction, CacheType } from 'discord.js';
import { uploadImageToDrive } from '@/google/service.js';
import { saveImageMetadata } from '@/db/images.js';
import { createImageUploadedEmbed } from '@/discord/embeds.js';
import { CommandHandler } from '@/discord/handlers/index.js';

/** /いらすと_ついか */
export const handleAddImage: CommandHandler = async (interaction) => {
  const image = interaction.options.getAttachment('画像');
  const memo = interaction.options.getString('メモ') || '';

  if (!image || !image.contentType?.startsWith('image/')) {
    await interaction.reply({ content: '画像ファイルを選択してね！', ephemeral: true });
    return;
  }

  await interaction.deferReply();

  if (!interaction.guildId) {
      await interaction.editReply('サーバー内でのみ使用できます。');
      return;
  }

  const { webViewLink } = await uploadImageToDrive(image.url);
  saveImageMetadata(interaction.guildId, webViewLink, memo, interaction.user.tag);

  const embed = createImageUploadedEmbed(webViewLink, memo, image.url);
  await interaction.editReply({ embeds: [embed] });
};
