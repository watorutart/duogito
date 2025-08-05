# Duogito MVP アーキテクチャ設計

## システム概要

DuogitoはGitHubのcontribution streakを追跡し、日々のコーディング習慣をサポートするツールです。MVPでは、シンプルなCLIツールとして実装し、将来的にWeb UIを追加する設計とします。

## アーキテクチャパターン

- **パターン**: CLI-First Architecture with Layered Design
- **理由**: 
  - MVPの要件に最適（軽量、高速、シンプル）
  - 開発・配布が容易
  - 将来的なWeb UI拡張に対応可能
  - GitHub APIとの統合がシンプル

## システム構成

```
┌─────────────────┐    ┌─────────────────┐
│   CLI Interface │    │  Web Interface  │
│   (Primary)     │    │   (Optional)    │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────┬───────────────┘
                 │
    ┌─────────────────────────────┐
    │      Core Application       │
    │  ┌─────────────────────────┐│
    │  │  Streak Calculator      ││
    │  └─────────────────────────┘│
    │  ┌─────────────────────────┐│
    │  │  GitHub API Client      ││
    │  └─────────────────────────┘│
    │  ┌─────────────────────────┐│
    │  │  Configuration Manager ││
    │  └─────────────────────────┘│
    └─────────────┬───────────────┘
                  │
    ┌─────────────────────────────┐
    │     External Services       │
    │  ┌─────────────────────────┐│
    │  │    GitHub REST API      ││
    │  └─────────────────────────┘│
    │  ┌─────────────────────────┐│
    │  │   GitHub GraphQL API    ││
    │  └─────────────────────────┘│
    └─────────────────────────────┘
```

## コンポーネント構成

### CLI Interface (Primary)
- **フレームワーク**: Node.js + TypeScript + Commander.js
- **機能**: コマンド解析、結果表示、エラーハンドリング
- **設計**: シンプルなコマンド体系（`duogito`, `duogito check`, `duogito config`）

### Web Interface (Optional/Future)
- **フレームワーク**: React + TypeScript + Vite
- **状態管理**: React Context API（軽量なため）
- **スタイリング**: Tailwind CSS
- **機能**: ビジュアル表示、設定管理、ダッシュボード

### Core Application Layer
- **言語**: TypeScript
- **アーキテクチャ**: レイヤードアーキテクチャ
  - Presentation Layer (CLI/Web)
  - Application Layer (ビジネスロジック)
  - Infrastructure Layer (GitHub API, ファイルシステム)

### Data Layer
- **設定管理**: ローカルJSONファイル (`~/.duogito/config.json`)
- **キャッシュ**: オプショナル（パフォーマンス要件に応じて）
- **理由**: MVPではデータベース不要、シンプルな設定管理

### External Integrations
- **GitHub API**: REST API v4 + GraphQL（必要に応じて）
- **認証**: Personal Access Token
- **レート制限**: 適切なリトライ戦略とエラーハンドリング

## デプロイメント戦略

### パッケージマネージャー
- **エコシステム**: pnpm（高速、効率的な依存関係管理）
- **理由**: ディスク容量効率、高速インストール、厳密な依存関係管理

### CLI版
- **配布**: npm package（pnpm経由でインストール可能）
- **インストール**: `pnpm add -g duogito`
- **実行**: `duogito` コマンド
- **開発**: `pnpm install`, `pnpm dev`, `pnpm build`

### Web版（将来）
- **ホスティング**: Vercel/Netlify（静的サイト）
- **API**: Serverless Functions（Vercel Functions/Netlify Functions）

## セキュリティ設計

- **トークン管理**: ローカルファイルに暗号化保存
- **API通信**: HTTPS only
- **データ保護**: 公開データのみ使用、プライベート情報の保存禁止
- **エラーログ**: 機密情報の除去

## パフォーマンス設計

- **レスポンス時間**: 5秒以内（要件）
- **API呼び出し最適化**: 必要最小限のリクエスト
- **キャッシュ戦略**: contribution データの短期間キャッシュ
- **並行処理**: 複数ユーザー対応（Web版）

## 拡張性設計

- **プラグインアーキテクチャ**: 将来的な機能追加に対応
- **設定システム**: JSON Schema による設定検証
- **API抽象化**: GitHub以外のプラットフォーム対応準備
- **モジュラー設計**: 独立性の高いコンポーネント分割