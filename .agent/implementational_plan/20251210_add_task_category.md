# 実装計画: タスクへのカテゴリ追加

## 目標
タスクに `category` (分類) を追加し、「やること」以外の項目（例: 「見たい映画」「買いたいもの」）も管理できるようにします。

## 変更内容

### 1. データベーススキーマ更新 (`src/db/client.ts`)
`tasks` テーブルに `category` カラムを追加します。

```sql
ALTER TABLE tasks ADD COLUMN category TEXT DEFAULT 'やること';
```
※ `initDb` 関数内の `CREATE TABLE` 文も更新しますが、既存DBへの反映には `ALTER TABLE` が必要、もしくはDBファイルの再作成が必要です。
**今回は開発段階のため、DBファイルの再作成 (削除 -> 再起動) を前提とします。**

### 2. 型定義の更新 (`src/db/tasks.ts`)
`Task` 型に `category` を追加します。

```typescript
export type Task = {
  // ...既存のフィールド
  category: string; // カテゴリ (例: 'やること', '映画', '買い物')
}
```

### 3. コマンドの更新 (`src/discord/commands.ts`)
`/やること_ついか` コマンドに `カテゴリ` (文字列, Optional) オプションを追加します。
指定がない場合のデフォルトは `'やること'` とします。

### 4. ハンドラの更新 (`src/discord/handlers/taskHandler.ts`)
- `handleAddTask`: オプションからカテゴリを取得し、DBに保存します。
- `handleListTasks`: 表示時にカテゴリも表示するか、あるいはカテゴリごとにフィルタリングする等の対応を入れるか？
  - 今回はまず **「リスト表示時にカテゴリも併記する」** 形で実装します。
  - `[カテゴリ] タイトル [ステータス]` のような形式を想定。

## 検証計画
1. `database.sqlite` を削除。
2. `npm run dev` で起動。
3. `/やること_ついか 内容:テスト カテゴリ:映画` を実行。
4. `/やること_りすと` でカテゴリが表示されることを確認。
