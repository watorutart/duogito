# Duogito プロジェクト概要

## プロジェクトの目的
「Write Code Every Day」の習慣化をサポートするプログラミング版Duolingoツール。GitHubのcontributionsが今日までに連続で何日間できているかを表示し、プログラミング習慣のモチベーション維持を支援する。

## プロジェクト構造
```
duogito/
├── .serena/          # Serena設定ディレクトリ
├── docs/             # ドキュメント
│   ├── design/      # 技術設計文書
│   │   └── duogito-mvp/  # MVP設計文書
│   └── spec/        # 要件定義
├── mise.toml         # Mise設定（uv パッケージマネージャー）
└── .gitignore
```

## 開発状況
- 要件定義は完了済み（docs/spec/duogito-mvp-requirements.md）
- 技術設計文書が既に存在（docs/design/duogito-mvp/）
- 実装はまだ開始されていない（ソースコードディレクトリなし）