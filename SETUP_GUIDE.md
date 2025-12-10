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

GCP VMへのコード転送やバージョン管理のため、GitHubを使用することを強く推奨します。

1.  GitHubで新しいリポジトリ（Private推奨）を作成します。
2.  ローカル環境（Bot開発機）で以下のコマンドを実行し、コードをプッシュします。
    ```bash
    # まだローカルでgit初期化していない場合
    git init
    # 除外設定 (.gitignore) があることを確認してください

    # リモートリポジトリを追加してプッシュ
    git remote add origin https://github.com/<User>/<Repo>.git
    git branch -M main
    git add .
    git commit -m "Initial commit"
    git push -u origin main
    ```

## 4. GCP Compute Engine へのデプロイ

### VM インスタンスの作成
1.  GCP Console で **"Compute Engine"** -> **"VM インスタンス"** を選択します。
2.  **"インスタンスを作成"** をクリックします。
    *   **名前**: `discord-bot-vm` など
    *   **リージョン**: `us-west1` や `us-central1` など（Always Free枠を狙う場合は `us-xxxx` の `e2-micro`）
    *   **マシンタイプ**: `e2-micro` (標準的なBotには十分です)
    *   **ブートディスク**: "変更" -> OSを **Ubuntu** (バージョン `22.04 LTS` または `24.04 LTS`)、サイズは30GBまで無料枠内。
    *   **ファイアウォール**: HTTP/HTTPSは今回は不要です（Discord BotはOutbound通信メインのため）。
3.  作成を実行し、完了を待ちます。

### サーバーセットアップ & GitHub連携
Privateリポジトリを安全にCloneするため、**SSH鍵** を使用する方法を推奨します。

1.  VMの行にある **"SSH"** ボタンをクリックしてコンソールを開きます。
2.  必要なツールをインストールします。
    ```bash
    sudo apt update
    sudo apt install -y git curl unzip build-essential

    # Node.js 22.x (LTS) のインストール
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs

    # バージョン確認
    node -v
    # => v22.x.x と表示されればOK

    # PM2 (プロセス管理) のインストール
    sudo npm install -g pm2
    ```

3.  **GitHub Deploy Key の設定**:
    サーバー上でSSH鍵を生成し、GitHubリポジトリに登録します。

    a. **鍵の生成**: (サーバー上で実行)
    ```bash
    ssh-keygen -t ed25519 -C "bot-deploy-key"
    # Enterなどでデフォルトのまま進める
    ```

    b. **公開鍵の表示**:
    ```bash
    cat ~/.ssh/id_ed25519.pub
    ```
    表示された文字列（`ssh-ed25519 AAAA...`）をコピーします。

    c. **GitHubへの登録**:
    *   GitHubリポジトリの **Settings** -> **Deploy keys** -> **Add deploy key** を開きます。
    *   **Title**: `GCP VM` など
    *   **Key**: コピーした公開鍵を貼り付けます。
    *   "Allow write access" は不要です。
    *   "Add key" で保存します。

4.  **接続確認**: (サーバー上で実行)
    ```bash
    ssh -T git@github.com
    # "Hi <User>/<Repo>! You've successfully authenticated..." と出ればOK
    ```

### コードのデプロイ (Clone & Build)
1.  GitリポジトリからSSH経由でクローンします。
    ```bash
    # ホームディレクトリへ
    cd ~

    # Clone (SSH URLを使用)
    git clone git@github.com:<User>/<Repo>.git

    # ディレクトリ移動
    cd <Repo>
    ```

2.  `.env` ファイルを作成します。
    ```bash
    nano .env
    # ローカルの .env の内容を貼り付け
    # (Ctrl+Shift+V などで貼り付け -> Ctrl+O で保存 -> Enter -> Ctrl+X で終了)
    ```

3.  依存関係をインストールし、ビルドします。
    ```bash
    npm install
    # リビルド (better-sqlite3等のため)
    npm run build
    ```

### アプリケーションの起動と常時稼働
1.  PM2で起動します。
    ```bash
    pm2 start dist/index.js --name "darugirl-bot"
    ```
2.  自動起動設定を行います（サーバー再起動時にBotも自動起動させるため）。
    ```bash
    pm2 startup
    # コマンドの出力結果に「sudo env PATH=...」のようなコマンドが表示されるので、それをコピーして実行してください。

    # 現在のPM2リストを保存
    pm2 save
    ```

### 保守・更新手順
コードを修正してGitHubにプッシュした後、サーバー側で更新を反映する手順です。

```bash
# サーバーにSSH接続後、ディレクトリへ移動
cd ~/<Repo>

# コードを取得
git pull origin main

# 必要であれば依存関係更新 & ビルド
npm install
npm run build

# アプリ再起動
pm2 restart darugirl-bot
```

### データのバックアップについて (SQLite)
*   タスクデータ等は `database.sqlite` に保存されます。
*   このファイルは `git pull` 等では上書きされませんが、VM削除時には消えます。
*   定期的にSFTP等で手元にバックアップするか、cronでDriveにアップロードするスクリプト等を検討してください。

以上で構築は完了です！
