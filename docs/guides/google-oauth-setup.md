## Google認証（OAuth 2.0）設定ガイド（ブラウザ操作）

このガイドでは、Google Cloud Console を使ってブラウザから `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` を取得し、`.env.local` に設定するまでを手順で説明します。

### 前提条件
- Google アカウント
- アプリのURL（`NEXTAUTH_URL`）
  - ローカル開発: `http://localhost:3000`
  - 本番: `https://<your-domain>`

### リダイレクトURI（重要）
- ローカル: `http://localhost:3000/api/auth/callback/google`
- 本番: `https://<your-domain>/api/auth/callback/google`

---

## 手順（ブラウザ）

### 1) Google Cloud Console にアクセス
1. ブラウザで `https://console.cloud.google.com/` にアクセス
2. 右上のアカウントでサインイン

### 2) プロジェクトの作成（または選択）
1. 画面上部のプロジェクトセレクタをクリック
2. 「新しいプロジェクト」をクリックしてプロジェクト名を入力→作成
3. 作成後、そのプロジェクトを選択

### 3) OAuth 同意画面の設定
1. 左サイドバー「API とサービス」→「OAuth 同意画面」
2. ユーザータイプは通常「外部（External）」を選択→作成
3. アプリ情報を入力
   - アプリ名（任意の名称）
   - ユーザーサポートメール
   - デベロッパーの連絡先情報（必須）
4. スコープはデフォルト（openid, email, profile）でOK（NextAuthの標準）
5. テストユーザー（必要に応じて）
   - 「テスト中」ステータスの場合、使用するGoogleアカウントを追加
6. 保存

### 4) OAuth クライアントIDの作成
1. 左サイドバー「API とサービス」→「認証情報」
2. 「認証情報を作成」→「OAuth クライアントID」
3. アプリケーションの種類: 「ウェブアプリケーション」を選択
4. 名前: 任意（例: Web Client for NextAuth）
5. 承認済みのリダイレクトURIに以下を追加
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-domain>/api/auth/callback/google`（本番がある場合）
6. 作成
7. ダイアログに表示される「クライアントID」と「クライアント シークレット」を控える

---

## 環境変数の設定
プロジェクト直下の `.env.local` に以下を設定します（ファイルが無ければ作成）。

```dotenv
# アプリのベースURL
NEXTAUTH_URL=http://localhost:3000

# NextAuth の暗号化用シークレット（32文字以上のランダム値）
# 例: `openssl rand -base64 32`
NEXTAUTH_SECRET=（生成した値）

# Google OAuth クレデンシャル
GOOGLE_CLIENT_ID=（取得したクライアントID）
GOOGLE_CLIENT_SECRET=（取得したクライアントシークレット）

# MongoDB（使用している場合）
MONGODB_URI=（接続文字列）
```

保存後、開発サーバーを再起動してください。

```bash
pnpm dev
```

---

## 動作確認
1. `pnpm dev` を起動
2. ブラウザで `http://localhost:3000/login` へアクセス
3. 「Sign in with Google」ボタンから認証フローが成功するか確認

---

## よくあるエラーと対処
- リダイレクトURIの不一致（redirect_uri_mismatch）
  - Google Cloud Console の「承認済みのリダイレクトURI」に、実際に使用しているURIが正確に登録されているか確認（末尾の `/google` まで一致する必要）
- origin の不一致 / CORS 相当のエラー
  - `NEXTAUTH_URL` が現在アクセスしているホストと一致しているか確認
- 403: access_blocked / 組織ポリシー
  - 会社アカウントで制限がある場合、個人アカウントでテスト / 管理者に確認
- invalid_client / invalid_grant
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` に誤りがないか、末尾スペースや改行に注意
- テストユーザー制限
  - 「テスト中」ステータスで未追加のユーザーは使えません。使用するアカウントをテストユーザーに追加

---

## 本番デプロイ時の注意（Vercel 例）
1. Vercel のプロジェクト設定 → Environment Variables に以下を登録
   - `NEXTAUTH_URL=https://<your-domain>`
   - `NEXTAUTH_SECRET=（本番用ランダム値）`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - `MONGODB_URI`
2. Google Cloud Console 側のリダイレクトURIにも本番URLを追加
3. デプロイ後に `/login` で確認

---

## 参考
- NextAuth.js Google Provider: `https://next-auth.js.org/providers/google`
- Google Cloud Console: `https://console.cloud.google.com/`


