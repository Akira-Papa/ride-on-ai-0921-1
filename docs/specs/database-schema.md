# データベーススキーマ (MongoDB)

## コレクション一覧
- `users`
- `categories`
- `posts`
- `post_reactions`

## users
| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `_id` | ObjectId | Yes | プライマリキー |
| `providerId` | string | Yes | Google の sub (一意) |
| `email` | string | Yes | 会員メールアドレス (一意) |
| `name` | string | Yes | 表示名 |
| `image` | string | No | Google プロフィール画像URL |
| `createdAt` | Date | Yes | 生成日時 |
| `updatedAt` | Date | Yes | 更新日時 |

### インデックス
- `email` にユニークインデックス
- `providerId` にユニークインデックス

## categories
| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `_id` | ObjectId | Yes | カテゴリID |
| `slug` | string | Yes | 英数字スラッグ (一意) |
| `name` | string | Yes | 表示名 |
| `description` | string | No | カテゴリ説明 |
| `createdAt` | Date | Yes | 作成日時 |
| `updatedAt` | Date | Yes | 更新日時 |

### インデックス
- `slug` にユニークインデックス

## posts
| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `_id` | ObjectId | Yes | 投稿ID |
| `authorId` | ObjectId | Yes | `users._id` を参照 |
| `categoryId` | ObjectId | Yes | `categories._id` を参照 |
| `title` | string | Yes | 投稿タイトル |
| `lesson` | string | Yes | 教訓本文 (Markdown サポート) |
| `situationalContext` | string | No | 背景状況 |
| `tags` | string[] | No | 検索用タグ |
| `visibility` | `"member" \| "private"` | Yes | デフォルト `member` |
| `createdAt` | Date | Yes | 作成日時 |
| `updatedAt` | Date | Yes | 更新日時 |

### インデックス
- `{ categoryId: 1, createdAt: -1 }` (頻出クエリ)
- `authorId`
- `tags` に対するテキストインデックス

## post_reactions
| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `_id` | ObjectId | Yes | 主キー |
| `postId` | ObjectId | Yes | 対象 `posts` |
| `userId` | ObjectId | Yes | リアクションしたユーザー |
| `type` | `"like" \| "bookmark"` | Yes | 種類 |
| `createdAt` | Date | Yes | 付与日時 |

### インデックス
- `{ postId: 1, userId: 1, type: 1 }` ユニーク

## モデル間リレーション
- `users` 1:N `posts`
- `categories` 1:N `posts`
- `posts` 1:N `post_reactions`

## バリデーション / ビジネスルール
- 投稿の `lesson` は 2000 文字以内。
- タグは最大 5 個。
- 投稿は自分のみ編集・削除。
- `categories` は管理者 (初期はシードスクリプト) が作成。

## マイグレーション指針
- mongoose の `schema.index` を利用。
- 初期データ: `categories` に 5 種類のプリセットカテゴリ (後述 UI 仕様参照)。
