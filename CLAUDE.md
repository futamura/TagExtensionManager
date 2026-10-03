# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Tag Extension Manager — Chrome 拡張 (Manifest V3)。他の Chrome 拡張をタグでグループ化して管理する。TypeScript + React 18 + Tailwind CSS、webpack でバンドル、パッケージ管理は pnpm。

## コマンド

```bash
pnpm install          # 依存関係のインストール (pnpm 必須 — npm/yarn は使用しない)
pnpm dev              # 開発ビルド (watch) → dist/dev (chrome://extensions から「パッケージ化されていない拡張機能を読み込む」)
pnpm build            # 本番ビルド → dist/prod
pnpm type-check       # tsc --noEmit
pnpm eslint-check     # lint (自動修正は pnpm eslint-fix)
pnpm prettier-check   # フォーマットチェック (自動修正は pnpm prettier-fix)
```

テストスイートは存在しない。検証 = `type-check` + `eslint-check` + `prettier-check` + `build`。

Fastlane (`bundle exec fastlane <lane>`) がリリース作業をラップする。各 lane は `develop` ブランチでの実行を強制する。`release` lane はフルパイプラインを実行する: バージョンアップ、品質チェック、ビルド、zip パッケージング、git タグ、`develop` → `main` マージ。`v*.*.*` タグの push で `.github/workflows/release.yml` が起動し、ビルド → GitHub Release 作成 → Chrome Web Store アップロードを行う。

リリース時の注意点:

- `release` lane は対話式 (バージョン種別の選択、確認プロンプト複数) のため、非対話環境では実行できない。
- CI の Chrome Web Store アップロード step (`.github/scripts/chrome-webstore.sh publish`、API v2) は `continue-on-error: true` だが、失敗すると後続の結果確認 step が `exit 1` して workflow が失敗する。成功時は審査に提出された状態 (`PENDING_REVIEW`) で、審査を通過すると自動で公開される。公開されたかは、ストアページの Version か Chrome Web Store Check workflow の `Published` 行で確認する。

`package.json` と `manifest.json` のバージョンは常に同期させること (fastlane `bump_version` が両方を更新する)。

## アーキテクチャ

webpack のエントリーポイントは 3 つ (`webpack.config.ts` で定義、パスエイリアス `@/` → `src/`):

- `src/pages/Options.tsx` — UI 全体。オプションページとサイドパネルの両方として使われる (`manifest.json` が両方とも `options.html` を指す)。`ExtensionProvider` 内に `ExtensionMain` をマウントする。
- `src/pages/ServiceWorker.ts` — MV3 バックグラウンド service worker。offscreen document の生成、runtime メッセージ処理 (カラースキーム変更、PING keep-alive)、テーマに応じたツールバーアイコン更新を担う。
- `src/pages/Offscreen.ts` — offscreen document。`matchMedia` によるシステムカラースキーム検知専用 (service worker では検知不可)。結果を service worker にメッセージで送る。

データフロー層:

- `src/api/ChromeAPI.ts` — すべての `chrome.*` API (management, storage, offscreen, runtime) の単一ラッパー。他の場所から `chrome.*` を直接呼ばないこと。
- `src/stores/` — Zustand ストア (`TagStore`: タグ + タグ↔拡張のマップ、`ExtensionStore`: 拡張の状態)。`persist` middleware + カスタムアダプターで `chromeAPI` 経由の `chrome.storage.local` に永続化する。ストレージキーは `src/constants/storage.ts`。
- `src/mappers/` — `chrome.management.ExtensionInfo` を内部モデル (`src/models/`) に変換。
- `src/contexts/` — ストアをコンポーネントツリーに接続する React コンテキスト。
- `src/features/options/components/` — UI は `main/` (拡張リスト)、`selector/` (タグセレクター)、`editor/` (タグエディター) に分割。共有プリミティブ (ボタン、ダイアログ、検索バー) は `src/components/`。

## ルール (.cursor/rules/global.mdc より — 遵守すること)

- パッケージ管理は pnpm を使用する。
- ソースコードのコメントは英語で書く。単一行でも行コメントではなくブロックコメント (`/** */`) を使用する。
- 依存関係やツールのバージョンを事前承認なしに変更しない。
- UI/UX デザイン (レイアウト、色、フォント、間隔) を、理由の提示と承認なしに変更しない。
- 明示的に指示された範囲を超えた変更をしない。必要と考える場合はまず提案し、承認後に実装する。
- ファイル配置は `DIRECTORYSTRUCTURE.md` に従う。

## コミットゲート

コミット前に以下をすべて通過させること。失敗が残る状態でコミットしない。

- `pnpm type-check`
- `pnpm eslint-check`
- `pnpm prettier-check`

ソースコード (`src/`、`webpack.config.ts` 等) に触れた場合は `pnpm build` の成功も確認する。ドキュメントのみの変更ならチェック不要。

## ブランチ

- `main` = 本番、`develop` = 開発。どちらのブランチ上でも直接作業しない。
- 作業時は `develop` から Conventional Branch 準拠のブランチを切る。機能開発: `feature/<name>`、バグ修正: `fix/<description>`。
- 作業完了後、作業ブランチを `develop` にマージする。
- `develop` → `main` はリリースフロー (fastlane `release` lane / `merge_to_main`) 経由のみ。直接マージしない。
