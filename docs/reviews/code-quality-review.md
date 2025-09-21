# コード品質レビュー（2024-09-21）

## 概要
- TypeScript Strict Mode 準拠、`@` エイリアスでモジュール整理済み
- サービス層 (`postService`, `categoryService`) と UI 層の責務分離が明確
- Zod スキーマを共有し、サーバーアクション／API 両方で再利用

## 長所
- サーバーアクションは `ActionState` を返し、クライアント側でトースト+リダイレクトをハンドリング
- `AppShell`→`AppHeader`→コンポーネントの流れが明快で、Context を Providers に閉じ込めている
- Jest と Playwright のフォルダ分離 (`tests/unit`, `tests/e2e`) により責務が明瞭

## 改善ポイント
1. **Playwright 実行**: 現環境（CLI サンドボックス）ではポートバインドが禁止されテストが実行できない。CI では `PORT` 指定＆権限を確認し、ヘッドレス検証を必ず走らせること。
2. **エラーメッセージのローカライズ**: サーバーアクションから返す `message` を `feedback.*` 形式に統一済み。クライアント側で `resolveMessage` を共通化すると重複が減る。
3. **型ガード**: `postService` で `as unknown as` を使用する箇所（populate 後の型）をラップ型に切り出すと読みやすさ向上。
4. **ユニットテストの網羅**: 現状はバリデーション中心。サービス層の happy-path テスト（Mongo を `mongodb-memory-server` でモック）を追加すると信頼性が高まる。

## 対応済み
- `AppHeader` 検索欄に `aria-label` を付与し、アクセシビリティを強化
- NextAuth サインイン時にメールアドレス必須チェックを追加（セキュリティレビュー指摘）

## 推奨
- 共有ユーティリティ（`resolveMessage`）を `/src/lib/utils/client.ts` 等に集約
- ESLint ルールで `no-explicit-any` を明示、`unknown` への移行を継続

以上の観点を踏まえ、今後の PR ではテスト追加と型安全性の向上を優先して推進する。
