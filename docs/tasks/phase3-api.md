# フェーズ3: API エンドポイント実装

## ゴール
投稿・カテゴリ・セッション情報の API を実装し、Zod 検証と認可ガードを備えた堅牢な構造を完成させる。

## タスク一覧
1. 入力検証用 Zod スキーマを `src/lib/validation/posts.ts` に定義 (create/update 共通)。
2. サービス層 `src/lib/services/postService.ts` を実装し、投稿 CRUD ロジックをカプセル化。
3. `src/lib/services/categoryService.ts` を実装し、カテゴリリストを取得 (キャッシュ可能)。
4. `/app/api/session/route.ts` を実装してセッション情報を返却。
5. `/app/api/categories/route.ts` の GET を実装。
6. `/app/api/posts/route.ts` に GET (フィード) と POST (作成) を実装。
7. `/app/api/posts/[id]/route.ts` に GET/PUT/DELETE を実装。
8. `/app/api/posts/[id]/reactions/route.ts` に POST/DELETE を実装。
9. エラーハンドリングユーティリティ (`handleError`) を実装し、共通レスポンス形式を適用。
10. API レイヤから返却する DTO を定義し、余分な内部フィールドを除去。
11. 非同期関数のタイムアウト/例外 (try-catch) を含めて 500 エラーを防衛的に処理。

## Definition of Done
- すべての API が認証済みセッションなしでは 401 を返す。
- 投稿作成時にバリデーションが適用され、不正な入力で 400 を返す。
- 投稿編集・削除は投稿者のみ成功し、他ユーザーは 403 を受け取る。
- 一覧 API は `nextCursor` を返し、ページネーションが可能。
- API レスポンスがドキュメント `docs/specs/api-specification.md` と整合している。
