# 既存実装からPlaywrightテストを書き実施（テンプレ）
## 目的
- ユースケース/主要シナリオをE2Eで検証し、回帰を防ぐ。
## タスク内容
- シナリオ定義（前提/操作/期待）
- セレクタ戦略（role/testId優先）
- データ準備/クリーンアップ
- CI実行/レポート
## 使うタイミング
- 主要フローが完成/修正されたとき
- 回帰が多い領域
## 入力
- 対象画面/API: {URL/ルート名}
- ユースケース: {シナリオ列挙}
## 手順
1) シナリオを「1ケース1目的」で定義
2) アクセシビリティベースのセレクタを選定
3) テストデータ準備・片付けの仕組みを用意
4) `tests/e2e/{機能}.spec.ts` を実装
5) 実行: `npx playwright test`
6) レポート/録画を保存しPRに添付
## 出力（テスト雛形）
```ts
import { test, expect } from '@playwright/test';
test.describe('{機能}', () => {
  test('ユースケース: {説明}', async ({ page }) => {
    await page.goto('{BASE_URL}/path');
    await page.getByRole('button', { name: '…' }).click();
    await expect(page.getByText('…')).toBeVisible();
  });
});
```
## サンプル（ダミー）
- シナリオ: 「ログイン→商品検索→カート投入→注文確定」