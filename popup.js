// グローバル変数
let currentQRCode = null;

// DOM要素
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const urlInput = document.getElementById('url-input');
const qrCanvas = document.getElementById('qr-canvas');
const downloadBtn = document.getElementById('download-btn');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const selectFileBtn = document.getElementById('select-file-btn');
const scanCanvas = document.getElementById('scan-canvas');
const resultSection = document.getElementById('result-section');
const resultText = document.getElementById('result-text');
const copyBtn = document.getElementById('copy-btn');
const resetBtn = document.getElementById('reset-btn');

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
  // 現在のタブのURLを取得
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      urlInput.value = tab.url;
      generateQRCode(tab.url);
    }
  } catch (error) {
    console.error('URLの取得に失敗しました:', error);
    urlInput.value = 'https://example.com';
    generateQRCode('https://example.com');
  }

  // イベントリスナーの設定
  setupEventListeners();
});

// イベントリスナーの設定
function setupEventListeners() {
  // タブ切り替え
  tabButtons.forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });

  // QRコード生成タブ
  urlInput.addEventListener('input', (e) => {
    generateQRCode(e.target.value);
  });

  downloadBtn.addEventListener('click', downloadQRCode);

  // QRコード読取タブ
  selectFileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);

  // ドラッグ&ドロップ
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);

  // クリップボード貼り付け
  document.addEventListener('paste', handlePaste);

  // 結果のコピーとリセット
  copyBtn.addEventListener('click', copyResult);
  resetBtn.addEventListener('click', resetScan);
}

// タブ切り替え
function switchTab(tabName) {
  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  tabContents.forEach(content => {
    const isActive = content.id === `${tabName}-tab`;
    content.classList.toggle('active', isActive);
  });
}

// QRコード生成
function generateQRCode(text) {
  if (!text || text.trim() === '') {
    text = 'QR-Link Pro';
  }

  try {
    // qrcode-generator ライブラリを使用
    if (typeof qrcode !== 'undefined') {
      // QRコードオブジェクトを作成
      // qrcode(typeNumber, errorCorrectionLevel)
      // typeNumber: 0 = 自動
      // errorCorrectionLevel: 'L', 'M', 'Q', 'H'
      const qr = qrcode(0, 'M');
      qr.addData(text);
      qr.make();

      // キャンバスのサイズを設定
      const cellSize = 4;
      const margin = 8;
      const size = qr.getModuleCount();
      const canvasSize = size * cellSize + margin * 2;

      qrCanvas.width = canvasSize;
      qrCanvas.height = canvasSize;

      // キャンバスに描画
      const ctx = qrCanvas.getContext('2d');

      // 背景（白）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // QRコード（黒）
      ctx.fillStyle = '#000000';
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (qr.isDark(row, col)) {
            ctx.fillRect(
              col * cellSize + margin,
              row * cellSize + margin,
              cellSize,
              cellSize
            );
          }
        }
      }

      currentQRCode = qr;
    } else {
      console.error('qrcode-generator ライブラリが読み込まれていません');
    }
  } catch (error) {
    console.error('QRコード生成エラー:', error);
  }
}

// QRコードのダウンロード
function downloadQRCode() {
  try {
    const url = qrCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${Date.now()}.png`;
    a.click();
  } catch (error) {
    console.error('ダウンロードに失敗しました:', error);
  }
}

// ファイル選択
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    processImage(file);
  }
}

// ドラッグオーバー
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('drag-over');
}

// ドラッグリーブ
function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
}

// ドロップ
function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');

  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type.startsWith('image/')) {
    processImage(files[0]);
  }
}

// クリップボード貼り付け
function handlePaste(e) {
  // スキャンタブがアクティブな場合のみ処理
  const scanTab = document.getElementById('scan-tab');
  if (!scanTab.classList.contains('active')) return;

  const items = e.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) {
      const file = items[i].getAsFile();
      processImage(file);
      e.preventDefault();
      break;
    }
  }
}

// 画像処理
function processImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // キャンバスに画像を描画
      const ctx = scanCanvas.getContext('2d');
      scanCanvas.width = img.width;
      scanCanvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // QRコードをデコード
      decodeQRCode(ctx, img.width, img.height);

      // キャンバスを表示
      scanCanvas.style.display = 'block';
      dropZone.querySelector('.drop-zone-content').style.display = 'none';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// QRコードデコード
function decodeQRCode(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);

  if (typeof jsQR !== 'undefined') {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      // 成功
      showResult(code.data);
    } else {
      // QRコードが見つからない
      showResult('QRコードを検出できませんでした。');
    }
  } else {
    showResult('QRコードリーダーが読み込まれていません。');
  }
}

// 結果表示
function showResult(text) {
  resultText.value = text;
  resultSection.style.display = 'flex';
}

// 結果をクリップボードにコピー
function copyResult() {
  resultText.select();
  document.execCommand('copy');

  // ボタンのテキストを一時的に変更
  const originalText = copyBtn.textContent;
  copyBtn.textContent = 'コピーしました！';
  setTimeout(() => {
    copyBtn.textContent = originalText;
  }, 2000);
}

// スキャンをリセット
function resetScan() {
  scanCanvas.style.display = 'none';
  scanCanvas.getContext('2d').clearRect(0, 0, scanCanvas.width, scanCanvas.height);
  dropZone.querySelector('.drop-zone-content').style.display = 'flex';
  resultSection.style.display = 'none';
  resultText.value = '';
  fileInput.value = '';
}
