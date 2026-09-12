# affiliate-hub

継続報酬(リカーリング)型アフィリエイトプログラムだけを集めた紹介サイトを、
データ駆動で生成する静的サイトジェネレーターと、新規プログラム追加を自動化する
CLIツールです。npm依存ゼロ(Node.js標準モジュールのみ)で動きます。

## これは何か / 何ではないか

- ✅ 掲載プログラムを `data/programs.json` に追加するだけで、紹介LP・詳細ページが
  自動生成される仕組み
- ✅ 新規プログラム追加〜サイト再生成までを1コマンドで済ませる自動化ツール
- ❌ 収益を保証するものではありません。実際に報酬を得るには、各アフィリエイト
  プログラムへの登録・審査・自身での集客が必要です
- ❌ 実際のアフィリエイトIDはこのリポジトリに含まれていません
  (下記「アフィリエイトIDの設定」を参照)

## セットアップ

```bash
cd affiliate-hub
npm run generate   # data/programs.json から dist/ を生成
npm run serve      # http://localhost:4173 でプレビュー
```

## ディレクトリ構成

```
affiliate-hub/
  data/programs.json     # 掲載プログラムのデータ(唯一の情報源)
  assets/styles.css       # サイト共通スタイル
  scripts/
    lib.js                 # 共通ユーティリティ(データ読み書き・アフィリエイトURL解決)
    generate-site.js        # dist/ を生成する静的サイトジェネレーター
    add-program.js          # 新規プログラムを追加して自動でサイトを再生成するCLI
    serve.js                # dist/ をプレビューするだけのHTTPサーバー
  dist/                    # 生成物(コミット済み。npm run generate で更新)
```

## 新しいアフィリエイトプログラムを追加する(自動化ツール)

対話形式:

```bash
npm run add-program
```

CIやスクリプトから使う場合はフラグ指定:

```bash
node scripts/add-program.js \
  --name "Notion" \
  --category "SaaS・生産性ツール" \
  --rate "月額料金の20%を継続報酬" \
  --cookie-days 30 \
  --url "https://notion.so" \
  --summary "オールインワンのドキュメント・ナレッジベースツール。" \
  --why "チーム全体で長期利用されるため解約率が低い。"
```

実行すると `data/programs.json` に追記され、自動的に `dist/` が再生成されます
(`--no-build` を付けるとサイト再生成をスキップできます)。

## アフィリエイトIDの設定

実際のアフィリエイトリンクを差し込むには、環境変数でIDを渡してから
`npm run generate` を実行します。リポジトリにIDを直接書き込む必要はありません。

```bash
# プログラム単位で指定(推奨): AFFILIATE_ID_<プログラムIDを大文字化・ハイフンはアンダースコアに>
AFFILIATE_ID_SEMRUSH=your-semrush-id \
AFFILIATE_ID_KINSTA=your-kinsta-id \
npm run generate

# もしくは全プログラム共通のIDを使う場合
AFFILIATE_ID=your-common-id npm run generate
```

IDが未設定のプログラムは `?ref=YOUR_AFFILIATE_ID` というプレースホルダー付きの
リンクになり、生成時にコンソールへ警告が出ます。本番公開前に必ず解消してください。

## デプロイ

`dist/` は完全に静的なHTML/CSSなので、Netlify・Vercel・GitHub Pages・S3など
任意の静的ホスティングにそのままアップロードできます。ビルドコマンドは
`npm run generate`、公開ディレクトリは `dist` を指定してください。

### GitHub Pagesで自動公開する(このリポジトリの標準構成)

`.github/workflows/deploy-affiliate-hub.yml` が用意されており、
`affiliate-hub/` 配下を `master` にpushするたびに自動でビルド・公開されます。
有効化するには、リポジトリの管理者が一度だけ以下を行ってください(API経由では
変更できない設定のため、GitHub上での操作が必要です)。

1. GitHubのリポジトリ → **Settings → Pages** を開く
2. **Source** を「**GitHub Actions**」に変更する

これだけで、次のpush(または `Actions` タブから該当ワークフローを
`Run workflow` で手動実行)後に `https://<ユーザー名>.github.io/<リポジトリ名>/`
でサイトが公開されます。

実際のアフィリエイトIDは、リポジトリに直接書かず **Settings → Secrets and
variables → Actions** で `AFFILIATE_ID_SEMRUSH` のようなSecretとして登録して
ください。ワークフローがビルド時にそれらを環境変数として読み込みます。IDを
登録・更新したら、再度pushするかワークフローを再実行すれば反映されます。

## 法令順守について

アフィリエイトリンクを含むページには、景品表示法・特定商取引法・各アフィリエイト
プログラムの規約に従った広告表示・アフィリエイト表記が必要です。本サイトの
フッターには基本的な開示文を入れていますが、実際に公開する際は自身の状況に
合わせて表記内容を必ず見直してください。
