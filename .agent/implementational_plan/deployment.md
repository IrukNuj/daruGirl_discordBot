# 実装計画: デプロイ & 環境構築

Botコードの実装とリファクタリングが完了したため、次のフェーズとして外部サービスの設定、検証、およびGCP本番環境へのデプロイを行います。

## User Review Required
- **外部アカウント**: Discord, Google Cloud Platform, GitHubアカウントが必要です。
- **GCP課金**: 課金アカウントの紐付けが必要です（無料枠内での運用を想定していますが、設定が必要です）。

## Proposed Steps

### 1. コード管理 & リポジトリ準備
- [ ] GitHubにリポジトリを作成
- [ ] コードをPush
- [ ] `.gitignore` と `.env.example` の確認

### 2. ローカル環境変数の設定 (User Operation)
`SETUP_GUIDE.md` に従い、以下の設定を行います。
- [ ] Discord Developer Portal: Token, ClientID, GuildID取得
- [ ] Google Cloud: Service Account Key(JSON)取得
- [ ] Google Workspace: SpreadsheetID, FolderID取得
- [ ] `.env` へ値の入力

### 3. ローカル検証
- [ ] `npm run dev` で起動
- [ ] Discord上でスラッシュコマンド (`/やりたいことついか` 等) の動作確認
- [ ] スプレッドシートへの追記確認
- [ ] Google Driveへの画像保存確認

### 4. GCP VMデプロイ
`SETUP_GUIDE.md` に従い、GCP Compute Engine上で稼働させます。
- [ ] VMインスタンス作成 (`e2-micro` 推奨)
- [ ] SSH接続 & Node.js/Git/PM2 インストール
- [ ] Git Clone
- [ ] `.env` 作成（秘密情報の貼り付け）
- [ ] `npm install` & `npm run build`
- [ ] `pm2 start` & `pm2 startup`

## Verification Plan
### Automated Tests
- 現状自動テストはありません。手動確認を主とします。

### Manual Verification
- **コマンド応答**: 全コマンドが正常に応答するか。
- **データ永続化**: スプレッドシートとDriveにデータが正しく保存されるか。
- **永続化プロセス**: VM再起動後もBotが自動起動するか (`pm2 save` の確認)。
