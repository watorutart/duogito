# Duogito コードスタイルと規約

## プロジェクト状況
現在、実装コードが存在しないため、具体的なコードスタイルは未定義。

## 要件定義から推測される規約
- **言語**: TypeScript（型安全性重視）
- **エラーメッセージ**: 日本語で分かりやすく表示
- **API設計**: RESTful原則に従う
- **命名**: 英語ベース（interfaceは英語、コメント・メッセージは日本語）

## 推奨規約（一般的なTypeScript/React）
- ESLint + Prettier使用
- 関数名・変数名: camelCase
- インターフェース名: PascalCase
- ファイル名: kebab-case
- TypeScript strict mode有効
- コンポーネント: 関数コンポーネント推奨

## ドキュメント規約
- 要件定義: EARS記法使用
- 設計文書: Mermaid図を含む
- ファイル構造: docs/design/{feature}/ の形式