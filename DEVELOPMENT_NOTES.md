# 開発メモ・技術詳細

## 今日の作業で学んだこと・注意点

### 1. Prismaマイグレーション
```bash
# 新しいフィールド追加時の手順
npx prisma migrate dev --name add-character-memo
```
- スキーマ変更後は必ずマイグレーション実行
- Vercelデプロイ時は自動でprisma generateが実行される

### 2. TypeScript型エラー対策
- Lucideアイコンに`title`プロパティは直接設定不可
- 代わりにdivでラップして`title`属性を設定
- Optional chainingを忘れずに（`character.images?.[0]?.filePath`）

### 3. いあきゃらパーサーの改善ポイント
```typescript
// 技能値の複数フォーマット対応
const skillMatch = line.match(/^(.+?)\s+(?:\d+\+\d+\+\d+\=)?(\d+)(?:\s|$)/) || 
                 line.match(/^(.+?)\s+(\d+)(?:\s|$)/)
```
- 正規表現を複数パターンで対応
- 技能名マッピングは包括的に設定

### 4. グリッドレイアウトのレスポンシブ対応
```css
grid-cols-3 md:grid-cols-4  /* 小画面3列、中画面以上4列 */
```

### 5. モーダルのキーボード操作
```typescript
onKeyDown={(e) => {
  if (e.key === 'Enter') handleConfirm()
  if (e.key === 'Escape') handleCancel()
}}
```

## デバッグ時によく使うコマンド

### ローカル開発
```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # ESLint実行
```

### データベース
```bash
npx prisma studio    # データベースGUI
npx prisma db push   # スキーマをDBに反映（開発時）
npx prisma generate  # クライアント再生成
```

### Git & デプロイ
```bash
git add -A && git commit -m "message"
git push
vercel --prod        # 手動デプロイ
vercel ls           # デプロイ一覧確認
```

## よく発生する問題と解決法

### 1. TypeScriptエラー
- **問題**: プロパティが存在しない
- **解決**: Optional chainingと型定義の確認

### 2. スタイルが反映されない
- **問題**: Tailwind CSSクラスが効かない
- **解決**: クラス名の確認、dark:プレフィックスの有無

### 3. API呼び出しエラー
- **問題**: 500エラーが発生
- **解決**: Vercelのログ確認、Prismaクエリの検証

### 4. デプロイエラー
- **問題**: ビルドエラーでデプロイ失敗
- **解決**: ローカルで`npm run build`してエラー修正

## コーディング規約・パターン

### 1. コンポーネント構成
```typescript
// 状態管理
const [state, setState] = useState(initialValue)
const [isLoading, setIsLoading] = useState(false)

// 関数定義
const handleAction = async () => {
  setIsLoading(true)
  try {
    // 処理
  } catch (error) {
    console.error('エラー:', error)
  } finally {
    setIsLoading(false)
  }
}
```

### 2. API呼び出しパターン
```typescript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
if (response.ok) {
  const result = await response.json()
  // 成功処理
} else {
  // エラー処理
}
```

### 3. モーダル実装パターン
```typescript
// 状態
const [showModal, setShowModal] = useState(false)
const [formData, setFormData] = useState('')

// JSX
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      {/* モーダル内容 */}
    </div>
  </div>
)}
```

## 今日追加したファイル・修正点

### 新規作成
- `src/components/Navigation.tsx` - ナビゲーションコンポーネント
- `src/app/api/sessions/[id]/route.ts` - セッション削除API

### 大幅修正
- `src/app/characters/[id]/page.tsx` - メモ機能、MOV削除、知識・アイデア追加
- `src/lib/cthulhu-utils.ts` - 技能初期値修正
- `src/lib/iakyara-parser.ts` - パース処理改善

### データベース
- migration追加: `20250830121156_add_character_memo`

## 次回作業時の注意点
1. 必ず最新のコードをpullしてから作業開始
2. 新機能追加時はTodoWriteツールでタスク管理
3. 変更ごとにコミット・デプロイして動作確認
4. TypeScriptエラーは早めに解決
5. レスポンシブデザインを意識したCSS実装