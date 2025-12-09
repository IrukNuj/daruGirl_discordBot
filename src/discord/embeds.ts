import { EmbedBuilder, Colors } from 'discord.js';

export const createListTasksEmbed = (tasks: string[]): EmbedBuilder => {
    const taskList = tasks.map(t => `・${t}`).join('\n') || '（まだ何もないよ！）';

    return new EmbedBuilder()
      .setTitle('📋 やることリスト')
      .setDescription(taskList)
      .setColor(Colors.Blue)
      .setTimestamp();
};

export const createTaskAddedEmbed = (task: string): EmbedBuilder => {
    return new EmbedBuilder()
    .setTitle('✅ 追加しました！')
    .setDescription(`「**${task}**」をやることリストに追加しました。`)
    .setColor(Colors.Green)
    .setTimestamp();
};

export const createTaskPickedEmbed = (task: string | null): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setColor(Colors.Gold)
        .setTimestamp();

    if (task) {
        embed.setTitle('🎲 今日のご提案')
             .setDescription(`これはいかがですか？\n\n**「${task}」**`);
    } else {
        embed.setTitle('😢 リストが空です')
             .setDescription('まずは `/やること_ついか` で追加してね！');
    }
    return embed;
};

export const createImageUploadedEmbed = (link: string, memo: string, imageUrl: string): EmbedBuilder => {
    return new EmbedBuilder()
    .setTitle('🖼️ 画像を保存しました')
    .addFields(
        { name: 'メモ', value: memo || 'なし', inline: true },
        { name: 'Drive Link', value: `[開く](${link})`, inline: true }
    )
    .setImage(imageUrl)
    .setColor(Colors.Aqua)
    .setTimestamp();
};

export const createConfigUpdatedEmbed = (isEnable: boolean): EmbedBuilder => {
    return new EmbedBuilder()
      .setTitle('⚙️ 設定を変更しました')
      .setDescription(`定期レポートを **${isEnable ? '有効' : '無効'}** にしました。`)
      .setColor(isEnable ? Colors.Green : Colors.Grey)
      .setTimestamp();
};

export const createTaskDeletedEmbed = (deletedTasks: string[]): string => {
    // 削除完了はEmbedではなくテキストメッセージ（+リスト）で返していたが、
    // ここで文字列生成ロジックだけ持っておく、あるいはEmbed化するかだが、
    // 元のハンドラの実装がテキストだったので一旦テキスト生成ヘルパーとするか、
    // 要件が「ほかのembedに関しても生成してください」なのでEmbed化を試みる。
    // しかし元のUXを変えない範囲で、テキストメッセージ構築ロジックを返す。
    // User requested "generate for other embeds", so returning Embed is safer if appropriate,
    // but the delete handler used simple text content in `editReply` before.
    // Let's stick to the previous implementation style for deletion (Message content)
    // OR creates a simple embed for consistency?
    // Given the trend, let's make it an Embed.
    // BUT the previous implementation was: `✅ 以下の...` as `content`.
    // I will return an Embed for consistency provided the user asked for it.

    // Wait, let's keep it simple. If I change to Embed, I change the UX.
    // The prompt says "generate for other embeds". The delete handler response WAS NOT an embed.
    // So I might skip this one or just return the text formatter.
    // Actually, looking at `handlers.ts`, `handleDeleteSelect` uses `await interaction.editReply({ content: ... })`.
    // It is NOT an embed. So strictly speaking, I don't need to make an factory for it unless I convert it to Embed.
    // I will SKIP delete for now as it's not an embed, or create a text helper?
    // Let's create `createDeleteResultContent` just in case.
    return `✅ 以下の${deletedTasks.length}件を削除しました。\n` + deletedTasks.map(t => `・${t}`).join('\n');
};
