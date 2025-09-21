# フェーズ1: 認証機能実装タスク

## ゴール
Google 認証による完全会員制アクセスを実現し、未認証ユーザーはコンテンツへ到達できない状態を確立する。

## タスク一覧
1. NextAuth 依存パッケージの追加 (`next-auth`, `@types/next-auth` 等)。
2. `src/lib/auth/options.ts` に NextAuth 設定を実装 (Google Provider, JWT Strategy, callbacks)。
3. `src/app/api/auth/[...nextauth]/route.ts` を実装し NextAuth ハンドラを公開。
4. `src/middleware.ts` を作成し、保護ルートに対するリダイレクトロジックを実装。
5. `src/app/(auth)/login/page.tsx` を実装し、Google ログインボタンとエラーメッセージを提供。
6. ルートレイアウトに `SessionProvider` を追加し、`useSession` が利用可能な構成にする。
7. ログアウトフロー (`signOut`) とユーザーメニュー UI を実装。
8. 必須環境変数 (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`) のドキュメント化とローカルテンプレート作成 (`.env.example`)。

## Definition of Done
- 認証が必須のページへ未認証アクセスすると `/login` にリダイレクトされる。
- Google アカウントで認証するとダッシュボードに遷移し、セッション情報がヘッダーに表示される。
- ログアウトするとセッションが破棄され `/login` に戻る。
- NextAuth コールバックでユーザーデータが MongoDB に保存される (フェーズ2の接続後に確認)。
- UI/UX 仕様のアクセシビリティ要件 (ボタンラベル、フォーカス制御) が満たされている。
