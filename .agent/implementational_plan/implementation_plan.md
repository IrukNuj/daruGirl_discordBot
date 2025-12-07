# 実装計画: Discord Bot Google連携機能

## 目標
Google Sheetsでタスク管理を行い、Google DriveにイラストをアップロードするDiscord Botを作成します。
デプロイ先は GCP Compute Engine (Ubuntu 22.04, Node.js v20) です。

## ユーザー確認事項
> [!IMPORTANT]
> **Google Cloud設定が必要です**: Service Accountの作成、Sheets/Drive APIの有効化、そしてJSONキーの取得が必要です。
> 取得したJSONキーは `GOOGLE_CREDENTIALS` 環境変数に文字列として設定します。

## 変更内容

### 設定関連
#### [NEW] [package.json](file:///package.json)
- 依存関係: `discord.js`, `googleapis`, `dotenv`, `axios`.
- 開発依存関係: `typescript`, `ts-node`, `@types/node`, `@types/ws`, `eslint`, `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`.
- スクリプト: `start`, `dev`, `build`, `lint`, `format`.

#### [NEW] [tsconfig.json](file:///tsconfig.json)
- TypeScriptコンパイラ設定 (ESNext, ModuleResolution: NodeNext).

#### [NEW] [.eslintrc.json, .prettierrc](file:///.eslintrc.json)
- コード品質とフォーマット設定（モダンな構成）。

#### [NEW] [.env](file:///.env)
- 環境変数のテンプレート（`GOOGLE_CREDENTIALS` 含む）。

### 実装ファイル
#### [NEW] [index.ts](file:///index.ts)
- メインエントリーポイント。
- Discord Clientの初期化とGoogle認証設定。
- スラッシュコマンドの登録:
    - `やりたいことついか`: タスクをスプレッドシートに追加。
    - `やりたいことりすと`: タスク一覧を表示。
    - `やりたいこととりだし`: タスクをランダムに1つ提案。
    - `いらすとついか`: 画像をDriveにアップロードし、リンクをシートに記録。

#### [NEW] [googleClient.ts](file:///googleClient.ts)
- Google認証（Service Account）のハンドリング。
- Sheets API操作（追加、読み込み）。
- Drive API操作（ファイルアップロード）。

## 検証計画

### 自動テスト
- 現段階では計画していません（Discord Botのため手動検証中心）。

### 手動検証
1. **ローカル実行**: `npm run dev` (ts-node) で起動確認。
2. **コマンド動作確認**:
   - タスク追加コマンドを実行し、Google Sheetに反映されるか確認。
   - リスト表示コマンドで内容が返ってくるか確認。
   - 画像追加コマンドを実行し、Google Driveに保存され、閲覧リンクがSheetに書き込まれるか確認。
