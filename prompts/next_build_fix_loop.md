# Next.js ビルド通過まで修正ループ（テンプレ）
## 目的
- Next.js のビルド/型/ESLint/SWCエラーを解消し、CIを緑にする。
## タスク内容
- ビルド実行→エラー読解→最小修正→再実行の反復
- SSR/CSR境界・依存の是正
- 型穴埋め/不使用除去/遅延ロード
## 使うタイミング
- 新規導入/大改修/依存更新後
## 入力
- リポジトリ現状
- ビルドコマンド/設定: `next.config.js`, `tsconfig.json`, `.eslintrc`
## 手順（ループ）
1) `pnpm build`（または `npm run build`）
2) エラーを分類:
   - ランタイム境界(CSR/SSR)/Client Component誤用
   - 型不整合/ESLintルール違反
   - 動的 import 必須箇所/ブラウザAPI参照
3) 最小修正:
   - `use client` 化 or 分離
   - `dynamic(() => import('…'), { ssr: false })`
   - 型定義補強/any撤廃/依存更新
4) 再実行→0件まで反復
5) CIでの差異再現（環境変数/Node/OS差分）
## 出力
- ビルド成功ログ
- 修正差分（根拠コメント）
## サンプル（ダミー）
- 事象: `createTheme()` をServerで呼び出し→Client側へ分離