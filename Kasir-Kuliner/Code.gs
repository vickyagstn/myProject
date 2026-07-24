function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Warung Lontong Opor - Kasir')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Fungsi helper untuk mengambil data dari Google Sheets berdasarkan nama Sheet
function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Jika sheet kosong / hanya ada header
  
  const headers = data.shift();
  return data.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      // Pastikan nama properti objek mengikuti huruf kecil agar sinkron dengan javascript
      let cleanHeader = String(header).trim().toLowerCase();
      obj[cleanHeader] = row[index];
    });
    return obj;
  });
}

// 1. FUNGSI AMBIL PRODUK
function getProduk() {
  return getSheetData('produk');
}

// 2. FUNGSI SIMPAN TRANSAKSI
function simpanTransaksi(payload) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetTx = ss.getSheetByName('transaksi');
    const sheetDetail = ss.getSheetByName('detail_transaksi');
    
    // Generate ID Transaksi unik menggunakan timestamp mikro
    const txId = "TRX-" + new Date().getTime(); 
    const tglSkg = new Date();
    // Format tanggal standar teks: dd/MM/yyyy HH:mm
    const tglFormatted = Utilities.formatDate(tglSkg, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");

    // Simpan data ke sheet 'transaksi'
    sheetTx.appendRow([txId, tglFormatted, payload.total, payload.metode]);
    
    // Simpan data ke sheet 'detail_transaksi'
    payload.items.forEach(item => {
      sheetDetail.appendRow([txId, item.nama_produk, item.qty, item.subtotal]);
    });
    
    return { success: true, id_transaksi: txId, tanggal: tglFormatted };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// 3. FUNGSI AMBIL RIWAYAT TRANSAKSI (Dipakai untuk tabel kasir & statistik)
function getRiwayatTransaksi() {
  return getSheetData('transaksi');
}

// 4. FUNGSI AMBIL DETAIL TRANSAKSI
function getDetailTransaksi() {
  return getSheetData('detail_transaksi');
}