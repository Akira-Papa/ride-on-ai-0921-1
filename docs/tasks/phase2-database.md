# フェーズ2: データベース設定 & モデル作成

## ゴール
MongoDB との安定した接続と、投稿・カテゴリ・ユーザーモデルの定義を行う。

## タスク一覧
1. mongoose を導入し、`src/lib/db/mongoose.ts` に接続ヘルパー (`connectMongo`) を実装。
2. `.env.example` に `MONGODB_URI` を追加し、接続手順を README に追記。
3. `src/lib/models/User.ts` にユーザースキーマを実装 (unique index, timestamps)。
4. `src/lib/models/Category.ts` にカテゴリスキーマを実装。
5. `src/lib/models/Post.ts` に投稿スキーマを実装 (tags, visibility enum, indexes)。
6. `src/lib/models/PostReaction.ts` にリアクションスキーマを実装。
7. モデルに対する TypeScript 型 (`InferSchemaType`) をエクスポートし、サービス層で利用可能にする。
8. 接続エラーハンドリングと再接続戦略 (キャッシュされたコネクションの再利用) を組み込む。
9. 初期カテゴリデータを投入するシード関数 (`seedCategories`) を作成し、起動時 or API で実行可能にする。

## Definition of Done
- `connectMongo()` を 2 回以上連続で呼んでも単一接続が再利用される。
- 各スキーマに指定されたインデックスが定義されている。
- タイプは `src/lib/types/` またはモデルファイルから再利用できる。
- テスト用 Mongo メモリサーバー利用時にも問題なく動作。
