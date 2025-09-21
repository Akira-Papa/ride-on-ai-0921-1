# デプロイメントガイド

## 1. 事前準備
- Node.js 20.x / pnpm 8 以上
- MongoDB Atlas クラスタ（IP allowlist に Vercel / CI のアウトバウンド IP を登録）
- Google Cloud Console で OAuth クライアント ID 発行（Web アプリ）

## 2. 環境変数
`.env.production`（ローカル）または Vercel Project Settings に以下を設定:
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
MONGODB_URI=...
NEXTAUTH_URL=https://<your-domain>
```

## 3. Vercel デプロイ
```bash
pnpm install
pnpm build
npx vercel login
npx vercel link
npx vercel --prod
```
- `vercel` CLI が自動的に GitHub/GitLab 連携を作成
- デプロイ後、`vercel env pull .env.production.local` で最新環境変数を同期

## 4. Github Actions (任意)
- `pnpm lint` と `pnpm test` を CI で実行
- E2E テストは `pnpm test:e2e` (CI 実行時は Playwright ブラウザのキャッシュを活用)
- 成功時に `vercel deploy --prod --prebuilt` を起動し、ビルド済みアーティファクトを使う

## 5. ロールバック
- Vercel Dashboard > Deployments から任意のビルドを Promote
- MongoDB については `mongodump` による日次バックアップを推奨

## 6. 監視
- Vercel Analytics を有効化し、`Performance → Web Vitals` を監視
- 検索クエリ数や書き込み操作は MongoDB Atlas Metrics で確認する
