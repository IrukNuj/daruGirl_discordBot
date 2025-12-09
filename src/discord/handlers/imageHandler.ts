import { ChatInputCommandInteraction, CacheType } from 'discord.js';
import { uploadImage } from '@/google/service';
import { createImageUploadedEmbed } from '@/discord/embeds';
import { CommandHandler } from '@/discord/handlers/index';

/** /いらすと_ついか */
export const handleAddImage: CommandHandler = async (interaction) => {
  const image = interaction.options.getAttachment('画像');
  const memo = interaction.options.getString('メモ') || '';

  if (!image || !image.contentType?.startsWith('image/')) {
    await interaction.reply({ content: '画像ファイルを選択してね！', ephemeral: true });
    return;
  }

  await interaction.deferReply();
  const link = await uploadImage(image.url, memo);

  const embed = createImageUploadedEmbed(link, memo, image.url);
  await interaction.editReply({ embeds: [embed] });
};
