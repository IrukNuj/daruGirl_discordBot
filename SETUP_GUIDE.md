# 環境構築 & デプロイ詳細手順書

このドキュメントでは、Botを動作させるために必要な外部サービスの設定と、GCPへのデプロイ手順を解説します。

## 1. Discord Bot の設定 (Developer Portal)

1.  [Discord Developer Portal](https://discord.com/developers/applications) にアクセスし、ログインします。
2.  **"New Application"** をクリックし、名前（例: `DaruGirl-Bot`）を入力して作成します。
3.  左側メニューの **"Bot"** を選択します。
4.  **"Reset Token"** をクリックしてトークンを生成し、コピーします。
    *   👉 `.env` の `DISCORD_TOKEN` に設定します。
5.  **"Privileged Gateway Intents"** の **"MESSAGE COMPONENT INTENT"** (もしあれば) を有効にする必要はありませんが、将来的にメッセージ内容を読む場合は "MESSAGE CONTENT INTENT" が必要になることがあります。今回はスラッシュコマンドなので不要です。
6.  左側メニューの **"OAuth2"** -> **"General"** を選択します。
    *   **"Redirects"** に `http://localhost:3000` (または任意のURL) を追加し、"Save Changes" を保存します。
    *   その下の **"URL Generator"** を選択します。
7.  **SCOPES** で `bot` と `applications.commands` にチェックを入れます。
8.  **BOT PERMISSIONS** で必要な権限（例: `Send Messages`, `Embed Links`, `Attach Files`）にチェックを入れます。
    *   最低限: `Send Messages`, `Read Message History` (デバッグ用)
9.  生成されたURLをコピーし、ブラウザで開いてBotを自分のサーバーに招待します。
10. 左側メニューの **"General Information"** で **APPLICATION ID** をコピーします。
    *   👉 `.env` の `DISCORD_CLIENT_ID` に設定します。
11. Discordアプリ上で、Botを導入したサーバーのIDをコピーします（開発者モードをONにしてサーバーアイコンを右クリック -> "サーバーIDをコピー"）。
    *   👉 `.env` の `DISCORD_GUILD_ID` に設定します。

## 2. Google Workspace (Sheets & Drive) の準備

### Google Cloud Project の作成
1.  [Google Cloud Console](https://console.cloud.google.com/) にアクセスします。
2.  新しいプロジェクトを作成します（例: `darugirl-bot`）。
3.  **"APIとサービス"** -> **"ライブラリ"** に移動し、以下のAPIを検索して**有効化**します。
    *   **Google Sheets API**
    *   **Google Drive API**

### Service Account の作成
1.  **"APIとサービス"** -> **"認証情報"** -> **"認証情報を作成"** -> **"サービスアカウント"** を選択します。
2.  名前を入力して作成します（権限は「オーナー」等は不要です）。
3.  作成されたサービスアカウントをクリックし、**"キー"** タブへ移動します。
4.  **"鍵を追加"** -> **"新しい鍵を作成"** -> **"JSON"** を選択してダウンロードします。
5.  ダウンロードしたJSONファイルの内容を**すべてコピー**し、1行の文字列にします（改行を削除）。
    *   👉 `.env` の `GOOGLE_CREDENTIALS` に設定します。
    *   形式: `GOOGLE_CREDENTIALS={"type":"service_account",...}`
6.  **"詳細"** タブに戻り、**メールアドレス**（`xxx@yyy.iam.gserviceaccount.com`）をコピーしておきます。

### スプレッドシートとドライブフォルダの準備
1.  Googleスプレッドシートを新規作成します。
    *   URLの `d/` と `/edit` の間の文字列が **Spreadsheet ID** です。
    *   👉 `.env` の `SPREADSHEET_ID` に設定します。
2.  Googleドライブで画像を保存したいフォルダを作成します。
    *   フォルダを開いた時のURL末尾の文字列が **Folder ID** です。
    *   👉 `.env` の `DRIVE_FOLDER_ID` に設定します。
3.  **【重要】共有設定**:
    *   スプレッドシート右上の「共有」ボタンを押し、先ほどコピーした **Service Accountのメールアドレス** を入力して「編集者」として招待します。
    *   ドライブフォルダも同様に、右クリック -> 「共有」から **Service Accountのメールアドレス** を「編集者」として招待します。
4.  **【新機能用】設定シートの作成**:
    *   スプレッドシートの下部「+」ボタンで新しいシートを追加し、名前を **`Config`** に変更してください。
    *   これがないと定期レポート設定（`/レポート設定`）が保存できずにエラーになります。

## 3. GitHub リポジトリの設定 (推奨)

GCP VMへのコード転送を容易にするため、GitHubを使用することを推奨します。

1.  GitHubで新しいリポジトリ（Private推奨）を作成します。
2.  ローカルで以下のコマンドを実行し、コードをプッシュします。
    ```bash
    git remote add origin https://github.com/<User>/<Repo>.git
    git push -u origin main
    ```

## 4. GCP Compute Engine へのデプロイ

### VM インスタンスの作成
1.  GCP Console で **"Compute Engine"** -> **"VM インスタンス"** を選択します。
2.  **"インスタンスを作成"** をクリックします。
    *   **名前**: `discord-bot-vm` など
    *   **リージョン**: `us-west1` や `us-central1` など（Always Free枠を狙う場合は `us-xxxx` の `e2-micro`）
    *   **マシンタイプ**: `e2-micro`
    *   **ブートディスク**: "変更" -> OSを **Ubuntu** (バージョン `22.04 LTS` 推奨)、サイズは30GBまで無料枠内。
    *   **ファイアウォール**: HTTP/HTTPSは今回は不要です（Discord BotはOutbound通信メインのため）。
3.  作成を実行し、完了を待ちます。

### サーバーセットアップ
1.  VMの行にある **"SSH"** ボタンをクリックしてコンソールを開きます。
2.  必要なツールをインストールします。
    ```bash
    sudo apt update
    sudo apt install -y git curl unzip
    # Node.js 20.x のインストール
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    # PM2 (プロセス管理) のインストール
    sudo npm install -g pm2
    ```

### コードのデプロイ
1.  Gitリポジトリからクローンします。
    *   Privateリポジトリの場合、HTTPSでアクセストークンを使うか、SSH鍵を生成してGitHubに登録する必要があります。
    *   簡単のため、まずはHTTPSでのCloneを試してください（パスワードにはGitHubのPersonal Access Tokenが必要）。
    ```bash
    git clone https://github.com/<User>/<Repo>.git
    cd <Repo>
    ```
2.  `.env` ファイルを作成します。
    ```bash
    nano .env
    # ローカルの .env の内容を貼り付け、保存 (Ctrl+O, Enter, Ctrl+X)
    ```
3.  依存関係をインストールし、ビルドします。
    ```bash
    npm install
    # better-sqlite3 などのネイティブモジュールが含まれるため、必ずサーバー上で npm install を実行してください
    npm run build
    ```

### データの永続化について (SQLite)
*   データは `database.sqlite` ファイルに保存されます。
*   **注意**: VMインスタンスを削除すると、このファイルも削除されデータが失われます。
*   必要に応じて、`database.sqlite` を定期的にGoogle Drive等へバックアップする運用を検討してください。

### アプリケーションの起動と常時稼働
1.  PM2で起動します。
    ```bash
    pm2 start dist/index.js --name "darugirl-bot"
    ```
2.  自動起動設定を行います。
    ```bash
    pm2 startup
    # 表示されたコマンドをコピーして実行
    pm2 save
    ```
3.  ログを確認して動作しているか見ます。
    ```bash
    pm2 logs
    ```

以上で構築は完了です！
