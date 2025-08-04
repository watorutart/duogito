# API エンドポイント仕様

## 概要

Duogito MVP では主にCLIアプリケーションとして実装しますが、将来的なWeb UI対応のためのAPI設計を定義します。
CLI版では内部的にGitHub APIを直接呼び出し、Web版では独自のAPIエンドポイントを提供します。

## ベースURL

- **開発環境**: `http://localhost:3000/api/v1`
- **本番環境**: `https://duogito.example.com/api/v1` (将来)

## 認証

### 認証方式
- **CLI版**: GitHub Personal Access Token（オプション）
- **Web版**: セッションベース認証 + GitHub OAuth

### 認証ヘッダー
```
Authorization: Bearer <github_personal_access_token>
```

## エンドポイント一覧

### 1. ユーザー情報

#### GET /users/:username
指定されたGitHubユーザーの基本情報を取得

**パラメータ:**
- `username` (string, required): GitHubユーザー名

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "username": "example_user",
    "displayName": "Example User",
    "avatarUrl": "https://avatars.githubusercontent.com/u/123456?v=4",
    "publicRepos": 42,
    "followers": 100,
    "following": 50,
    "createdAt": "2020-01-01T00:00:00.000Z"
  },
  "metadata": {
    "requestId": "req_123456789",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "duration": 250
  }
}
```

**エラーレスポンス:**
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "指定されたユーザーが見つかりません",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

#### GET /users/:username/contributions
指定されたユーザーのコントリビューションデータを取得

**パラメータ:**
- `username` (string, required): GitHubユーザー名

**クエリパラメータ:**
- `startDate` (string, optional): 開始日 (YYYY-MM-DD format)
- `endDate` (string, optional): 終了日 (YYYY-MM-DD format)
- `includePrivate` (boolean, optional): プライベートリポジトリを含める (default: false)

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "contributions": [
      {
        "date": "2024-01-01",
        "contributionCount": 5,
        "contributionLevel": 2
      },
      {
        "date": "2024-01-02", 
        "contributionCount": 3,
        "contributionLevel": 1
      }
    ],
    "totalContributions": 8,
    "dateRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-02"
    }
  }
}
```

### 2. 連続記録

#### GET /users/:username/streak
指定されたユーザーの連続コントリビューション記録を取得

**パラメータ:**
- `username` (string, required): GitHubユーザー名

**クエリパラメータ:**
- `includeAchievements` (boolean, optional): 達成メッセージを含める (default: true)
- `noCache` (boolean, optional): キャッシュを使用しない (default: false)

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "currentStreak": 15,
    "currentStreakStartDate": "2024-01-01",
    "currentStreakEndDate": "2024-01-15",
    "longestStreak": 45,
    "longestStreakStartDate": "2023-10-01",
    "longestStreakEndDate": "2023-11-14",
    "totalContributions": 1234,
    "lastContributionDate": "2024-01-15",
    "achievementMessages": [
      "🔥 15日連続でコーディング中！",
      "⭐ 今月すでに50回のコントリビューション！"
    ]
  },
  "metadata": {
    "requestId": "req_123456789",
    "timestamp": "2024-01-15T12:00:00.000Z",
    "duration": 450,
    "rateLimit": {
      "limit": 5000,
      "remaining": 4999,
      "resetTime": "2024-01-15T13:00:00.000Z"
    }
  }
}
```

#### POST /users/:username/streak/refresh
連続記録の強制更新（キャッシュクリア）

**パラメータ:**
- `username` (string, required): GitHubユーザー名

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "message": "連続記録を更新しました",
    "refreshedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 3. 設定管理

#### GET /config
現在のユーザー設定を取得（CLI版では設定ファイルを読み込み）

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "username": "example_user",
    "displayOptions": {
      "showLongestStreak": true,
      "showTotalContributions": true,
      "showAchievements": true,
      "language": "ja",
      "colorScheme": "auto",
      "dateFormat": "YYYY-MM-DD"
    },
    "cacheOptions": {
      "enabled": true,
      "ttlMinutes": 30,
      "maxSize": 10
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

#### PUT /config
ユーザー設定を更新

**リクエストボディ:**
```json
{
  "username": "new_username",
  "displayOptions": {
    "showLongestStreak": false,
    "language": "en"
  },
  "cacheOptions": {
    "ttlMinutes": 60
  }
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "message": "設定を更新しました",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

#### DELETE /config
設定をリセット（デフォルト値に戻す）

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "message": "設定をリセットしました",
    "resetAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 4. ヘルスチェック・システム情報

#### GET /health
システムのヘルスチェック

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 3600,
    "services": {
      "github_api": "healthy",
      "cache": "healthy",
      "config": "healthy"
    },
    "timestamp": "2024-01-15T12:00:00.000Z"
  }
}
```

#### GET /version
アプリケーションバージョン情報

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "buildDate": "2024-01-01T00:00:00.000Z",
    "gitCommit": "abc123def456",
    "nodeVersion": "18.17.0",
    "platform": "darwin"
  }
}
```

### 5. キャッシュ管理

#### GET /cache/stats
キャッシュ統計情報を取得

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "totalEntries": 15,
    "totalSize": 2048,
    "hitRate": 85.5,
    "totalHits": 342,
    "totalMisses": 58
  }
}
```

#### DELETE /cache
キャッシュをクリア

**クエリパラメータ:**
- `username` (string, optional): 特定ユーザーのキャッシュのみクリア

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "message": "キャッシュをクリアしました",
    "clearedEntries": 15,
    "clearedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

## エラーコード一覧

| エラーコード | HTTPステータス | 説明 |
|-------------|---------------|------|
| `USER_NOT_FOUND` | 404 | 指定されたGitHubユーザーが見つからない |
| `INVALID_USERNAME` | 400 | 無効なユーザー名形式 |
| `UNAUTHORIZED` | 401 | 認証が必要、または認証情報が無効 |
| `FORBIDDEN` | 403 | アクセス権限がない |
| `RATE_LIMIT_EXCEEDED` | 429 | GitHub APIのレート制限に達した |
| `GITHUB_API_ERROR` | 502 | GitHub APIからエラーレスポンス |
| `NETWORK_ERROR` | 503 | ネットワーク接続エラー |
| `CONFIG_ERROR` | 400 | 設定ファイルの形式が無効 |
| `CACHE_ERROR` | 500 | キャッシュ操作エラー |
| `INTERNAL_ERROR` | 500 | 内部サーバーエラー |

## レート制限

### GitHub API制限
- **認証済み**: 5,000 requests/hour
- **未認証**: 60 requests/hour

### 独自API制限（Web版）
- **ユーザーあたり**: 100 requests/hour
- **IP あたり**: 1,000 requests/hour

## CLI コマンドとAPIの対応

| CLIコマンド | 対応するAPIエンドポイント |
|-----------|------------------------|
| `duogito` | `GET /users/:username/streak` |
| `duogito check <username>` | `GET /users/:username/streak` |
| `duogito config` | `GET /config` |
| `duogito config set` | `PUT /config` |
| `duogito config reset` | `DELETE /config` |
| `duogito cache clear` | `DELETE /cache` |
| `duogito version` | `GET /version` |

## セキュリティ

### データ保護
- Personal Access Tokenの暗号化保存
- HTTPS通信の強制
- 機密情報のログ出力禁止

### 入力検証
- ユーザー名形式の検証
- SQLインジェクション対策
- XSS対策（Web版）

### レスポンスヘッダー
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## パフォーマンス最適化

### キャッシュ戦略
- Contribution データ: 30分間キャッシュ
- ユーザー情報: 1時間キャッシュ
- 設定情報: メモリキャッシュ

### 圧縮
- gzip圧縮の有効化
- JSON レスポンスの最適化

### 監視
- レスポンス時間の監視
- エラー率の監視
- API使用量の監視