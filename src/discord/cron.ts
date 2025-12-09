import cron from 'node-cron';
import { Client, TextChannel } from 'discord.js';
import { getTasks } from '@/db/tasks.js';
import { fetchGuildSettings } from '@/db/config.js';
import { createListTasksEmbed } from '@/discord/embeds.js';

export const setupScheduledTasks = (client: Client) => {
    // 毎日 12:00 JST に実行
    cron.schedule('0 12 * * *', async () => {
        console.log('Running daily report task...');

        try {
            // 1. 設定の一括読み込み
            const settings = fetchGuildSettings(); // await removed as DB is sync

            // 2. 参加サーバーをループして処理
             for (const [guildId, guild] of client.guilds.cache) {
                // 設定確認
                if (settings.get(guildId)) {
                    // サーバーごとのタスク取得
                    const tasks = getTasks(guildId);
                    const embed = createListTasksEmbed(tasks);

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
