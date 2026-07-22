// ====================================================================
// CORE BACKEND - SYSTEM INTEGRATION IMOMAKEUP (REVISED FULL VERSION)
// FIX: Kolom GAMBAR di sheet PAKET_MAKEUP dibaca dari index yang benar
// ====================================================================

function doGet() {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
      .setTitle('MUA Booking - IMOMAKEUP')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 1. FUNGSI LOGIN DENGAN PEMISAHAN ROLE
function periksaLoginUser(whatsappInput, passwordInput) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetUser = ss.getSheetByName("USER"); 
    if (!sheetUser) return { status: "error", message: "Sheet 'USER' tidak ditemukan!" };
    
    var data = sheetUser.getDataRange().getValues();
    var waClean = String(whatsappInput).trim().replace(/\D/g, ''); 
    
    for (var i = 1; i < data.length; i++) {
      var dbWA = String(data[i][2]).trim().replace(/\D/g, ''); // Kolom C: WHATSAPP
      var dbPass = String(data[i][4]).trim();                  // Kolom E: PASSWORD
      var dbNama = String(data[i][1]).trim();                  // Kolom B: USERNAME/NAMA
      var dbRole = String(data[i][5]).trim().toUpperCase();    // Kolom F: ROLE (ADMIN / CUSTOMER)
      var dbStatus = String(data[i][6]).trim().toUpperCase();  // Kolom G: STATUS
      
      if (dbWA === waClean && dbPass === String(passwordInput).trim()) {
        if (dbStatus === "AKTIF") {
          return { status: "success", nama: dbNama, wa: dbWA, role: dbRole };
        } else {
          return { status: "wrong", message: "Akun Anda sedang dinonaktifkan!" };
        }
      }
    }
    return { status: "wrong", message: "Nomor WhatsApp atau Password salah!" };
  } catch(e) {
    return { status: "error", message: e.toString() };
  }
}

// 2. FUNGSI DAFTAR CUSTOMER BARU
function daftarUserBaru(username, whatsapp, password) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetUser = ss.getSheetByName("USER");
    var data = sheetUser.getDataRange().getValues();
    var waClean = String(whatsapp).trim().replace(/\D/g, '');
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][2]).trim().replace(/\D/g, '') === waClean) {
        return { status: "exists", message: "Nomor WhatsApp ini sudah terdaftar!" };
      }
    }
    
    var idUserBaru = "USR-" + String(data.length).padStart(3, '0');
    sheetUser.appendRow([idUserBaru, username, "'" + waClean, "-", password, "Customer", "Aktif"]);
    return { status: "success", message: "Pendaftaran berhasil! Silakan masuk." };
  } catch(e) {
    return { status: "error", message: e.toString() };
  }
}

// 3. FUNGSI AMBIL DAFTAR PAKET DARI SPREADSHEET (DINAMIS KE HALAMAN CUSTOMER)
// STRUKTUR KOLOM SHEET "PAKET_MAKEUP":
// A: ID_PAKET | B: NAMA_PAKET | C: harga | D: DESKRIPSI | E: STATUS_AKTIF | F: GAMBAR
function ambilSemuaPaketMUA() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetPaket = ss.getSheetByName("PAKET_MAKEUP");
    if (!sheetPaket) return [];
    
    var data = sheetPaket.getDataRange().getValues();
    var listPaket = [];
    
    for (var i = 1; i < data.length; i++) {
      if (!data[i][1]) continue; // Skip jika nama paket kosong

      // Ambil status aktif (Kolom E, index 4) - hanya tampilkan paket yang statusnya "Aktif"
      var statusAktif = String(data[i][4] || "").trim().toLowerCase();
      if (statusAktif && statusAktif !== "aktif") continue; // Skip paket yang non-aktif

      // Ambil link gambar (Kolom F, index 5) - FIXED dari sebelumnya salah baca index 4
      var linkGambar = String(data[i][5] || "").trim();
      if (!linkGambar) {
        linkGambar = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80";
      }

      listPaket.push({
        id: data[i][0], // Kolom A
        nama: data[i][1], // Kolom B
        harga: Number(data[i][2]) || 0, // Kolom C
        hargaFormatted: "Rp " + (Number(data[i][2]) || 0).toLocaleString('id-ID'),
        detail: data[i][3] || "Layanan makeup premium", // Kolom D
        gambar: linkGambar // Kolom F (GAMBAR) - FIXED
      });
    }
    return listPaket;
  } catch(e) {
    Logger.log("Error di ambilSemuaPaketMUA: " + e.toString());
    return [];
  }
}

// 4. FUNGSI PROSES SIMPAN BOOKING CUSTOMER (FIX MAPPING KOLOM A - L SESUAI GAMBAR SPREADSHEET)
function simpanBookingCustomer(nama, wa, paket, tanggal, jam, catatan) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetBooking = ss.getSheetByName("BOOKING");
    var data = sheetBooking.getDataRange().getValues();
    
    var today = new Date();
    var dateString = Utilities.formatDate(today, "GMT+7", "yyyyMMdd");
    var countToday = 1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).includes("MUA-" + dateString)) {
        countToday++;
      }
    }
    var idBooking = "MUA-" + dateString + "-" + String(countToday).padStart(3, '0');
    
    // Ambil ID Paket dan Harga Paket otomatis dari sheet PAKET_MAKEUP
    var sheetPaket = ss.getSheetByName("PAKET_MAKEUP");
    var dataPaket = sheetPaket.getDataRange().getValues();
    var idPaket = "PKT-GEN"; 
    var hargaPaket = 0;
    
    for (var j = 1; j < dataPaket.length; j++) {
      if (String(dataPaket[j][1]).toLowerCase() === String(paket).toLowerCase()) {
        idPaket = dataPaket[j][0];   // Kolom A di PAKET_MAKEUP
        hargaPaket = dataPaket[j][2]; // Kolom C di PAKET_MAKEUP
        break;
      }
    }
    
    var tglFormated = formatTanggalAman(new Date(tanggal));
    var dibuatWaktu = Utilities.formatDate(today, "GMT+7", "dd MMMM yyyy - HH:mm");
    
    // PENYESUAIAN STRUKTUR KOLOM RIGID (A - L):
    // A: ID_BOOKING, B: ID_CUSTOMER, C: NAMA_CUSTOMER, D: NO_WA, E: ID_PAKET, F: NAMA_PAKET
    // G: TANGGAL_ACARA, H: JAM_ACARA, I: CATATAN, J: TOTAL_HARGA, K: STATUS_PEMESANAN, L: WAKTU_INPUT
    sheetBooking.appendRow([
      idBooking, 
      nama.toLowerCase().replace(/\s+/g, '') + "1", // B: ID_CUSTOMER (contoh format: silvia1)
      nama,                                         // C: NAMA_CUSTOMER
      "'" + wa,                                     // D: NO_WA
      idPaket,                                      // E: ID_PAKET
      paket,                                        // F: NAMA_PAKET
      tglFormated,                                  // G: TANGGAL_ACARA
      jam,                                          // H: JAM_ACARA
      catatan || "-",                               // I: CATATAN
      hargaPaket,                                   // J: TOTAL_HARGA
      "Pending",                                    // K: STATUS_PEMESANAN
      dibuatWaktu                                   // L: WAKTU_INPUT
    ]);
    
    return { status: "success", id: idBooking, nama: nama, tanggal: tglFormated, jam: jam, paket: paket };
  } catch(e) {
    return { status: "error", message: e.toString() };
  }
}

// 5. FUNGSI CEK STATUS BOOKING DARI HALAMAN CUSTOMER (MENGIKUTI STRUKTUR BARU)
function periksaStatusBooking(idAtauWA) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetBooking = ss.getSheetByName("BOOKING");
    var data = sheetBooking.getDataRange().getValues();
    var query = String(idAtauWA).trim().toLowerCase();
    
    for (var i = data.length - 1; i >= 1; i--) { 
      var dbID = String(data[i][0]).toLowerCase();      // Kolom A: ID_BOOKING
      var dbWA = String(data[i][3]).replace(/\D/g, ''); // Kolom D: NO_WA
      
      if (dbID === query || dbWA === query) {
        return {
          status: "success", found: true,
          id: data[i][0], 
          nama: data[i][2],                       // Kolom C: NAMA_CUSTOMER
          wa: data[i][3],                         // Kolom D: NO_WA
          paket: data[i][5],                      // Kolom F: NAMA_PAKET
          tanggal: formatTanggalAman(data[i][6]), // Kolom G: TANGGAL_ACARA
          jam: formatJamAman(data[i][7]),         // Kolom H: JAM_ACARA
          catatan: data[i][8] || "-",             // Kolom I: CATATAN
          harga: "Rp " + (Number(data[i][9]) || 0).toLocaleString('id-ID'), // Kolom J: TOTAL_HARGA
          statusBooking: data[i][10] || "Pending", // Kolom K: STATUS_PEMESANAN
          dibuat: data[i][11] || "-"               // Kolom L: WAKTU_INPUT
        };
      }
    }
    return { status: "success", found: false, message: "Data booking tidak ditemukan!" };
  } catch(e) {
    return { status: "error", message: e.toString() };
  }
}

// 6. DASHBOARD STATS RINGKASAN UTAMA ADMIN
function getDashboardStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = ss.getSheetByName("BOOKING").getDataRange().getValues();
  var total = 0, pending = 0, confirmed = 0, cancelled = 0;
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue; total++;
    var st = String(data[i][10]).toLowerCase(); // Membaca Kolom K: STATUS_PEMESANAN
    if (st === "confirm" || st === "confirmed") confirmed++;
    else if (st === "cancel" || st === "cancelled") cancelled++;
    else pending++;
  }
  return { total: total, pending: pending, confirmed: confirmed, cancelled: cancelled };
}

// 7. DAFTAR SEMUA BOOKING UNTUK TABEL ADMIN
function getAllBookingsAdmin() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("BOOKING");
    if (!sheet) return [];
    
    var data = sheet.getDataRange().getValues();
    var list = [];
    
    // Looping dimulai dari indeks 1 (baris ke-2) untuk melewati header
    for (var i = 1; i < data.length; i++) {
      // Cek apakah kolom NAMA_CUSTOMER (Indeks 2 / Kolom C) kosong. 
      // Jika Kolom C kosong, baru kita skip baris tersebut.
      if (!data[i][2] || String(data[i][2]).trim() === "") {
        continue;
      }
      
      list.push({ 
        id: data[i][0] ? String(data[i][0]).trim() : "-",                     // Kolom A: ID_BOOKING
        nama: data[i][2] ? String(data[i][2]).trim() : "-",                   // Kolom C: NAMA_CUSTOMER
        wa: data[i][3] ? String(data[i][3]).trim() : "-",                     // Kolom D: NO_WA
        paket: data[i][5] ? String(data[i][5]).trim() : "-",                  // Kolom F: NAMA_PAKET
        tanggal: formatTanggalAman(data[i][6]),                              // Kolom G: TANGGAL_ACARA
        jam: formatJamAman(data[i][7]),                                      // Kolom H: JAM_ACARA
        harga: "Rp " + (Number(data[i][9]) || 0).toLocaleString('id-ID'),    // Kolom J: TOTAL_HARGA
        status: data[i][10] ? String(data[i][10]).trim() : "Pending"         // Kolom K: STATUS_PEMESANAN
      });
    }
    
    // Membalikkan urutan agar data booking terbaru muncul paling atas di dashboard
    return list.reverse();
    
  } catch(e) {
    Logger.log("Error di getAllBookingsAdmin: " + e.toString());
    return [];
  }
}

// 8. FUNGSI PERSETUJUAN ADMIN + DAFTAR DATA UNTUK TRIGGER KIRIM CHAT WHATSAPP
function setujuiBookingDariAdmin(idBooking) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(); 
  var sheet = ss.getSheetByName("BOOKING"); 
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(idBooking)) { 
      sheet.getRange(i + 1, 11).setValue("Confirm"); // Set nilai "Confirm" tepat pada Kolom K (Kolom ke-11)
      return { 
        status: "success", 
        id: data[i][0], 
        nama: data[i][2], // Kolom C
        wa: data[i][3],   // Kolom D
        paket: data[i][5], // Kolom F
        tanggal: formatTanggalAman(data[i][6]), // Kolom G
        jam: formatJamAman(data[i][7])          // Kolom H
      }; 
    }
  }
  return { status: "error", message: "ID tidak ditemukan" };
}

// --- UTILITY FORMAT DATE & TIME AMAN ---
function formatTanggalAman(tgl) { 
  if (tgl instanceof Date) return Utilities.formatDate(tgl, "GMT+7", "dd MMMM yyyy");
  return String(tgl).split(" ")[0];
}
function formatJamAman(j) {
  if (j instanceof Date) return Utilities.formatDate(j, "GMT+7", "HH:mm");
  var m = String(j).match(/(\d{2}:\d{2})/); return m ? m[1] : String(j);
}
