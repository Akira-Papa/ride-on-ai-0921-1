# Jest Unit Test Design Document

## 1. 概要

本ドキュメントは、anotokiアプリケーションのJestユニットテストの詳細設計書です。
各APIエンドポイント、サービス、ユーティリティ、コンポーネントについて、境界値テスト、分岐テスト、例外処理の正常系・異常系を網羅的に定義します。

## 2. テスト対象とテスト戦略

### 2.1 テスト対象範囲
- **API Routes**: すべてのAPIエンドポイント（認証、投稿管理、カテゴリ、リアクション）
- **Services**: ビジネスロジックレイヤー（postService, categoryService）
- **Utils**: ユーティリティ関数（apiResponse, apiUtils, markdownUtils）
- **Validation**: Zodスキーマバリデーション
- **Actions**: Server Actions（post-actions）
- **Components**: Reactコンポーネント（PostCard, PostForm, PostList等）
- **Auth**: 認証関連機能（session管理）

### 2.2 モック戦略
- **データベース**: Mongoose modelをjest.mockで完全モック化
- **NextAuth**: 認証セッションのモック
- **外部API**: Google OAuthのモック
- **環境変数**: process.envのモック

## 3. API Routes テストケース

### 3.1 GET /api/posts - 投稿一覧取得

#### 3.1.1 正常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | デフォルトパラメータでの取得 | なし | page=1, limit=10の投稿一覧を返す |
| 2 | ページネーション（最初のページ） | page=1, limit=5 | 最初の5件を返す |
| 3 | ページネーション（中間ページ） | page=2, limit=10 | 11-20件目を返す |
| 4 | ページネーション（最終ページ） | page=最終, limit=10 | 残りの件数を返す |
| 5 | 検索クエリあり（完全一致） | search="学習" | タイトル/レッスンに"学習"を含む投稿 |
| 6 | 検索クエリあり（部分一致） | search="学" | タイトル/レッスンに"学"を含む投稿 |
| 7 | カテゴリフィルタ | category="work" | workカテゴリの投稿のみ |
| 8 | タグフィルタ（単一） | tags=["タグ1"] | "タグ1"を持つ投稿のみ |
| 9 | タグフィルタ（複数） | tags=["タグ1","タグ2"] | いずれかのタグを持つ投稿 |
| 10 | 複合フィルタ | search="学習", category="work" | 両条件を満たす投稿 |
| 11 | ソート（作成日降順） | デフォルト | 新しい順に並ぶ |
| 12 | 認証済みユーザーでmember可視性 | session有り | member/private投稿を含む |
| 13 | 未認証でmember可視性フィルタ | session無し | publicのみ（現在はmemberのみ） |
| 14 | 投稿者情報の結合 | includeAuthor=true | author情報を含む |
| 15 | リアクション情報の結合 | includeReactions=true | reactions配列を含む |

#### 3.1.2 境界値テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | ページ番号最小値 | page=1 | 正常に1ページ目を返す |
| 2 | ページ番号0 | page=0 | page=1として処理 |
| 3 | ページ番号負数 | page=-1 | page=1として処理 |
| 4 | ページ番号最大値超過 | page=999999 | 空配列を返す |
| 5 | リミット最小値 | limit=1 | 1件のみ返す |
| 6 | リミット0 | limit=0 | limit=1として処理 |
| 7 | リミット負数 | limit=-1 | limit=10として処理 |
| 8 | リミット最大値（100） | limit=100 | 最大100件を返す |
| 9 | リミット最大値超過 | limit=101 | limit=100として処理 |
| 10 | 空文字列検索 | search="" | フィルタなしと同じ |
| 11 | 長文検索クエリ（255文字） | search="a".repeat(255) | 正常に検索 |
| 12 | 超長文検索クエリ（256文字） | search="a".repeat(256) | 255文字に切り詰め |
| 13 | 空配列タグ | tags=[] | フィルタなしと同じ |
| 14 | タグ配列最大数（10個） | tags=Array(10) | 正常にフィルタ |
| 15 | タグ配列超過（11個） | tags=Array(11) | 最初の10個のみ使用 |

#### 3.1.3 異常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 不正なページ番号型 | page="abc" | 400 Bad Request |
| 2 | 不正なリミット型 | limit="xyz" | 400 Bad Request |
| 3 | 不正なタグ型 | tags="string" | 400 Bad Request |
| 4 | 存在しないカテゴリ | category="invalid" | 空配列を返す |
| 5 | SQLインジェクション試行 | search="'; DROP TABLE" | サニタイズされて安全に処理 |
| 6 | XSS試行 | search="<script>" | エスケープされて安全に処理 |
| 7 | データベース接続エラー | DB停止中 | 500 Internal Server Error |
| 8 | タイムアウト | 処理30秒超過 | 504 Gateway Timeout |
| 9 | メモリ不足 | 大量データ要求 | 507 Insufficient Storage |
| 10 | 不正なHTTPメソッド | POST /api/posts（一覧） | 405 Method Not Allowed |

### 3.2 POST /api/posts - 投稿作成

#### 3.2.1 正常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 必須項目のみで作成 | title, lesson, categoryId | 201 Created、投稿が作成される |
| 2 | 全項目入力で作成 | 全フィールド | 201 Created、全データが保存される |
| 3 | 日本語タイトル | title="学習記録" | 正常に保存 |
| 4 | 英数字タイトル | title="Learning123" | 正常に保存 |
| 5 | 記号を含むタイトル | title="学習！＃＄％" | 正常に保存 |
| 6 | Markdownレッスン | lesson="# 見出し\n- リスト" | 正常に保存 |
| 7 | HTMLを含むレッスン | lesson="<b>太字</b>" | サニタイズして保存 |
| 8 | 改行を含むレッスン | lesson="行1\n行2\n行3" | 改行が保持される |
| 9 | 状況説明あり | situationalContext="会議中" | 正常に保存 |
| 10 | タグ1個 | tags=["タグ1"] | 正常に保存 |
| 11 | タグ5個（最大） | tags=["タグ1"..."タグ5"] | 正常に保存 |
| 12 | visibility=member | visibility="member" | memberとして保存 |
| 13 | visibility=private | visibility="private" | privateとして保存 |
| 14 | 既存カテゴリID | categoryId=validId | カテゴリが紐付けられる |
| 15 | 認証済みユーザー | session.user存在 | authorIdが設定される |

#### 3.2.2 境界値テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | タイトル最小文字数（1文字） | title="あ" | 正常に保存 |
| 2 | タイトル最大文字数（100文字） | title="あ".repeat(100) | 正常に保存 |
| 3 | タイトル最大超過（101文字） | title="あ".repeat(101) | 400 バリデーションエラー |
| 4 | レッスン最小文字数（1文字） | lesson="学" | 正常に保存 |
| 5 | レッスン最大文字数（5000文字） | lesson="あ".repeat(5000) | 正常に保存 |
| 6 | レッスン最大超過（5001文字） | lesson="あ".repeat(5001) | 400 バリデーションエラー |
| 7 | 状況説明最大（500文字） | situationalContext=500文字 | 正常に保存 |
| 8 | 状況説明超過（501文字） | situationalContext=501文字 | 400 バリデーションエラー |
| 9 | タグ0個 | tags=[] | 正常に保存（タグなし） |
| 10 | タグ6個（超過） | tags=Array(6) | 400 バリデーションエラー |
| 11 | タグ名最小（1文字） | tags=["あ"] | 正常に保存 |
| 12 | タグ名最大（20文字） | tags=["あ".repeat(20)] | 正常に保存 |
| 13 | タグ名超過（21文字） | tags=["あ".repeat(21)] | 400 バリデーションエラー |
| 14 | 空文字タイトル | title="" | 400 バリデーションエラー |
| 15 | 空文字レッスン | lesson="" | 400 バリデーションエラー |

#### 3.2.3 異常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 未認証での作成 | session=null | 401 Unauthorized |
| 2 | タイトル未入力 | titleなし | 400 必須項目エラー |
| 3 | レッスン未入力 | lessonなし | 400 必須項目エラー |
| 4 | カテゴリID未入力 | categoryIdなし | 400 必須項目エラー |
| 5 | 存在しないカテゴリID | categoryId="invalid" | 400 参照エラー |
| 6 | 不正な型（タイトルが数値） | title=123 | 400 型エラー |
| 7 | 不正な型（タグが文字列） | tags="string" | 400 型エラー |
| 8 | 不正なvisibility値 | visibility="public" | 400 enum違反 |
| 9 | XSS攻撃（script注入） | title="<script>alert()</script>" | サニタイズされて保存 |
| 10 | SQLインジェクション | lesson="'; DROP TABLE" | エスケープされて保存 |
| 11 | 重複タグ | tags=["同じ","同じ"] | 重複削除して保存 |
| 12 | null値の混入 | tags=[null,"タグ"] | nullを除外して保存 |
| 13 | DB接続エラー | DB停止中 | 500 Internal Server Error |
| 14 | トランザクションエラー | 保存中にエラー | 500 ロールバック |
| 15 | リクエストサイズ超過 | 10MB超のデータ | 413 Payload Too Large |

### 3.3 GET /api/posts/[id] - 投稿詳細取得

#### 3.3.1 正常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 存在する投稿ID | id=validObjectId | 200 OK、投稿詳細を返す |
| 2 | 投稿者情報を含む | populate=author | author情報を含む |
| 3 | カテゴリ情報を含む | populate=category | category情報を含む |
| 4 | リアクション情報を含む | populate=reactions | reactions配列を含む |
| 5 | member投稿（認証済み） | visibility=member, session有 | 正常に取得 |
| 6 | private投稿（投稿者本人） | visibility=private, 本人 | 正常に取得 |
| 7 | 全フィールド取得 | すべてのフィールド存在 | 全データを返す |
| 8 | Markdown形式のレッスン | lesson with markdown | HTMLに変換される |
| 9 | タグ付き投稿 | tags存在 | タグ配列を含む |
| 10 | いいね済み投稿 | userReaction=like | isLiked=true |
| 11 | ブックマーク済み投稿 | userReaction=bookmark | isBookmarked=true |
| 12 | 作成日時情報 | createdAt存在 | ISO形式で返す |
| 13 | 更新日時情報 | updatedAt存在 | ISO形式で返す |
| 14 | ソフトデリート済み（管理者） | deleted=true, admin | 削除済みフラグ付きで返す |
| 15 | 投稿統計情報 | includeStats=true | いいね数、閲覧数等を含む |

#### 3.3.2 境界値テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | ObjectId最小値 | id="000000000000000000000000" | 404 Not Found |
| 2 | ObjectId最大値 | id="ffffffffffffffffffffffff" | 404 Not Found |
| 3 | 24文字のID | id=24文字の16進数 | 正常処理 |
| 4 | 23文字のID | id=23文字 | 400 Invalid ID |
| 5 | 25文字のID | id=25文字 | 400 Invalid ID |
| 6 | 大文字小文字混在ID | id="AbCdEf..." | 小文字に変換して処理 |
| 7 | レスポンスサイズ最大 | 5000文字のレッスン | 正常に返す |
| 8 | タグ配列0個 | tags=[] | 空配列を返す |
| 9 | タグ配列5個 | tags=5個 | 全タグを返す |
| 10 | リアクション0件 | reactions=[] | 空配列を返す |
| 11 | リアクション1000件 | reactions=1000 | ページネーション適用 |
| 12 | ネスト深度最大 | populate深度3 | 3階層まで展開 |
| 13 | キャッシュヒット | 2回目のリクエスト | キャッシュから返す |
| 14 | キャッシュミス | 初回リクエスト | DBから取得 |
| 15 | 同時リクエスト | 並行10リクエスト | 全て正常に処理 |

#### 3.3.3 異常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 存在しない投稿ID | id=nonExistentId | 404 Not Found |
| 2 | 不正な形式のID | id="invalid-id" | 400 Invalid ObjectId |
| 3 | 空文字ID | id="" | 400 ID Required |
| 4 | null ID | id=null | 400 ID Required |
| 5 | private投稿（他ユーザー） | visibility=private, 他人 | 403 Forbidden |
| 6 | 未認証でprivate投稿 | visibility=private, no session | 401 Unauthorized |
| 7 | 削除済み投稿（一般） | deleted=true, user | 404 Not Found |
| 8 | SQLインジェクション | id="'; DROP TABLE" | 400 Invalid ID |
| 9 | パストラバーサル | id="../../../etc/passwd" | 400 Invalid ID |
| 10 | DB接続エラー | DB停止中 | 500 Internal Server Error |
| 11 | populate循環参照 | 循環する参照 | 500 Circular Reference |
| 12 | タイムアウト | 処理30秒超過 | 504 Gateway Timeout |
| 13 | メモリ不足 | 巨大データ | 507 Insufficient Storage |
| 14 | 不正なHTTPメソッド | POST /api/posts/[id] | 405 Method Not Allowed |
| 15 | レート制限超過 | 100req/min超過 | 429 Too Many Requests |

### 3.4 PUT /api/posts/[id] - 投稿更新

#### 3.4.1 正常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | タイトルのみ更新 | title="新タイトル" | 200 OK、タイトル更新 |
| 2 | レッスンのみ更新 | lesson="新レッスン" | 200 OK、レッスン更新 |
| 3 | カテゴリ変更 | categoryId=newId | 200 OK、カテゴリ更新 |
| 4 | タグ追加 | tags=[...既存,"新規"] | 200 OK、タグ追加 |
| 5 | タグ削除 | tags=[一部のみ] | 200 OK、タグ削減 |
| 6 | タグ全削除 | tags=[] | 200 OK、タグクリア |
| 7 | visibility変更（member→private） | visibility="private" | 200 OK、変更される |
| 8 | visibility変更（private→member） | visibility="member" | 200 OK、変更される |
| 9 | 状況説明追加 | situationalContext="新規" | 200 OK、追加される |
| 10 | 状況説明削除 | situationalContext="" | 200 OK、クリアされる |
| 11 | 全項目更新 | 全フィールド変更 | 200 OK、全て更新 |
| 12 | 部分更新 | 一部フィールドのみ | 200 OK、指定箇所のみ更新 |
| 13 | 更新日時の自動更新 | 任意の更新 | updatedAtが更新される |
| 14 | 投稿者本人による更新 | authorId=userId | 200 OK、正常更新 |
| 15 | バージョン管理 | version競合なし | 200 OK、version++ |

#### 3.4.2 境界値テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | タイトル1文字に更新 | title="あ" | 200 OK |
| 2 | タイトル100文字に更新 | title=100文字 | 200 OK |
| 3 | タイトル101文字に更新 | title=101文字 | 400 Validation Error |
| 4 | レッスン1文字に更新 | lesson="学" | 200 OK |
| 5 | レッスン5000文字に更新 | lesson=5000文字 | 200 OK |
| 6 | レッスン5001文字に更新 | lesson=5001文字 | 400 Validation Error |
| 7 | タグ0個に更新 | tags=[] | 200 OK |
| 8 | タグ5個に更新 | tags=5個 | 200 OK |
| 9 | タグ6個に更新 | tags=6個 | 400 Validation Error |
| 10 | 同じ値で更新 | 既存と同じ値 | 200 OK（更新なし） |
| 11 | 空オブジェクトで更新 | {} | 200 OK（変更なし） |
| 12 | 1フィールドのみ更新 | title only | 200 OK |
| 13 | 更新回数上限（1000回） | 1000回目の更新 | 200 OK |
| 14 | 同時更新（楽観的ロック） | 同じ投稿を2人が更新 | 409 Conflict |
| 15 | 巨大ペイロード（1MB） | 1MBのデータ | 200 OK |

#### 3.4.3 異常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 未認証での更新 | session=null | 401 Unauthorized |
| 2 | 他人の投稿を更新 | authorId≠userId | 403 Forbidden |
| 3 | 存在しない投稿を更新 | id=nonExistent | 404 Not Found |
| 4 | 不正なID形式 | id="invalid" | 400 Invalid ID |
| 5 | 削除済み投稿を更新 | deleted=true | 404 Not Found |
| 6 | 読み取り専用フィールド更新 | _id, createdAt | 400 Read-only Field |
| 7 | 不正な型（title=number） | title=123 | 400 Type Error |
| 8 | 不正なcategoryId | categoryId="invalid" | 400 Invalid Reference |
| 9 | XSS攻撃 | title="<script>" | サニタイズされて保存 |
| 10 | SQLインジェクション | lesson="'; UPDATE" | エスケープされて保存 |
| 11 | 巨大ペイロード（10MB） | 10MBのデータ | 413 Payload Too Large |
| 12 | DB接続エラー | DB停止中 | 500 Internal Server Error |
| 13 | トランザクション失敗 | 更新中にエラー | 500 Rollback |
| 14 | デッドロック | 同時更新競合 | 500 Deadlock Detected |
| 15 | バージョン競合 | 古いversionで更新 | 409 Version Conflict |

### 3.5 DELETE /api/posts/[id] - 投稿削除

#### 3.5.1 正常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 投稿者本人による削除 | authorId=userId | 204 No Content |
| 2 | ソフトデリート | softDelete=true | deleted=trueに更新 |
| 3 | ハードデリート | hardDelete=true | 物理削除 |
| 4 | 関連リアクション削除 | reactions存在 | カスケード削除 |
| 5 | タグ付き投稿削除 | tags存在 | タグ関連も削除 |
| 6 | コメント付き投稿削除 | comments存在 | コメントも削除 |
| 7 | 削除後の取得 | 削除→GET | 404 Not Found |
| 8 | 削除履歴の記録 | audit=true | 削除ログ記録 |
| 9 | 削除通知 | notify=true | 関係者に通知 |
| 10 | バックアップ作成 | backup=true | バックアップ後削除 |
| 11 | 削除理由の記録 | reason="違反" | 理由を保存 |
| 12 | 管理者による削除 | role=admin | 204 No Content |
| 13 | 一括削除（管理者） | ids=[id1,id2] | 204 No Content |
| 14 | 削除予約 | scheduledAt=future | 予約削除設定 |
| 15 | 削除取り消し可能期間 | grace=30days | 30日間復元可能 |

#### 3.5.2 境界値テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 作成直後の削除 | 作成1秒後 | 204 No Content |
| 2 | 古い投稿の削除 | 1年前の投稿 | 204 No Content |
| 3 | リアクション0件の投稿 | reactions=[] | 204 No Content |
| 4 | リアクション1000件の投稿 | reactions=1000 | 204（時間かかる） |
| 5 | 最後の投稿を削除 | 残り1件 | 204 No Content |
| 6 | 同時削除要求 | 並行10リクエスト | 最初のみ成功 |
| 7 | 削除→即再削除 | 連続削除 | 404 Not Found |
| 8 | 削除復元→削除 | restore→delete | 204 No Content |
| 9 | カスケード削除最大 | 関連100件 | 204（処理時間増） |
| 10 | トランザクション最大 | 10操作 | 204 No Content |
| 11 | 削除キュー最大 | 100件キュー | キューイング |
| 12 | バックアップサイズ最大 | 5MB投稿 | バックアップ成功 |
| 13 | 削除理由最大文字数 | 500文字 | 正常記録 |
| 14 | 削除理由超過 | 501文字 | 切り詰めて記録 |
| 15 | 削除予約最大期間 | 1年後 | 予約成功 |

#### 3.5.3 異常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 未認証での削除 | session=null | 401 Unauthorized |
| 2 | 他人の投稿を削除 | authorId≠userId | 403 Forbidden |
| 3 | 存在しない投稿削除 | id=nonExistent | 404 Not Found |
| 4 | 既に削除済み | deleted=true | 404 Not Found |
| 5 | 不正なID形式 | id="invalid" | 400 Invalid ID |
| 6 | 保護された投稿 | protected=true | 403 Protected |
| 7 | 削除権限なし | role=viewer | 403 Forbidden |
| 8 | DB接続エラー | DB停止中 | 500 Internal Server Error |
| 9 | カスケード削除失敗 | 関連削除エラー | 500 Rollback |
| 10 | バックアップ失敗 | ストレージ不足 | 507 Storage Error |
| 11 | トランザクション失敗 | 削除中エラー | 500 Rollback |
| 12 | デッドロック | 同時削除 | 500 Deadlock |
| 13 | 削除ログ記録失敗 | ログDB停止 | 削除成功、ログ失敗通知 |
| 14 | タイムアウト | 30秒超過 | 504 Timeout |
| 15 | 不正なHTTPメソッド | GET /api/posts/[id]/delete | 405 Method Not Allowed |

### 3.6 POST /api/posts/[id]/reactions - リアクション追加/削除

#### 3.6.1 正常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | いいね追加（初回） | type="like", action="add" | 201 Created |
| 2 | いいね削除 | type="like", action="remove" | 204 No Content |
| 3 | ブックマーク追加 | type="bookmark", action="add" | 201 Created |
| 4 | ブックマーク削除 | type="bookmark", action="remove" | 204 No Content |
| 5 | いいねトグル | type="like", action="toggle" | 201/204 |
| 6 | 複数タイプ同時 | like + bookmark | 両方追加 |
| 7 | リアクション数更新 | 追加後 | カウント+1 |
| 8 | 重複いいね防止 | 2回目のいいね | 200 既存を返す |
| 9 | 異なる投稿に同時 | 複数投稿 | 各投稿に追加 |
| 10 | 自分の投稿にいいね | authorId=userId | 201 許可 |
| 11 | リアクション履歴 | history=true | 履歴記録 |
| 12 | リアクション通知 | notify=true | 投稿者に通知 |
| 13 | リアクションランキング更新 | 追加後 | ランキング更新 |
| 14 | バッチ処理 | reactions=[{...}] | 一括処理 |
| 15 | リアクション統計 | stats=true | 統計情報返す |

#### 3.6.2 境界値テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 最初のリアクション | reactions.length=0 | 201 Created |
| 2 | 1000個目のいいね | reactions.length=999 | 201 Created |
| 3 | 10000個目のいいね | reactions.length=9999 | 201（パフォーマンス低下） |
| 4 | 同一ユーザー複数タイプ | like+bookmark | 両方可能 |
| 5 | 削除→即追加 | remove→add | 正常処理 |
| 6 | 追加→即削除 | add→remove | 正常処理 |
| 7 | 同時リクエスト | 並行10要求 | 全て処理 |
| 8 | 高頻度トグル | 1秒10回 | レート制限 |
| 9 | 古い投稿へのリアクション | 1年前の投稿 | 201 Created |
| 10 | 新規投稿へのリアクション | 作成1秒後 | 201 Created |
| 11 | リアクションタイプ最小 | type=2文字 | 正常処理 |
| 12 | リアクションタイプ最大 | type=20文字 | 正常処理 |
| 13 | バッチサイズ最大 | 100リアクション | 正常処理 |
| 14 | バッチサイズ超過 | 101リアクション | 400 Too Many |
| 15 | ユニーク制約 | 同じuser+post+type | 既存を返す |

#### 3.6.3 異常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 未認証でリアクション | session=null | 401 Unauthorized |
| 2 | 存在しない投稿 | id=nonExistent | 404 Not Found |
| 3 | 削除済み投稿 | deleted=true | 404 Not Found |
| 4 | 不正なリアクションタイプ | type="invalid" | 400 Invalid Type |
| 5 | 不正なアクション | action="invalid" | 400 Invalid Action |
| 6 | typeなし | typeパラメータなし | 400 Required |
| 7 | actionなし | actionパラメータなし | 400 Required |
| 8 | private投稿（他人） | visibility=private | 403 Forbidden |
| 9 | 不正なID形式 | id="invalid" | 400 Invalid ID |
| 10 | DB接続エラー | DB停止中 | 500 Server Error |
| 11 | ユニーク制約違反 | 重複追加 | 409 Conflict |
| 12 | トランザクション失敗 | 追加中エラー | 500 Rollback |
| 13 | レート制限超過 | 100/min超過 | 429 Too Many |
| 14 | タイムアウト | 30秒超過 | 504 Timeout |
| 15 | メモリ不足 | 大量リアクション | 507 Insufficient |

### 3.7 GET /api/categories - カテゴリ一覧取得

#### 3.7.1 正常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 全カテゴリ取得 | なし | 全カテゴリリスト |
| 2 | アクティブカテゴリのみ | active=true | 有効なカテゴリのみ |
| 3 | 投稿数を含む | includeCount=true | 各カテゴリの投稿数 |
| 4 | ソート（名前順） | sort="name" | アルファベット順 |
| 5 | ソート（投稿数順） | sort="postCount" | 投稿多い順 |
| 6 | ソート（作成日順） | sort="createdAt" | 新しい順 |
| 7 | 親カテゴリのみ | parent=null | トップレベルのみ |
| 8 | 子カテゴリ含む | includeChildren=true | 階層構造で返す |
| 9 | 説明文含む | includeDescription=true | description含む |
| 10 | アイコン情報含む | includeIcon=true | icon URL含む |
| 11 | メタ情報含む | includeMeta=true | メタデータ含む |
| 12 | ページネーション | page=1, limit=10 | 10件ずつ |
| 13 | 検索フィルタ | search="仕事" | 名前/説明で検索 |
| 14 | 言語別取得 | locale="ja" | 日本語カテゴリ |
| 15 | キャッシュ利用 | 2回目のリクエスト | キャッシュから返す |

#### 3.7.2 境界値テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | カテゴリ0件 | DBが空 | 空配列 |
| 2 | カテゴリ1件 | 1件のみ存在 | 1件返す |
| 3 | カテゴリ100件 | 100件存在 | 全件返す |
| 4 | ページ1 | page=1 | 最初のページ |
| 5 | ページ最終 | page=last | 最後のページ |
| 6 | ページ超過 | page=999 | 空配列 |
| 7 | リミット最小 | limit=1 | 1件のみ |
| 8 | リミット最大 | limit=100 | 100件まで |
| 9 | リミット超過 | limit=101 | 100件で制限 |
| 10 | 検索文字列最大 | search=255文字 | 正常検索 |
| 11 | 検索文字列超過 | search=256文字 | 255文字で切る |
| 12 | 階層深度最大 | depth=5 | 5階層まで |
| 13 | 階層深度超過 | depth=6 | 5階層で制限 |
| 14 | 同時リクエスト | 並行10要求 | 全て処理 |
| 15 | キャッシュTTL境界 | TTL切れ直前/直後 | 適切に更新 |

#### 3.7.3 異常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 不正なソート値 | sort="invalid" | 400 Invalid Sort |
| 2 | 不正なページ番号 | page="abc" | 400 Invalid Page |
| 3 | 不正なリミット | limit="xyz" | 400 Invalid Limit |
| 4 | SQLインジェクション | search="'; DROP" | サニタイズ |
| 5 | XSS試行 | search="<script>" | エスケープ |
| 6 | DB接続エラー | DB停止中 | 500 Server Error |
| 7 | タイムアウト | 30秒超過 | 504 Timeout |
| 8 | メモリ不足 | 大量データ | 507 Insufficient |
| 9 | 不正なHTTPメソッド | POST /api/categories | 405 Not Allowed |
| 10 | レート制限 | 100req/min | 429 Too Many |
| 11 | 循環参照 | 親子が循環 | 500 Circular Ref |
| 12 | キャッシュエラー | Redis停止 | DBから取得 |
| 13 | 不正な言語コード | locale="xx" | デフォルト使用 |
| 14 | 権限不足（private） | private categories | 403 Forbidden |
| 15 | データ不整合 | 参照切れ | 整合性チェック |

### 3.8 GET /api/session - セッション情報取得

#### 3.8.1 正常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 認証済みユーザー | valid session | user情報を返す |
| 2 | 未認証ユーザー | no session | null を返す |
| 3 | セッション期限内 | expires > now | 有効なセッション |
| 4 | Google OAuth経由 | provider=google | Google情報含む |
| 5 | ユーザー基本情報 | user object | id, email, name |
| 6 | プロフィール画像 | user.image | 画像URL含む |
| 7 | ロール情報 | user.role | ロール含む |
| 8 | 権限情報 | permissions | 権限リスト |
| 9 | セッショントークン | csrfToken | CSRF token含む |
| 10 | 有効期限情報 | expires | ISO形式日時 |
| 11 | プロバイダー情報 | provider | OAuth provider |
| 12 | アクセストークン | accessToken | token含む（開発のみ） |
| 13 | リフレッシュ処理 | 期限近い | 自動更新 |
| 14 | 複数デバイス | 別デバイス | 各セッション独立 |
| 15 | セッション統計 | stats=true | ログイン履歴等 |

#### 3.8.2 境界値テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | セッション作成直後 | 作成0秒後 | 有効 |
| 2 | セッション期限直前 | 期限1秒前 | 有効 |
| 3 | セッション期限切れ | 期限1秒後 | null/更新要求 |
| 4 | 最短セッション | 1分間 | 正常動作 |
| 5 | 最長セッション | 30日間 | 正常動作 |
| 6 | セッションサイズ最小 | 最小データ | 正常 |
| 7 | セッションサイズ最大 | 4KB | 正常 |
| 8 | セッションサイズ超過 | 4KB超 | エラー |
| 9 | 同時セッション数 | 10デバイス | 全て有効 |
| 10 | セッション更新頻度 | 1秒間隔 | 正常 |
| 11 | Cookie最大サイズ | 4093bytes | 正常 |
| 12 | Cookie超過 | 4094bytes | エラー |
| 13 | トークン長最小 | 32文字 | 正常 |
| 14 | トークン長最大 | 512文字 | 正常 |
| 15 | 並行リクエスト | 10並行 | 全て同じ結果 |

#### 3.8.3 異常系テストケース

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 無効なセッション | invalid token | null/401 |
| 2 | 改ざんセッション | modified token | 401 Invalid |
| 3 | 期限切れセッション | expired | null/要再認証 |
| 4 | 削除済みユーザー | deleted user | null/セッション無効 |
| 5 | 停止中ユーザー | suspended user | 403 Suspended |
| 6 | CSRF攻撃 | wrong token | 403 CSRF |
| 7 | セッション固定攻撃 | fixed session | 新セッション生成 |
| 8 | Cookie盗難 | stolen cookie | IP検証失敗 |
| 9 | DB接続エラー | DB停止 | 500/キャッシュ使用 |
| 10 | Redis接続エラー | Redis停止 | DBフォールバック |
| 11 | プロバイダーエラー | OAuth失敗 | 500 Provider Error |
| 12 | ネットワークエラー | 接続切断 | 500 Network Error |
| 13 | タイムアウト | 30秒超過 | 504 Timeout |
| 14 | 不正なHTTPメソッド | POST /api/session | 405 Not Allowed |
| 15 | レート制限 | 1000req/min | 429 Too Many |

## 4. Services テストケース

### 4.1 postService

#### 4.1.1 findPosts メソッド

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | フィルタなし検索 | {} | 全投稿を返す |
| 2 | ページネーション | skip=10, limit=5 | 11-15件目 |
| 3 | カテゴリフィルタ | categoryId=ObjectId | 該当カテゴリのみ |
| 4 | タグフィルタ（IN） | tags: {$in: [...]} | いずれかのタグ |
| 5 | 全文検索 | $text search | マッチする投稿 |
| 6 | 複合条件 | AND条件 | 全条件一致 |
| 7 | ソート | sort: {createdAt: -1} | 新しい順 |
| 8 | Populate | populate: ['author'] | 参照展開 |
| 9 | Select | select: 'title' | 指定フィールドのみ |
| 10 | Lean | lean() | Plain object |
| 11 | Count | countDocuments() | 件数のみ |
| 12 | Distinct | distinct('tags') | ユニーク値 |
| 13 | Aggregate | aggregation pipeline | 集計結果 |
| 14 | Virtual fields | virtuals: true | 仮想フィールド含む |
| 15 | Transaction | session object | トランザクション内実行 |

#### 4.1.2 createPost メソッド

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 正常作成 | valid data | 作成成功 |
| 2 | バリデーション成功 | schema準拠 | 保存成功 |
| 3 | デフォルト値適用 | 一部省略 | デフォルト値設定 |
| 4 | Pre-saveフック | hooks enabled | フック実行 |
| 5 | Post-saveフック | hooks enabled | フック実行 |
| 6 | インデックス作成 | unique fields | インデックス作成 |
| 7 | タイムスタンプ | timestamps: true | 自動設定 |
| 8 | バージョニング | versionKey | __v: 0 |
| 9 | カスタムID | _id指定 | 指定ID使用 |
| 10 | 参照整合性 | valid refs | 参照チェック成功 |
| 11 | 配列フィールド | tags array | 配列保存 |
| 12 | ネストオブジェクト | nested data | ネスト保存 |
| 13 | Mixed型 | Schema.Types.Mixed | 任意型保存 |
| 14 | Buffer型 | Binary data | バイナリ保存 |
| 15 | Decimal128型 | 高精度数値 | 精度保持 |

#### 4.1.3 updatePost メソッド

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | findByIdAndUpdate | id, update | 更新成功 |
| 2 | updateOne | filter, update | 1件更新 |
| 3 | updateMany | filter, update | 複数更新 |
| 4 | $set演算子 | $set: {...} | フィールド設定 |
| 5 | $unset演算子 | $unset: {...} | フィールド削除 |
| 6 | $inc演算子 | $inc: {count: 1} | 数値増減 |
| 7 | $push演算子 | $push: {tags: ...} | 配列追加 |
| 8 | $pull演算子 | $pull: {tags: ...} | 配列削除 |
| 9 | $addToSet | $addToSet: {...} | ユニーク追加 |
| 10 | runValidators | runValidators: true | バリデーション実行 |
| 11 | new: true | new: true | 更新後を返す |
| 12 | upsert | upsert: true | なければ作成 |
| 13 | arrayFilters | arrayFilters: [...] | 配列条件更新 |
| 14 | timestamps | timestamps: false | 更新日時スキップ |
| 15 | optimisticConcurrency | version check | 楽観的ロック |

#### 4.1.4 deletePost メソッド

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | findByIdAndDelete | id | 削除成功 |
| 2 | deleteOne | filter | 1件削除 |
| 3 | deleteMany | filter | 複数削除 |
| 4 | ソフトデリート | deleted: true | 論理削除 |
| 5 | カスケード削除 | with relations | 関連も削除 |
| 6 | Pre-removeフック | hooks | フック実行 |
| 7 | Post-removeフック | hooks | フック実行 |
| 8 | トランザクション削除 | session | トランザクション内 |
| 9 | 削除ログ | audit: true | ログ記録 |
| 10 | 削除通知 | notify: true | 通知送信 |
| 11 | バックアップ | backup: true | バックアップ作成 |
| 12 | 復元可能削除 | recoverable | 復元可能 |
| 13 | 完全削除 | hard delete | 物理削除 |
| 14 | 一括削除 | bulk delete | バッチ処理 |
| 15 | 条件付き削除 | conditional | 条件一致のみ |

### 4.2 categoryService

#### 4.2.1 getAllCategories メソッド

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 全カテゴリ取得 | なし | 全件返す |
| 2 | アクティブのみ | isActive: true | 有効のみ |
| 3 | 階層構造 | populate: 'children' | 親子関係 |
| 4 | ソート | sort: 'order' | 順序通り |
| 5 | キャッシュヒット | 2回目 | キャッシュから |
| 6 | キャッシュミス | 初回 | DBから取得 |
| 7 | キャッシュ無効化 | after update | 再取得 |
| 8 | Select | select: 'name slug' | 指定フィールド |
| 9 | Lean | lean: true | Plain Object |
| 10 | 投稿数含む | withCount: true | 投稿数付き |
| 11 | メタデータ含む | withMeta: true | メタ情報付き |
| 12 | ローカライズ | locale: 'ja' | 日本語 |
| 13 | 権限フィルタ | role based | 権限で制限 |
| 14 | Pagination | limit & offset | ページング |
| 15 | 検索 | search: 'keyword' | 検索結果 |

#### 4.2.2 getCategoryBySlug メソッド

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 存在するslug | 'work' | カテゴリ返す |
| 2 | 存在しないslug | 'invalid' | null |
| 3 | 大文字小文字 | 'Work' | 小文字で検索 |
| 4 | トリミング | ' work ' | トリム後検索 |
| 5 | 特殊文字 | 'work-life' | そのまま検索 |
| 6 | 日本語slug | '仕事' | 正常検索 |
| 7 | 空文字 | '' | null |
| 8 | null | null | null |
| 9 | undefined | undefined | null |
| 10 | 数値 | 123 | 文字列変換 |
| 11 | SQLインジェクション | "'; DROP" | サニタイズ |
| 12 | XSS | '<script>' | エスケープ |
| 13 | 長いslug | 100文字 | 正常検索 |
| 14 | Unicode | '絵文字😀' | 正常検索 |
| 15 | キャッシュ利用 | 2回目 | キャッシュから |

#### 4.2.3 createCategory メソッド

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 正常作成 | valid data | 作成成功 |
| 2 | 重複slug | existing slug | エラー |
| 3 | 親カテゴリ指定 | parent: id | 階層作成 |
| 4 | 順序指定 | order: 1 | 順序設定 |
| 5 | アイコン指定 | icon: 'url' | アイコン保存 |
| 6 | 説明指定 | description | 説明保存 |
| 7 | メタデータ | meta: {...} | メタ保存 |
| 8 | デフォルト値 | 最小データ | デフォルト適用 |
| 9 | バリデーション | schema違反 | エラー |
| 10 | スラッグ生成 | nameのみ | 自動生成 |
| 11 | 日本語名 | name: '仕事' | 正常作成 |
| 12 | 最大文字数 | 各フィールド最大 | 正常作成 |
| 13 | トランザクション | with session | トランザクション内 |
| 14 | イベント発火 | post-create | イベント発生 |
| 15 | キャッシュ更新 | after create | キャッシュクリア |

### 4.3 認証関連サービス

#### 4.3.1 getAuthSession メソッド

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 有効なセッション | valid token | session object |
| 2 | 無効なセッション | invalid token | null |
| 3 | 期限切れ | expired token | null |
| 4 | 更新直前 | near expiry | 更新＆返す |
| 5 | CSRF token | with csrf | 検証成功 |
| 6 | なしCSRF | no csrf | エラー |
| 7 | IP検証 | same IP | 成功 |
| 8 | IP変更 | different IP | 検証 or エラー |
| 9 | User-Agent検証 | same UA | 成功 |
| 10 | UA変更 | different UA | 警告 or エラー |
| 11 | 複数セッション | multi device | 各々独立 |
| 12 | セッション破棄後 | after logout | null |
| 13 | ユーザー削除後 | deleted user | null |
| 14 | ユーザー停止後 | suspended | エラー |
| 15 | 権限変更後 | role changed | 新権限 |

## 5. Utils テストケース

### 5.1 apiResponse ユーティリティ

#### 5.1.1 success メソッド

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | データあり | data: {...} | 200, success: true |
| 2 | データなし | data: null | 200, success: true |
| 3 | 配列データ | data: [] | 200, success: true |
| 4 | メッセージ付き | message: 'OK' | messageフィールド |
| 5 | ステータス指定 | status: 201 | 201 Created |
| 6 | メタデータ付き | meta: {...} | metaフィールド |
| 7 | ページネーション | pagination: {...} | ページ情報 |
| 8 | 空オブジェクト | {} | 200, {} |
| 9 | undefined | undefined | 200, null |
| 10 | 大きなデータ | 1MB data | 正常返却 |
| 11 | 日本語データ | 日本語 | UTF-8で返却 |
| 12 | 特殊文字 | 絵文字等 | 正常返却 |
| 13 | Date型 | new Date() | ISO文字列 |
| 14 | Buffer型 | Buffer | Base64 |
| 15 | 循環参照 | circular | エラー回避 |

#### 5.1.2 error メソッド

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | エラーメッセージ | message: 'Error' | 400, error |
| 2 | ステータス指定 | status: 404 | 404 Not Found |
| 3 | エラーコード | code: 'E001' | codeフィールド |
| 4 | 詳細情報 | details: {...} | detailsフィールド |
| 5 | スタックトレース | stack: true | stack（開発のみ） |
| 6 | バリデーションエラー | errors: [] | エラー配列 |
| 7 | 複数エラー | multiple | 配列で返却 |
| 8 | ネストエラー | nested | 階層構造 |
| 9 | 国際化 | i18n key | ローカライズ |
| 10 | HTTPステータス | 各種status | 適切なコード |
| 11 | カスタムエラー | AppError | エラー情報 |
| 12 | 原因付き | cause: {...} | 原因情報 |
| 13 | リトライ情報 | retry: {...} | リトライ指示 |
| 14 | ヘルプリンク | help: 'url' | ヘルプURL |
| 15 | タイムスタンプ | timestamp | 発生時刻 |

### 5.2 markdownUtils

#### 5.2.1 renderMarkdown メソッド

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 見出し | # Title | <h1>Title</h1> |
| 2 | リスト | - item | <ul><li> |
| 3 | 番号リスト | 1. item | <ol><li> |
| 4 | リンク | [text](url) | <a href> |
| 5 | 画像 | ![alt](url) | <img> |
| 6 | コード | \`code\` | <code> |
| 7 | コードブロック | \`\`\`js | <pre><code> |
| 8 | 引用 | > quote | <blockquote> |
| 9 | 水平線 | --- | <hr> |
| 10 | テーブル | |a|b| | <table> |
| 11 | 太字 | **bold** | <strong> |
| 12 | 斜体 | *italic* | <em> |
| 13 | 打消し | ~~strike~~ | <del> |
| 14 | HTML混在 | <div>test | エスケープ |
| 15 | XSS防御 | <script> | 除去 |

#### 5.2.2 sanitizeHtml メソッド

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 安全なHTML | <p>text</p> | そのまま |
| 2 | scriptタグ | <script> | 除去 |
| 3 | onclick属性 | onclick="" | 除去 |
| 4 | styleタグ | <style> | 除去（or 許可） |
| 5 | iframeタグ | <iframe> | 除去 |
| 6 | 許可タグ | <b><i><u> | 保持 |
| 7 | data属性 | data-* | 保持/除去 |
| 8 | href属性 | href="url" | 検証 |
| 9 | javascript: | href="javascript:" | 除去 |
| 10 | data: URL | src="data:" | 検証 |
| 11 | 相対URL | href="/path" | 保持 |
| 12 | 絶対URL | href="http://" | 検証 |
| 13 | メールリンク | mailto: | 許可/除去 |
| 14 | tel:リンク | tel: | 許可/除去 |
| 15 | カスタムプロトコル | custom: | 除去 |

## 6. Validation (Zod) テストケース

### 6.1 postValidation スキーマ

#### 6.1.1 createPostSchema

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 完全なデータ | all fields | valid |
| 2 | 最小データ | required only | valid |
| 3 | title欠落 | no title | error |
| 4 | title空文字 | title: "" | error |
| 5 | title最大超過 | 101 chars | error |
| 6 | lesson欠落 | no lesson | error |
| 7 | lesson最大超過 | 5001 chars | error |
| 8 | tags最大超過 | 6 tags | error |
| 9 | tag最大文字超過 | 21 chars | error |
| 10 | 無効なvisibility | "public" | error |
| 11 | 無効なcategoryId | "invalid" | error |
| 12 | 型違い（number） | title: 123 | error |
| 13 | null値 | title: null | error |
| 14 | undefined | 省略可能field | valid |
| 15 | 追加フィールド | extra: "data" | stripped |

#### 6.1.2 updatePostSchema

| No | テストケース | 入力値 | 期待結果 |
|----|------------|--------|----------|
| 1 | 全フィールド更新 | all fields | valid |
| 2 | 部分更新 | partial | valid |
| 3 | 空オブジェクト | {} | valid |
| 4 | title更新 | title only | valid |
| 5 | title空文字 | title: "" | error |
| 6 | lesson更新 | lesson only | valid |
| 7 | tags追加 | tags: [...] | valid |
| 8 | tags削除 | tags: [] | valid |
| 9 | visibility変更 | visibility | valid |
| 10 | 読み取り専用更新 | _id, createdAt | error |
| 11 | 型違い | wrong types | error |
| 12 | 最大値超過 | over limits | error |
| 13 | パッチ操作 | $set, $unset | valid |
| 14 | 無効な演算子 | $invalid | error |
| 15 | ネストした更新 | nested.field | valid |

## 7. React Components テストケース

### 7.1 PostCard コンポーネント

#### 7.1.1 レンダリングテスト

| No | テストケース | Props/状態 | 期待結果 |
|----|------------|------------|----------|
| 1 | 基本レンダリング | post data | 正常表示 |
| 2 | タイトル表示 | title prop | タイトル表示 |
| 3 | レッスン表示 | lesson prop | レッスン表示 |
| 4 | 作者情報表示 | author prop | 作者名表示 |
| 5 | カテゴリバッジ | category prop | バッジ表示 |
| 6 | タグ表示 | tags array | タグチップ表示 |
| 7 | いいねボタン | isLiked: false | ハートアイコン |
| 8 | いいね済み | isLiked: true | 塗りハート |
| 9 | ブックマーク | isBookmarked | ブックマークアイコン |
| 10 | 日時表示 | createdAt | 相対時間 |
| 11 | 編集ボタン | isOwner: true | 編集ボタン表示 |
| 12 | 削除ボタン | isOwner: true | 削除ボタン表示 |
| 13 | Private表示 | visibility: private | 鍵アイコン |
| 14 | レスポンシブ | various widths | 適切なレイアウト |
| 15 | スケルトン | loading: true | スケルトン表示 |

#### 7.1.2 インタラクションテスト

| No | テストケース | アクション | 期待結果 |
|----|------------|-----------|----------|
| 1 | いいねクリック | click like | onLike呼び出し |
| 2 | ブックマーククリック | click bookmark | onBookmark呼び出し |
| 3 | カード全体クリック | click card | 詳細へ遷移 |
| 4 | 編集クリック | click edit | onEdit呼び出し |
| 5 | 削除クリック | click delete | 確認ダイアログ |
| 6 | 削除確認 | confirm delete | onDelete呼び出し |
| 7 | 削除キャンセル | cancel delete | 何もしない |
| 8 | タグクリック | click tag | onTagClick |
| 9 | カテゴリクリック | click category | カテゴリページ |
| 10 | 作者クリック | click author | プロフィール |
| 11 | シェアクリック | click share | シェアメニュー |
| 12 | コピーリンク | copy link | クリップボード |
| 13 | キーボード操作 | Enter/Space | アクション実行 |
| 14 | ダブルクリック | double click | 1回のみ処理 |
| 15 | 長押し | long press | コンテキストメニュー |

### 7.2 PostForm コンポーネント

#### 7.2.1 フォームバリデーション

| No | テストケース | 入力 | 期待結果 |
|----|------------|------|----------|
| 1 | 必須項目チェック | 空で送信 | エラー表示 |
| 2 | タイトル必須 | titleなし | エラー |
| 3 | レッスン必須 | lessonなし | エラー |
| 4 | カテゴリ必須 | categoryなし | エラー |
| 5 | 文字数制限 | 超過入力 | エラー |
| 6 | タグ数制限 | 6個以上 | エラー |
| 7 | リアルタイムバリデーション | 入力中 | 即座にチェック |
| 8 | onBlurバリデーション | フォーカス外 | チェック |
| 9 | 成功時 | 正しい入力 | エラーなし |
| 10 | カスタムバリデーション | 特定条件 | カスタムエラー |
| 11 | 非同期バリデーション | API確認 | 非同期エラー |
| 12 | フォーム全体エラー | 送信時 | 全エラー表示 |
| 13 | エラー解消 | 修正後 | エラー消える |
| 14 | 警告表示 | 推奨違反 | 警告メッセージ |
| 15 | ヘルプテキスト | 各フィールド | ヘルプ表示 |

#### 7.2.2 フォーム操作

| No | テストケース | 操作 | 期待結果 |
|----|------------|------|----------|
| 1 | テキスト入力 | type text | 値反映 |
| 2 | テキストエリア | multiline | 改行保持 |
| 3 | セレクト選択 | select option | 値変更 |
| 4 | タグ追加 | add tag | チップ追加 |
| 5 | タグ削除 | remove tag | チップ削除 |
| 6 | ラジオボタン | visibility | 選択切替 |
| 7 | フォーム送信 | submit | onSubmit呼出 |
| 8 | フォームリセット | reset | 初期値に戻る |
| 9 | キャンセル | cancel | onCancel呼出 |
| 10 | 自動保存 | auto save | 定期保存 |
| 11 | 下書き保存 | save draft | draft状態 |
| 12 | プレビュー | preview | プレビュー表示 |
| 13 | ファイルアップロード | file select | ファイル追加 |
| 14 | ドラッグ&ドロップ | drag file | ファイル追加 |
| 15 | ペースト | paste content | 内容貼付 |

### 7.3 PostList コンポーネント

#### 7.3.1 リスト表示

| No | テストケース | 状態 | 期待結果 |
|----|------------|------|----------|
| 1 | 投稿リスト表示 | posts array | 全件表示 |
| 2 | 空リスト | posts: [] | 空状態表示 |
| 3 | ローディング | loading: true | スケルトン |
| 4 | エラー状態 | error: true | エラー表示 |
| 5 | ページネーション | hasMore: true | 更に読み込む |
| 6 | 最終ページ | hasMore: false | 終了表示 |
| 7 | 無限スクロール | scroll bottom | 自動読み込み |
| 8 | Pull to refresh | pull down | リフレッシュ |
| 9 | ソート切替 | sort option | 並び替え |
| 10 | フィルタ適用 | filter | フィルタ結果 |
| 11 | 検索結果 | search query | 検索結果表示 |
| 12 | グリッド表示 | view: grid | グリッドレイアウト |
| 13 | リスト表示 | view: list | リストレイアウト |
| 14 | 仮想スクロール | 1000 items | 仮想化表示 |
| 15 | リトライ | retry button | 再読み込み |

## 8. Server Actions テストケース

### 8.1 post-actions

#### 8.1.1 createPostAction

| No | テストケース | 入力 | 期待結果 |
|----|------------|------|----------|
| 1 | 正常作成 | valid data | success response |
| 2 | バリデーションエラー | invalid | error response |
| 3 | 認証チェック | no session | redirect login |
| 4 | 権限チェック | no permission | forbidden |
| 5 | DB保存 | save to DB | saved |
| 6 | レスポンス | after save | formatted response |
| 7 | エラーハンドリング | DB error | error response |
| 8 | リダイレクト | after success | redirect |
| 9 | キャッシュ更新 | revalidate | cache cleared |
| 10 | 楽観的更新 | optimistic | immediate UI |
| 11 | ロールバック | on error | rollback |
| 12 | 通知 | notify: true | notification sent |
| 13 | ログ記録 | audit log | logged |
| 14 | メトリクス | metrics | recorded |
| 15 | レート制限 | rate limit | throttled |

## 9. モック実装設計

### 9.1 Mongoose モデルモック

```javascript
// __mocks__/mongoose.js で実装
- Model.find()
- Model.findById()
- Model.findOne()
- Model.create()
- Model.findByIdAndUpdate()
- Model.findByIdAndDelete()
- Model.countDocuments()
- Model.aggregate()
- populate()
- lean()
- session/transaction
```

### 9.2 NextAuth モック

```javascript
// __mocks__/next-auth.js で実装
- getServerSession()
- getSession()
- useSession()
- signIn()
- signOut()
- getCsrfToken()
```

### 9.3 外部サービスモック

```javascript
// Google OAuth
- Google API responses
- Token exchange
- User profile

// その他
- fetch/axios responses
- File system operations
- Email service
```

## 10. テスト実行計画

### 10.1 実行順序
1. ユーティリティ関数
2. バリデーションスキーマ
3. サービス層
4. APIルート
5. Server Actions
6. Reactコンポーネント

### 10.2 カバレッジ目標
- ライン: 90%以上
- ブランチ: 85%以上
- 関数: 90%以上
- ステートメント: 90%以上

### 10.3 継続的インテグレーション
- プルリクエスト時に全テスト実行
- カバレッジレポート生成
- 失敗時はマージブロック
- パフォーマンステスト含む