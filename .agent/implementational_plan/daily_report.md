# 12時定期レポート実装計画 (改訂版)

## ゴール
毎日12:00 (JST) に、「やりたいことリスト」を自動投稿する。
**サーバーごとに投稿のON/OFFを設定可能**とし、設定はGoogleスプレッドシートで管理する。

## データ管理 (Google Spreadsheet)
データベースの代わりにスプレッドシートを使用する。

- **シート名**: `Config` (存在しない場合は自動作成)
- **カラム構成**:
    - A列: `Guild ID` (サーバーID)
    - B列: `Is Enabled` (有効: `TRUE`, 無効: `FALSE`)
- **アクセス頻度**:
    - 設定変更時: その都度書き込み
    - 定期実行時: 実行開始時に一度だけ全設定を読み込み (Read-Once)

## 変更内容

### 1. 依存関係 (Dependencies)
- `node-cron`: スケジュール管理
- `@types/node-cron`: 型定義

### 2. ソースコード実装

#### [NEW] `src/google/config.ts`
設定データの読み書きを担当するモジュール。
- `fetchGuildSettings()`: 全サーバーの設定を `Map<string, boolean>` 形式で一括取得。
- `setGuildSetting(guildId: string, isEnabled: boolean)`: 指定サーバーの設定を更新（Upsert: 行があれば更新、なければ追加）。

#### [NEW] `src/discord/cron.ts`
スケジュール実行の本体。
- `setupScheduledTasks(client: Client)`:
    - `cron.schedule('0 12 * * *', ..., { timezone: "Asia/Tokyo" })` を設定。
    - **JST 12:00** に発火。
    - 処理フロー:
        1. `config.ts` から設定一覧を取得。
        2. `client.guilds.cache` で参加サーバーをループ。
        3. 設定が `TRUE` のサーバーのみ、`systemChannel` へ Embed を送信。

#### [MODIFY] `src/discord/handlers.ts` & `src/discord/commands.ts`
- **Embed共通化**: 定期実行でもコマンド実行でも同じ見た目になるよう、`createTaskListEmbed` 関数をエクスポート。
- **新コマンド**: `/レポート設定 (有効|無効)`
    - ハンドラー内で `setGuildSetting` を呼び出し、結果を応答。

## 検証計画
1.  **コマンド動作確認**:
    - `/レポート設定 有効` -> スプレッドシートの `Config` シートに `GuildID, TRUE` が追記されるか。
    - `/レポート設定 無効` -> `FALSE` に更新されるか。
2.  **スケジュール動作確認**:
    - スケジュールを一時的に数分後に設定し、`Asia/Tokyo` タイムゾーンで正しく動作するか確認。
    - 設定が `FALSE` のサーバーには投稿されず、`TRUE` のサーバーにのみ投稿されるか確認。
3.  **クリーンアップ**:
    - テスト設定を元に戻す。
