# トラブルシューティングガイド

## 1. 認証が失敗する
- 症状: `/login?error=OAuthCallback`
- 確認:
  1. Google OAuth のリダイレクト URI が `https://<domain>/api/auth/callback/google` になっているか
  2. `NEXTAUTH_URL` が実際のホスト名と一致しているか
  3. Vercel の Secret が期限切れになっていないか
- 対応: 環境変数修正 → `vercel env pull` → 再デプロイ

## 2. MongoDB 接続エラー (`MONGODB_URI is not defined`)
- `docs/specs/database-schema.md` の URI フォーマット通りに設定
- ローカルでは `.env.local` に、CI/Vercel ではプロジェクト設定に登録
- Atlas の Network access で IP allowlist を確認

## 3. 投稿が表示されない
- `pnpm lint` や `pnpm test` でスキーマ変更による型不整合を洗い出す
- MongoDB コンソールで `posts` / `categories` のデータ存在を確認
- フィルター（`?tag=` / `?q=`）が極端な検索条件になっていないかチェック

## 4. Playwright テストが失敗する
- `Error: listen EPERM` → 実行環境がポートバインドを制限。CI では権限のあるホストを利用
- `browserType.launch: Executable doesn't exist` → `pnpm exec playwright install --with-deps`
- `webServer exited early` → `pnpm dev` が例外になっていないかログを参照

## 5. NextAuth セッションが切れる
- `NEXTAUTH_SECRET` が更新された場合、旧セッションは無効化される。ログアウト後に再ログイン
- ブラウザ側の Cookie ブロック設定を確認

## 6. MUI テーマが適用されない
- `AppProviders` 内で `ThemeProvider` が呼ばれているか、Custom `_app` を追加していないかを確認
- 開発モードで `console.warn('[emotion]')` 等が出る場合は `@emotion/cache` の重複を疑う
