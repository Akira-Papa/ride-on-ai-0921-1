# 認証フロー仕様 (Google OAuth + NextAuth)

## エンドツーエンドフロー
1. 未認証ユーザーが保護ページへアクセス。
2. Middleware (`middleware.ts`) がリクエストを検知し `/login` へリダイレクト。
3. ユーザーが `/login` ページの「Google でログイン」ボタンをクリック。
4. NextAuth の `signIn("google")` が Google OAuth Authorization Code Flow を開始。
5. Google がユーザー同意を取得し、成功すると NextAuth コールバックURL (`/api/auth/callback/google`) にリダイレクト。
6. NextAuth が `profile` から `sub`, `email`, `name`, `picture` を取得。
7. `signIn` コールバックで MongoDB にユーザーを `upsert`。
8. JWT コールバックで `token.sub = user.id` を設定し、Session コールバックで `session.user.id` を公開。
9. 完了後、NextAuth が `callbackUrl` (既定は `/dashboard`) にリダイレクト。
10. クライアント側で `useSession` がセッションを取得し、アプリ状態を更新。

## NextAuth 設定
- `providers`: Google (scope: `openid email profile`).
- `session`: `strategy: "jwt"`。
- `pages`: `signIn: "/login"`
- `callbacks`:
  - `jwt`: MongoDB ID を `token.uid` に保存。
  - `session`: `session.user.id = token.uid`。
  - `authorized`: `/login` を除き常に認証必須。
- `events`: `signOut` で `revalidatePath` を呼び出し、キャッシュをクリア。

## エラーハンドリング
- OAuth エラー (`error=OAuthCallback`) 時は `/login?error=oauth` へリダイレクトし Snackbar 表示。
- セッション失効時は `401` を受け取り次第 `signIn()` を再送。

## セキュリティ
- `NEXTAUTH_SECRET` は 32 文字以上。
- `NEXTAUTH_URL` を環境に設定。
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` を `.env.local` に配置 (Git ignore 済み)。
- JWT 有効期限: デフォルト 30 日。`session.jwt.expires` で確認。

## ログアウト
- Header のユーザーメニューから `signOut({ callbackUrl: "/login" })` を実行。
- サーバーでは Cookie を削除し `/login` に遷移。

## セッション管理
- Server Components: `auth()` (NextAuth v5) または `getServerSession()` を利用。
- API Route Handlers: `getServerSession(authOptions)` で検証。
- クライアント: `SessionProvider` を `_app` 相当 (App Router の `SessionProvider` ラッパー) で定義。

## 状態遷移
```
未認証 --(signIn)-> 認証進行中 --(成功)-> 認証済み
                         └--(失敗)-> 認証失敗 (再試行)
```
