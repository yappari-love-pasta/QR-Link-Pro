# QR-Link Pro (Local Edition)

ブラウザ上で現在開いているページのURLを即座にQRコード化、または手元のQRコード画像をデコードするためのローカル完結型Chrome拡張機能。

## 機能

### タブ1: QRコード生成 (Generate)
- URL自動取得: 拡張機能起動時、現在アクティブなタブのURLを自動的に読み取る
- QRコード表示: 取得したURLを元に、中央にQRコードを生成・表示
- リアルタイム編集: テキストボックス内の文字列を変更すると、即座にQRコードの描画が更新される
- ダウンロード: 生成したQRコードを画像ファイルとしてダウンロード可能

### タブ2: QRコード読取 (Scan)
- 画像インポート: クリップボードからの貼り付け（Ctrl+V）、ドラッグ＆ドロップ、ファイル選択に対応
- デコード処理: 画像を解析し、埋め込まれているテキスト/URLを抽出
- 結果表示: 読み取り結果をテキストボックスに表示
- クリップボードコピー: 結果をワンクリックでクリップボードにコピー可能

## インストール方法

### 1. 使用ライブラリ（インストール済）

1. **qrcode.js**:
   - URL: https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js
   - 保存先: `lib/qrcode.min.js`

2. **jsQR.js**:
   - URL: https://unpkg.com/jsqr@1.4.0/dist/jsQR.js
   - 保存先: `lib/jsQR.js`

### 2. Chrome拡張機能として読み込む

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このプロジェクトのフォルダを選択

## 使い方

### QRコード生成
1. ツールバーのアイコンをクリックして拡張機能を開く
2. 「生成」タブで、自動的に現在のページのURLがQRコード化される
3. テキストボックスで内容を編集すると、リアルタイムでQRコードが更新される
4. 「ダウンロード」ボタンでQRコード画像を保存可能

### QRコード読取
1. 「読取」タブに切り替える
2. 以下の方法でQRコード画像を読み込む:
   - ドラッグ＆ドロップ
   - Ctrl+Vで貼り付け
   - 「ファイルを選択」ボタンでファイル選択
3. 読み取り結果が自動的に表示される
4. 「クリップボードにコピー」ボタンで結果をコピー可能

## 技術スタック

- **拡張機能**: Manifest V3
- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **QR生成**: qrcode.js (https://github.com/soldair/node-qrcode)
- **QR読取**: jsQR (https://github.com/cozmo/jsQR)

## プライバシー

- すべての処理（生成・解析）はブラウザ内（クライアントサイド）で行われます
- 外部サーバーへのデータ送信は一切行いません
- 必要な権限は`activeTab`のみ（現在のタブURLの取得のため）

## ファイル構成

```
qrcode-creator/
├── manifest.json      # 拡張機能の設定ファイル
├── popup.html         # メインUI（HTML）
├── popup.css          # スタイル（CSS）
├── popup.js           # メインロジック（JS）
├── lib/               # 外部ライブラリ
│   ├── qrcode.min.js  # 生成用
│   └── jsQR.js        # 読取用
├── icons/             # アイコン画像
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # このファイル
```

## ライセンス

MIT License

## 作成者

QR-Link Pro Development Team
