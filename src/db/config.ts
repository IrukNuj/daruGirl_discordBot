import db from '@/db/client.js';

/**
 * データベースから全サーバーのレポート設定を取得します。
 * @returns サーバーIDをキー、有効状態(boolean)を値とするMap
 */
export const fetchGuildSettings = (): Map<string, boolean> => {
  const stmt = db.prepare('SELECT * FROM guild_configs');
  const rows = stmt.all() as { guild_id: string, report_enabled: number }[];

  const settings = new Map<string, boolean>();
  rows.forEach(row => {
    settings.set(row.guild_id, row.report_enabled === 1);
  });

  return settings;
};

/**
 * サーバーのレポート設定を保存（または更新）します。
 * @param guildId - サーバーID
 * @param isEnabled - レポートを有効にするかどうか
 */
export const setGuildSetting = (guildId: string, isEnabled: boolean): void => {
  const stmt = db.prepare(`
    INSERT INTO guild_configs (guild_id, report_enabled)
    VALUES (?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET report_enabled = excluded.report_enabled
  `);

  stmt.run(guildId, isEnabled ? 1 : 0);
};
