# フェーズ4: UI コンポーネント実装

## ゴール
MUI をベースにアクセシブルかつレスポンシブな UI を構築し、投稿とカテゴリ管理の体験を最適化する。

## タスク一覧
1. `src/theme/index.ts` にカスタム MUI テーマを定義 (パレット、typography、components override)。
2. ルートレイアウトで `ThemeProvider` と `CssBaseline` を適用。
3. 共通レイアウト
   - `src/components/layout/AppHeader.tsx`
   - `src/components/layout/Sidebar.tsx`
   - `src/components/layout/AppShell.tsx`
4. 投稿関連
   - `PostCard`, `PostList`, `PostDetail`, `PostForm` (MUI Form components + validation states)
5. フィード用無限スクロールフック `useInfinitePosts` を実装。
6. ローディングと空状態コンポーネント (`PostSkeleton`, `EmptyState`).
7. スナックバー通知のための `FeedbackProvider` を実装し、成功/失敗メッセージを一元管理。
8. ページ実装
   - `/dashboard/page.tsx`: 認証後のフィード表示
   - `/posts/new/page.tsx`: 投稿作成フォーム (Server Actions)
   - `/posts/[id]/page.tsx`: 詳細表示 + 自分の投稿なら編集/削除ボタン
   - `/posts/[id]/edit/page.tsx`: 編集フォーム
   - `/categories/[slug]/page.tsx`: カテゴリ別フィード
9. フォーム送信に Server Actions を利用し、成功後に `redirect`。
10. メタデータ (`metadata` API) を各ページで設定。

## Definition of Done
- 主要ブレークポイントでデザインが崩れない (Chrome DevTools で確認)。
- フォームエラーが MUI HelperText と `aria-live` で通知される。
- 認証済みユーザー名とアバターがヘッダーに表示される。
- ローディング時に Skeleton が表示され、空状態では CTA が表示される。
- UI 仕様書のコンポーネント要件に一致する。
