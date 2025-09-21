# anotoki システムアーキテクチャ

## 概要
- **フロントエンド**: Next.js 15 App Router + MUI。すべてのページは会員制のため認証必須。
- **認証**: NextAuth.js を使用し、Google OAuth プロバイダのみを有効化。セッションはJWT戦略。
- **バックエンド**: Next.js API Route Handlers と Server Actions。
- **データベース**: MongoDB Atlas または互換クラスタ。mongoose を利用してスキーマ駆動でデータアクセス。
- **ホスティング**: Vercel 想定。環境変数は Vercel Project Settings または `.env.local` に設定。

## コンポーネント構成
| レイヤ | 主な責務 | 実装要素 |
|---|---|---|
| プレゼンテーション | UIレンダリング、ユーザー操作 | App Router ページ (`/app/(auth)`, `/app/(dashboard)` など)、MUI テーマ、クライアントコンポーネント |
| アプリケーション | 認証ガード、サーバーアクション、フォーム処理 | Server Actions (`src/app/(dashboard)/actions.ts`)、`requireAuth` ヘルパー |
| ドメイン | 投稿/カテゴリ/ユーザーのビジネスルール | Zod スキーマ、サービス層 (`src/lib/services/*`) |
| データアクセス | MongoDB 接続、クエリ | `src/lib/db/mongoose.ts`、モデル (`src/lib/models/*`) |
| インフラ | 外部API、認証プロバイダ | Google OAuth、NextAuth コールバック |

## データフロー
1. ユーザーが `/login` から Google OAuth を開始。
2. 認証成功後、NextAuth が JWT セッションを生成しクライアントへ返却。
3. 認証済みユーザーがダッシュボードへアクセスすると Server Components が `getServerSession` を使用してセッションを検証。
4. 投稿CRUDは `POST/PUT/DELETE` API route を経由し、`services/postService` が検証→ Mongoose モデルを通じてDBと通信。
5. レスポンスは JSON として返却され、クライアント側では React Query 互換の軽量 `useMutation` ラッパーを用いてステートを同期。

## 認可・セキュリティ
- NextAuth の `callbacks.authorized` と Middleware (`src/middleware.ts`) で非認証リクエストを `/login` へリダイレクト。
- 投稿編集・削除はサーバーサイドで `session.user.id` と投稿 `authorId` を比較。
- Zod による入力検証と MongoDB-level の unique index による整合性確保。
- HTTPS 前提、Cookies Secure、JWT 暗号化キーは `NEXTAUTH_SECRET`。

## サービス間連携
```
ブラウザ → Next.js App Router (MUI) → NextAuth ルーティング → MongoDB
                         ↘ API Route Handlers ↗
```

## キャッシュ戦略
- 認証済みページは SSR (Dynamic Rendering) を利用。
- 投稿一覧は SWR 的再検証 (`fetch` の `next: { revalidate: 60 }`)。
- MongoDB へのリードは API で集約。

## ロギング & モニタリング
- Next.js Route Handler で `console` ロギング。
- 将来的に Vercel Observability や Logtail を想定。

## フォルダ構成方針
```
src/
  app/
    (auth)/login/page.tsx
    (dashboard)/@...
    api/
      posts/route.ts
      categories/route.ts
  components/
    layout/
    posts/
  lib/
    auth/
    db/
    models/
    services/
    validation/
```

## 非機能要件
- 応答時間: API < 300ms (標準データセット)
- 稼働率: 99.9% (Vercel SLA 依存)
- セキュリティ: OAuth 2.0 + セッションハイジャック対策、CSRF 保護
- アクセシビリティ: WCAG 2.1 AA、MUI コンポーネントの aria 属性対応
