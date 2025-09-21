# API スペック

すべてのエンドポイントは認証済みセッションが必須です。未認証アクセスは 401 を返します。

## 共通仕様
- ベースURL: `/api`
- ヘッダ: `Content-Type: application/json`
- 認証: HTTP Only Cookie + NextAuth JWT (自動処理)
- エラーフォーマット:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Lesson is required",
    "details": { "field": "lesson" }
  }
}
```

## GET /api/session
- 説明: サーバーセッションの概要を取得
- レスポンス 200:
```json
{
  "user": {
    "id": "64f...",
    "name": "Akira Funakoshi",
    "email": "akira@example.com",
    "image": "https://lh3.googleusercontent.com/..."
  }
}
```

## GET /api/categories
- 説明: カテゴリ一覧を返却 (name 昇順)
- レスポンス 200:
```json
{
  "categories": [
    {"id": "65a...", "slug": "career", "name": "キャリア", "description": "仕事に関する学び"}
  ]
}
```

## POST /api/posts
- 説明: 新規投稿を作成
- リクエスト:
```json
{
  "title": "キャリアチェンジのタイミングを逃した話",
  "lesson": "早めに準備することが大事",
  "situationalContext": "コロナ禍での転職活動",
  "categoryId": "65a...",
  "tags": ["転職", "キャリア"],
  "visibility": "member"
}
```
- レスポンス 201:
```json
{
  "post": {
    "id": "65b...",
    "authorId": "64f...",
    "title": "...",
    "createdAt": "2024-09-21T00:00:00.000Z"
  }
}
```
- エラー: 400 (validation), 409 (duplicate), 401 (auth), 500 (server)

## GET /api/posts
- クエリ: `category`, `cursor`, `limit`, `search`, `tag`
- レスポンス 200:
```json
{
  "posts": [{
    "id": "65b...",
    "title": "...",
    "lesson": "...",
    "category": {"id": "65a...", "name": "キャリア"},
    "author": {"id": "64f...", "name": "Akira"},
    "createdAt": "2024-09-21T00:00:00.000Z"
  }],
  "nextCursor": "65b..."
}
```

## GET /api/posts/[id]
- レスポンス 200:
```json
{
  "post": {
    "id": "65b...",
    "title": "...",
    "lesson": "...",
    "situationalContext": "...",
    "tags": ["..."],
    "category": {...},
    "author": {...},
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```
- エラー: 404 (存在しない)

## PUT /api/posts/[id]
- 説明: 投稿を更新 (author のみ)
- リクエストボディは POST と同様 (部分更新不可)
- レスポンス 200:
```json
{
  "post": {
    "id": "65b...",
    "updatedAt": "2024-09-21T12:00:00.000Z"
  }
}
```
- エラー: 403 (アクセス権なし)

## DELETE /api/posts/[id]
- 説明: 投稿を削除 (author のみ)
- レスポンス 204: ボディなし

## POST /api/posts/[id]/reactions
- 説明: リアクション追加
- クエリ: `type=like|bookmark`
- レスポンス 201:
```json
{"reaction": {"postId": "...", "type": "like"}}
```

## DELETE /api/posts/[id]/reactions
- クエリ: `type`
- レスポンス 204

## エラーハンドリング
| コード | 状況 | メッセージ例 |
|---|---|---|
| 400 | バリデーション失敗 | `Title must be between 3 and 120 characters` |
| 401 | 未認証 | `Authentication required` |
| 403 | 認可失敗 | `You do not own this post` |
| 404 | 未検出 | `Post not found` |
| 409 | 競合/重複 | `Category slug already exists` |
| 500 | サーバーエラー | `Unexpected server error` |
