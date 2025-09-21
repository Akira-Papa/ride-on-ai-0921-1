# tasksフォルダのMDを理解して実装（テンプレ）
## 目的
- `tasks/*.md` を読み取り、設計→実装→テスト→PR までを一気通貫で進める。
## タスク内容
- タスク定義MDの解釈
- 設計（必要あれば追記）
- 実装/変更ファイルの着手
- テスト(単体/Jest, 必要ならE2E/Playwright)
- ドキュメント同期(`docs/specs`)
- PR作成と最終セルフレビュー
## 使うタイミング
- タスク定義が固まった直後
## 入力
- タスク定義MD: `tasks/{slug}.md`
## 手順
1) `tasks/{slug}.md` を読み、対応範囲/非範囲とDoDを確定
2) 必要な設計(データ/API/アーキ)を最小追記
3) 「ファイル別 TODO」に従って実装
4) Jest単体→必要ならPlaywright E2Eを追加
5) `docs/specs` を実装に合わせて更新
6) セルフレビュー（互換性/性能/監視/セキュリティ）
7) PR作成（差分とテスト結果、docsリンクを記載）
## 出力
- 変更ソース/テスト
- `docs/specs/*.md` 更新
- PR本文（差分要約/テスト結果/既知の制約）
## サンプル（ダミー）
- 入力: `tasks/2025-09-21_inventory_reservation.md`
- 出力: PR `feature/inventory-reservation`（Jest/Playwright 緑）