import Database from 'better-sqlite3';
import path from 'path';

/** SQLiteデータベースファイルのパス */
const dbPath = path.resolve(process.cwd(), 'database.sqlite');

const db = new Database(dbPath, { verbose: console.log });

/**
 * データベースの初期化を行います。
 * 必要なテーブル (tasks, images, guild_configs) が存在しない場合は作成します。
 */
export const initDb = () => {
  // タスク管理テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'TODO' CHECK(status IN ('TODO', 'CHECK', 'DONE')),
      author TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // 画像ログテーブル (ドライブへの保存履歴)
  db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      url TEXT NOT NULL,
      memo TEXT,
      author TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // サーバー設定テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS guild_configs (
      guild_id TEXT PRIMARY KEY,
      report_enabled BOOLEAN DEFAULT 0
    )
  `);

  console.log('Database initialized successfully.');
};

export default db;
