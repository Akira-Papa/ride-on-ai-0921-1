# メンテナンスガイド

## 定期タスク
| 頻度 | 作業内容 | 詳細 |
|---|---|---|
| 毎週 | 依存パッケージ更新 | `pnpm update --latest` → `pnpm test` → PR 作成 |
| 毎週 | MongoDB 状態確認 | Atlas の `Slow Query` / `Index` タブをチェック |
| 毎月 | OAuth クライアント監査 | Google Cloud で認証要求件数・エラーを確認 |
| 毎月 | アクセスログの棚卸し | Next/Vercel Logs を BigQuery へエクスポート |

## 障害対応フロー
1. Cloud Logging / Vercel でアラート検知
2. 再現手順の特定（UI / API / Server Action）
3. ユニットテスト or Playwright で再現テスト追加
4. フィックス → `pnpm test` / `pnpm test:e2e`
5. HOTFIX ブランチでデプロイ → 事後 RCA 作成

## データメンテ
- カテゴリはシードコードで idempotent 更新（`ensureDefaultCategories`）
- 投稿削除時にリアクションを `PostReactionModel.deleteMany` で完全削除（孤児データの心配なし）
- 長期的には `TTL Index` を検討し、保管期限を過ぎた非公開投稿を自動削除

## 運用 Tips
- `pnpm lint --fix` で静的解析を自動修正
- Storybook 導入時には `pnpm dlx sb init` を利用（コンポーネントのリグレッション確認）
- `playwright test --headed --project=chromium` で目視確認を定期的に実施
