# 実装計画: Google Sheets から SQLite への移行

## 目標
データの保存先を Google Sheets から SQLite (ローカルDB) に変更します。
また、タスクデータの構造を以下の通り拡張します。

```typescript
type Task = {
  id: number;           // DBでの主キー
  guild_id: string;     // サーバーID
  title: string;        // タイトル
  description: string;  // 詳細
  status: 'TODO' | 'CHECK' | 'DONE'; // ステータス (デフォルト: TODO)
  author: string;       // 作成者
  created_at: string;   // 作成日時
  updated_at: string;   // 更新日時
}
```

## ユーザー確認事項
- **SQLiteの採用**: サーバーレスで扱いやすく、Discord BotのローカルDBとして適しているため SQLite (`better-sqlite3`) を採用します。
- **データ移行**: 既存のGoogle Sheetsのデータは移行しません（新規DBとして開始）。
- **画像の扱い**: `/いらすと_ついか` の画像データ本体は引き続き Google Drive に保存し、その「リンク」と「メモ」を SQLite に保存する形式に変更します。

## 変更内容
(省略: 前回の内容と同じ)

### [NEW] GCP (サーバー側) での作業手順
今回の変更はライブラリの追加 (`better-sqlite3`) を含むため、サーバー上で再ビルドが必要です。
ローカルDB (ファイル) に変更されるため、データの永続化についても注意が必要です。

#### 1. デプロイ手順
1. **VMにSSH接続**:
   ```bash
   gcloud compute ssh [INSTANCE_NAME]
   ```
2. **コードの更新**:
   ```bash
   cd [PROJECT_DIR]
   git pull origin main
   ```
3. **依存関係のインストール (重要)**:
   `better-sqlite3` はネイティブモジュールのため、サーバー環境でビルドが実行されます。
   ```bash
   npm install
   ```
4. **ビルド**:
   ```bash
   npm run build
   ```
5. **プロセスの再起動**:
   ```bash
   pm2 restart [APP_NAME]
   ```

#### 2. 注意点: データの永続性とバックアップ
- **データの実体**: プロジェクト直下の `database.sqlite` (仮名) ファイルに保存されます。
- **Google Sheetsとの違い**:
  - Sheets時代: VMを削除してもデータはクラウド(Google)に残っていました。
  - **SQLite時代: VMやディスクを削除するとデータも消えます。**
- **推奨設定**:
  - 定期的に `database.sqlite` を Google Drive や GCS (Google Cloud Storage) にバックアップするスクリプトを追加することを推奨します。
  - *今回の実装範囲には含めませんが、将来的なタスクとして記録します。*

## 移行ステップ
1. [x] 計画策定
2. [ ] ライブラリ追加 (`better-sqlite3`)
3. [ ] DBクライアント実装 (`src/db/`)
4. [ ] コマンド更新 (`description` 追加)
5. [ ] ハンドラ修正 (`tasks`, `images`, `reports`)
6. [ ] 動作確認
