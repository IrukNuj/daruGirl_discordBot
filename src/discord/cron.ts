import cron from 'node-cron';
import { Client, TextChannel } from 'discord.js';
import { getTasks } from '@/google/service';
import { fetchGuildSettings } from '@/google/config';
import { createListTasksEmbed } from '@/discord/embeds';

export const setupScheduledTasks = (client: Client) => {
    // 毎日 12:00 JST に実行
    cron.schedule('0 12 * * *', async () => {
        console.log('Running daily report task...');

        try {
            // 1. 設定の一括読み込み
            const settings = await fetchGuildSettings();

            // 2. タスクリストの取得 (全サーバー共通)
            const tasks = await getTasks();
            const embed = createListTasksEmbed(tasks);

            // 3. 参加サーバーをループして送信
            for (const [guildId, guild] of client.guilds.cache) {
                // 設定が有効かどうか確認 (デフォルトは無効)
                if (settings.get(guildId)) {
                    const channel = guild.systemChannel;
                    if (channel && channel instanceof TextChannel) {
                        try {
                            await channel.send({ embeds: [embed] });
                            console.log(`Sent daily report to guild: ${guild.name} (${guildId})`);
                        } catch (e) {
                            console.error(`Failed to send report to guild: ${guild.name}`, e);
                        }
                    } else {
                        console.log(`No system channel found for guild: ${guild.name}`);
                    }
                }
            }
        } catch (e) {
            console.error('Error in daily report task:', e);
        }
    }, {
        timezone: "Asia/Tokyo"
    });
};
