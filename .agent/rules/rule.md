---
trigger: always_on
---

- 使用する言語は基本的に日本語とすること
- `.md`内の記述について、基本的に日本語とすること
- implementational plan, Taskの内容は、それぞれのディレクトリ内に`.agent/implementational_plan/{timestamp}_{implementational_plan_name}.md`と`.agent/task/{timestamp}_{task_name}.md`ファイルを作成すること
  - この操作は、各実行計画に基づく操作を行う度に行うこと。
  - 実行計画の内容の改善時には新規ファイルの作成を行う必要はなく、既存該当ファイルが有ればその内容の修正のみ行うこと
- このファイル内のruleについて、`.agent/rules/rule.md`ファイルを作成し、転記すること
- gitのcommitについて、日本語で記述を行うこと

```
.agent/task/task.md:
現状のタスクリスト、進捗状況 ([ ], [x]) を管理。
.agent/implementational_plan/:
複雑な機能実装の前に、必ず設計・計画書 (.md) を作成し、ユーザーの合意をとる。
.agent/rules/rule.md:
プロジェクト固有のルール変更があった場合はここに転記し、常に最新のルールを参照する。
```

## typeScript

- 関数型言語志向:
  - class による状態保持を避け、関数とデータフロー(Input -> Output)で構成する。
  - let 禁止: 変数はすべて const。再代入が必要な場合は設計を見直すか、Reducerパターン等を使用する。
- 型安全性:
  - any 禁止。必ず型定義ファイル (types.ts) を作成する。
- ファイル命名:
  - キャメルケース (userService.ts, authHandler.ts) を使用する。
  - "何をするか" が明確な名前を付ける。
- JSDoc (日本語):
  - 日本語でJSDocを記述する。
  - 「〜をする関数」等の冗長な表現は避け、目的、引数、返り値、副作用 を簡潔に書く。
- 絶対パス Import:
  - tsconfig.jsonに "baseUrl": "./src" を設定し、@をaliasとして使用する。
  - 相対パス (../../) は極力避け、Rootからのパス (feature/service.js) をimportする。
- ファイル名はキャメルケースとすること
- コミットメッセージ
  - 日本語で記述する。
  - プレフィックス（feat:, fix:, refactor: 等）を付けることを推奨。
