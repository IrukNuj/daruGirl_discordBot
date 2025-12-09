import db from '@/db/client.js';

/**
 * アップロードされた画像のメタデータを保存します。
 * @param guildId - サーバーID
 * @param url - 画像のWeb表示用URL (Google Drive Link)
 * @param memo - 画像のメモ
 * @param author - アップロードしたユーザー
 */
export const saveImageMetadata = (guildId: string, url: string, memo: string, author: string): void => {
  const stmt = db.prepare(`
    INSERT INTO images (guild_id, url, memo, author, created_at)
    VALUES (@guildId, @url, @memo, @author, @createdAt)
  `);

  stmt.run({
    guildId,
    url,
    memo,
    author,
    createdAt: new Date().toISOString()
  });
};
