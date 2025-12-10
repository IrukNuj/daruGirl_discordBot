
import { EmbedBuilder, Colors } from 'discord.js';
// Task型をインポートして createListTasksEmbed で使用
import { Task } from '@/db/tasks.js';

export const createListTasksEmbed = (tasks: Task[]): EmbedBuilder => {
    const embed = new EmbedBuilder()
      .setTitle('📋 やることリスト')
      .setColor(Colors.Blue)
      .setTimestamp();

    if (tasks.length === 0) {
        embed.setDescription('（まだ何もないよ！）');
        return embed;
    }

    // 表示件数を25件に制限 (DiscordのField制限)
    const recentTasks = tasks.slice(0, 25);

    // 件数が多すぎる場合はメッセージを追加
    if (tasks.length > 25) {
        embed.setDescription(`※最新の25件を表示しています（全${tasks.length}件）`);
    }

    recentTasks.forEach(task => {
        // ステータスの絵文字
        const statusEmoji = task.status === 'DONE' ? '✅' : task.status === 'CHECK' ? '👀' : '⬜';
        // 詳細ロジック: URLが含まれる場合はクリック可能になります
        // DiscordのField Valueは空文字不可のため、空の場合はフォールバックします
        const descValue = task.description ? task.description : '（詳細なし）';

        embed.addFields({
            name: `${statusEmoji} [${task.category || 'やること'}] ${task.title}`,
            value: descValue
        });
    });

    return embed;
};

export const createTaskAddedEmbed = (title: string, category: string, description: string): EmbedBuilder => {
    const embed = new EmbedBuilder()
    .setTitle('✅ 追加しました！')
    .setDescription(`「**${title}**」をやることリストについかしたよ！`)
    .setColor(Colors.Green)
    .setTimestamp();

    embed.addFields(
        { name: 'カテゴリ', value: category || 'やること', inline: true },
        { name: '詳細', value: description || '（なし）', inline: false }
    );

    return embed;
};

export const createTaskPickedEmbed = (task: Task | null): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setColor(Colors.Gold)
        .setTimestamp();

    if (task) {
        // URL抽出
        const urlMatch = task.description?.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[0] : null;

        // タイトルをリンク化
        const displayTitle = url ? `[${task.title}](${url})` : task.title;

        embed.setTitle('🎲 今日のご提案')
             .setDescription(`これはいかがですか？\n\n**「${displayTitle}」**`)
             .addFields(
                { name: 'カテゴリ', value: task.category || 'やること', inline: true },
                { name: '詳細', value: task.description || '（なし）', inline: false }
            );
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

export const createTaskCompletedMessage = (completedTasks: string[]): string => {
    // 完了時のメッセージ生成
    return `✅ 以下の${completedTasks.length}件を完了（DONE）にしました。\n` + completedTasks.map(t => `・${t}`).join('\n');
};
