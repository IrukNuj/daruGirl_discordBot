import db from '@/db/client.js';

/** タスクのステータス TODO: 未着手, CHECK: 確認中, DONE: 完了 */
export type TaskStatus = 'TODO' | 'CHECK' | 'DONE';

/** タスクデータのモデル */
export type Task = {
  /** タスクID (自動採番) */
  id: number;
  /** DiscordサーバーID */
  guild_id: string;
  /** タスクのタイトル */
  title: string;
  /** タスクの詳細説明 */
  description: string;
  /** タスクのカテゴリ (例: 'やること', '映画') */
  category: string;
  /** 進行ステータス */
  status: TaskStatus;
  /** 作成者のユーザーID/タグ */
  author: string;
  /** 作成日時 (ISOString) */
  created_at: string;
  /** 更新日時 (ISOString) */
  updated_at: string;
};

/**
 * 新しいタスクをDBに追加します。
 * @param task - 追加するタスク情報 (id, status, dates は自動設定)
 */
export const addTask = (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'>): void => {
  const stmt = db.prepare(`
    INSERT INTO tasks (guild_id, title, description, category, status, author, created_at, updated_at)
    VALUES (@guild_id, @title, @description, @category, 'TODO', @author, @created_at, @updated_at)
  `);

  const now = new Date().toISOString();
  stmt.run({
    ...task,
    created_at: now,
    updated_at: now
  });
};

/**
 * 特定のサーバーのタスク一覧を取得します。
 * @param guildId - サーバーID
 * @returns 作成日時の降順でソートされたタスク配列
 */
export const getTasks = (guildId: string, category?: string): Task[] => {
  const queryParts = [
    'SELECT * FROM tasks',
    'WHERE guild_id = ?',
    ...(category ? ['AND category = ?'] : []),
    'ORDER BY created_at DESC'
  ];
  const query = queryParts.join(' ');
  const params = [guildId, ...(category ? [category] : [])];

  const stmt = db.prepare(query);
  return stmt.all(...params) as Task[];
};

/**
 * 'TODO' ステータスのタスクからランダムに1件取得します。
 * @param guildId - サーバーID
 * @returns ランダムなタスク、または存在しない場合は null
 */
export const getRandomTask = (guildId: string, category?: string): Task | null => {
  const queryParts = [
    'SELECT * FROM tasks',
    'WHERE guild_id = ? AND status = \'TODO\'',
    ...(category ? ['AND category = ?'] : []),
    'ORDER BY RANDOM() LIMIT 1'
  ];
  const query = queryParts.join(' ');
  const params = [guildId, ...(category ? [category] : [])];

  const stmt = db.prepare(query);
  return (stmt.get(...params) as Task) || null;
};

/**
 * 指定されたタイトルのタスクを削除します。
 * ※現在は互換性のためにタイトル指定ですが、将来的にはID指定への移行を検討しています。
 * @param guildId - サーバーID
 * @param titles - 削除対象のタイトル配列
 */
// deleteTasksByTitle is deprecated/unused now, replacing or adding new logic
/**
 * 指定されたIDのタスクを取得します。
 */
export const getTasksByIds = (guildId: string, ids: number[]): Task[] => {
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`SELECT * FROM tasks WHERE guild_id = ? AND id IN (${placeholders})`);
  return stmt.all(guildId, ...ids) as Task[];
};

/**
 * 指定されたIDのタスクを完了（DONE）にします。
 */
export const completeTasksByIds = (guildId: string, ids: number[]): void => {
  const placeholders = ids.map(() => '?').join(',');
  const now = new Date().toISOString();
  const stmt = db.prepare(`UPDATE tasks SET status = 'DONE', updated_at = ? WHERE guild_id = ? AND id IN (${placeholders})`);
  stmt.run(now, guildId, ...ids);
};

/**
 * タスクのステータスを更新します。
 * @param id - タスクID
 * @param status - 新しいステータス
 */
export const updateTaskStatus = (id: number, status: TaskStatus): void => {
  const stmt = db.prepare('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?');
  stmt.run(status, new Date().toISOString(), id);
};
