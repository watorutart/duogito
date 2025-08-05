# Duogito 開発コマンド

## プロジェクト初期化
プロジェクトはまだ実装段階に入っていないため、具体的な開発コマンドは未定義。

## 想定される開発コマンド（pnpm使用）
```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# テスト実行
pnpm test

# リント
pnpm lint

# フォーマット
pnpm format

# 型チェック
pnpm type-check
```

## 現在利用可能なコマンド
```bash
# mise経由でuvを使用
mise use uv@latest
```

## システムコマンド（Darwin）
- `ls` - ファイル一覧
- `cd` - ディレクトリ移動
- `grep` - テキスト検索（ripgrepの`rg`推奨）
- `find` - ファイル検索
- `git` - バージョン管理