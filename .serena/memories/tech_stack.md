# Duogito 技術スタック

## 推奨技術スタック（要件定義より）
- **フロントエンド**: TypeScript + React (Web UI版) または CLI (Node.js)
- **パッケージマネージャー**: pnpm（高速、効率的な依存関係管理）
- **API**: GitHub REST API v4 または GraphQL API
- **認証**: GitHub Personal Access Token
- **ツール管理**: mise（uv パッケージマネージャー含む）

## pnpmエコシステム
- **配布**: npm package（pnpm経由でインストール可能）
- **インストール**: `pnpm add -g duogito`
- **開発コマンド**: `pnpm install`, `pnpm dev`, `pnpm build`
- **利点**: ディスク容量効率、高速インストール、厳密な依存関係管理

## 現在の依存関係
- mise.toml で uv（Python用パッケージマネージャー）を管理
- package.json等の設定ファイルは未作成

## API仕様
- GitHub Contributions API: `https://api.github.com/users/{username}/events`
- GitHub GraphQL API: contributionsCollection

## データ構造（TypeScript）
```typescript
interface ContributionStreak {
  currentStreak: number;
  lastContributionDate: string;
  longestStreak?: number;
  achievementMessages: string[];
}
```