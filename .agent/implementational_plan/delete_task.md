# 実装計画: 「やりたいことさくじょ」コマンド

## ゴール
登録済みのタスクを、チェックボックス（セレクトメニュー）形式で選択し、一括削除できるコマンド `/やりたいことさくじょ` を実装する。

## ユーザー確認事項
- **制限事項**: Discordのセレクトメニューの仕様上、一度に表示・選択できるのは **最大25件** までです。
    - リストが25件を超える場合、直近の25件（または上から25件）のみを表示する仕様とします。
- **削除ボタン**: 「選択して完了」した時点で削除を実行するフローとします（別途「削除」ボタンを押すステップは省略し、メニュー操作で完結させます）。
    - ※ もし「選択」→「確認ボタン」という2段階が必要であれば、修正します。

## 変更内容

### 1. Google Service (`src/google/`)
#### [MODIFY] `src/google/sheets.ts`
- `clearSheet(range)`: 指定列をクリアする関数を追加。
- `updateGoogleSheet(range, values)`: 指定範囲を上書きする関数を追加（クリア＆書き込み）。

#### [MODIFY] `src/google/service.ts`
- `deleteTasks(tasksToDelete: string[])`:
    1. 現在の全タスクを取得。
    2. `tasksToDelete` に含まれないタスクのみにフィルタリング。
    3. シートのA列をクリアし、残ったタスクで再書き込みを行う（行ズレ防止のため全書き換えを採用）。

### 2. Discord Logic (`src/discord/`)
#### [MODIFY] `src/discord/constants.ts`
- `DELETE_TASK: 'やりたいことさくじょ'` を追加。

#### [MODIFY] `src/discord/commands.ts`
- Slash Command に `DELETE_TASK` を追加。

#### [MODIFY] `src/discord/handlers.ts`
- **`handleDeleteTask` (コマンド)**:
    - タスク一覧を取得。
    - `StringSelectMenuBuilder` を作成し、タスクを `Options` として追加（Max 25）。
    - `ActionRowBuilder` に詰めて `reply` する。
- **`handleDeleteSelect` (インタラクション)**:
    - セレクトメニューの操作イベント (`interaction.isStringSelectMenu()`) を検知。
    - 選択された値 (`interaction.values`) を受け取り、`deleteTasks` を実行。
    - 完了メッセージを返す。

#### [MODIFY] `src/index.ts`
- `interactionCreate` イベント内で、Slash Commandだけでなく **Select Menu Interaction** もハンドリングできるように分岐を追加する。

## 検証計画
1.  `/やりたいことついか` でテストデータを数件（A, B, C）登録する。
2.  `/やりたいことさくじょ` を実行し、メニューが表示されるか確認。
3.  「A」と「C」を選択して実行。
4.  `/やりたいことりすと` で「B」のみ残っていることを確認。
