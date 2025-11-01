# Qiita Articles Viewer

Qiita API を使用して記事を閲覧できるWebアプリケーションです。記事の検索、一覧表示、詳細表示などの機能を提供します。

## 📑 目次

- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [アーキテクチャ](#アーキテクチャ)
- [環境構築](#環境構築)
- [開発](#開発)
- [テスト](#テスト)
- [プロジェクト構造](#プロジェクト構造)
- [デプロイ](#デプロイ)

## 🚀 主な機能

- **記事一覧表示**: Qiitaの記事を一覧で表示
- **記事詳細表示**: 記事の詳細情報を確認
- **検索機能**: キーワードで記事を検索
- **ページネーション**: 大量の記事を効率的に閲覧
- **ソート機能**: 記事を様々な条件でソート
- **APIキー管理**: 個人用アクセストークンの安全な管理
- **レスポンシブデザイン**: PC・タブレット・スマートフォンに対応

## 🛠 技術スタック

### フロントエンド

- **Next.js 15.5**: React フレームワーク（App Router使用）
- **React 19**: UI ライブラリ
- **TypeScript 5**: 型安全性の確保
- **Material-UI (MUI) v7**: UIコンポーネントライブラリ
- **Tailwind CSS v4**: ユーティリティファーストCSS

### 状態管理・データフェッチング

- **TanStack Query (React Query)**: サーバー状態管理
- **Context API**: グローバル状態管理

### API

- **Axios**: HTTPクライアント
- **Qiita API v2**: 記事データの取得

### 開発ツール

- **Jest**: 単体テスト
- **React Testing Library**: コンポーネントテスト
- **Storybook**: コンポーネントカタログ
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット

## 🏗 アーキテクチャ

### Atomic Design

本プロジェクトは **Atomic Design** パターンを採用しています：

```
components/
├── atoms/         # 最小単位のコンポーネント（Button, TextField等）
├── molecules/     # atomsを組み合わせたコンポーネント（ApiKeyForm, LoadingSpinner等）
├── organisms/     # moleculesを組み合わせた複雑なコンポーネント（ItemList, ItemDetail等）
└── templates/     # ページレイアウト（MainLayout等）
```

### ディレクトリ構成

```
src/
├── app/                # Next.js App Router（ページ定義）
├── components/         # UIコンポーネント（Atomic Design）
├── hooks/              # カスタムフック
├── services/           # API通信ロジック
├── stores/             # グローバル状態管理
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
└── __tests__/          # テストコード（コンポーネント・フック・サービス等）
```

## 📦 環境構築

### 前提条件

- Node.js 20.x 以上
- npm 10.x 以上

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd qiita-articles-viewer

# 依存パッケージのインストール
npm install
```

### Qiita APIキーの取得

1. [Qiita](https://qiita.com/) にログイン
2. [設定] > [アプリケーション] > [個人用アクセストークン] に移動
3. 「新しくトークンを発行する」をクリック
4. スコープを選択（read_qiita を推奨）
5. 発行されたトークンをコピー
6. アプリケーション起動後、画面からAPIキーを設定

## 💻 開発

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

### ビルド

```bash
npm run build
```

### 本番サーバーの起動

```bash
npm run start
```

### Storybook の起動

```bash
npm run storybook
```

ブラウザで [http://localhost:6006](http://localhost:6006) を開く

### コード品質チェック

```bash
# ESLint実行
npm run lint
```

## 🧪 テスト

### テストの実行

```bash
# 全テスト実行
npm run test

# 特定のファイルをテスト
npm run test -- <file-path>

# ウォッチモード
npm run test -- --watch
```

### テストの種類

- **単体テスト**: 個々の関数・フックのテスト
- **コンポーネントテスト**: UIコンポーネントの振る舞いテスト
- **統合テスト**: 複数のコンポーネントを組み合わせたテスト

### テストカバレッジ

テストは以下のディレクトリに配置されています：

```
src/__tests__/
├── components/        # コンポーネントテスト
├── hooks/             # カスタムフックテスト
├── services/          # APIサービステスト
├── stores/            # 状態管理テスト
└── utils/             # ユーティリティ関数テスト
```

## 📁 プロジェクト構造

```
qiita-articles-viewer/
├── public/                    # 静的ファイル
├── src/
│   ├── app/
│   │   ├── [id]/             # 動的ルート（記事詳細ページ）
│   │   │   └── page.tsx
│   │   ├── layout.tsx        # ルートレイアウト
│   │   ├── page.tsx          # トップページ
│   │   └── globals.css       # グローバルスタイル
│   ├── components/
│   │   ├── atoms/            # 基本コンポーネント
│   │   ├── molecules/        # 複合コンポーネント
│   │   ├── organisms/        # 複雑なコンポーネント
│   │   ├── templates/        # レイアウトテンプレート
│   │   └── Providers.tsx     # プロバイダー設定
│   ├── hooks/
│   │   └── useQiitaApi.ts    # Qiita API用フック
│   ├── services/
│   │   └── qiitaApi.ts       # Qiita API通信
│   ├── stores/
│   │   └── AppContext.tsx    # アプリケーション状態管理
│   ├── types/
│   │   └── qiita.ts          # Qiita API型定義
│   ├── utils/
│   │   └── dateUtils.ts      # 日付処理ユーティリティ
│   └── __tests__/            # テストファイル
├── eslint.config.mjs         # ESLint設定
├── jest.config.js            # Jest設定
├── next.config.ts            # Next.js設定
├── package.json              # パッケージ管理
├── tsconfig.json             # TypeScript設定
└── README.md                 # このファイル
```

## 📚 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Qiita API v2 Documentation](https://qiita.com/api/v2/docs)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)

## ⚠️ 注意事項

- Qiita APIにはレート制限があります（認証なし: 60回/時間、認証あり: 1000回/時間）
- 個人用アクセストークンは他人と共有しないでください
