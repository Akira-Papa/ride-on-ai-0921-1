# UI 仕様 & 画面遷移

## 画面一覧
1. `/login` (ログインページ)
2. `/dashboard` (最新投稿フィード)
3. `/posts/new` (投稿作成フォーム)
4. `/posts/[id]` (投稿詳細)
5. `/posts/[id]/edit` (投稿編集)
6. `/categories/[slug]` (カテゴリ別フィード)
7. 共通レイアウト (ヘッダー、ナビゲーション、ユーザーメニュー)

## 画面遷移図 (テキスト表現)
```
未認証 → /login --Sign in with Google--> 認証コールバック → /dashboard
/dashboard --"新規投稿"--> /posts/new --保存--> /posts/[id]
/dashboard --"カテゴリ"--> /categories/[slug] --投稿クリック--> /posts/[id]
/posts/[id] --"編集"--> /posts/[id]/edit --保存--> /posts/[id]
/posts/[id] --"戻る"--> 前の一覧 (履歴)
```

## 共通コンポーネント
- **AppHeader**: ロゴ、カテゴリ選択、ユーザードロップダウン (プロフィール画像 + メニュー)。
- **Sidebar** (md 以上): 人気カテゴリリンク、クイックリンク。
- **PostCard**: タイトル、カテゴリ Chip、投稿日、タグ、リアクションボタン。
- **PostForm**: TextField (title)、Textarea (lesson, situationalContext)、Select (category)、ChipInput (tags)、Visibility Switch。

## レイアウトブレークポイント
- モバイル: ナビゲーションはトップ AppBar にまとめる。カテゴリは Drawer。
- デスクトップ: 3 カラム (Sidebar / Feed / Detail) を MUI Grid で構築。

## カラーパレット (MUI Theme)
- primary.main: `#5A3E85`
- secondary.main: `#F3B431`
- background.default: `#121212` (ダークベース)
- text.primary: `#FFFFFF`
- text.secondary: `#C7C7C7`

## タイポグラフィ
- Heading: `Merriweather` (Google Font) weight 700
- Body: `Roboto` weight 400/500
- Button: Uppercase, medium weight

## UX 要件
- フォームはバリデーションエラーをインライン表示 (HelperText + `aria-describedby`).
- 投稿一覧は無限スクロール (IntersectionObserver) + Skeleton ローディング。
- 投稿詳細は Markdown でレンダリング (安全な `marked` + DOMPurify equivalent→ `sanitize-html`).
- 戻るナビゲーションは `Link` + `prefetch`。
- ヘッダー検索フィールドでタイトル/本文検索、タグ Chip クリックで `?tag=` フィルターを付与。

## アクセシビリティ
- すべてのボタン/リンクに `aria-label`。
- カラーコントラスト比 AA (計算済み)。
- キーボード操作: Tab 順序 -> Header → Main → Footer。

## 空状態
- 投稿が存在しない場合: イラスト + CTA ボタン "最初の投稿を作成"。

## エラーメッセージ
- Toast (MUI Snackbar) + ページ上部 Alert。
- 認証失敗: "Google 認証に失敗しました。しばらくしてから再試行してください。"

## 主要カテゴリ (初期データ)
1. キャリア (`career`)
2. 人間関係 (`relationships`)
3. お金 (`finance`)
4. 健康 (`health`)
5. 学び (`learning`)
