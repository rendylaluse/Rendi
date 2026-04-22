// ============================================================
// 🧺 SISTEM INFORMASI LAUNDRY — BACKEND (Google Apps Script)
// ============================================================
// Database: Google Sheets (Active Spreadsheet)
// API: Web App (doGet / doPost)
// ============================================================

// ======================== CONSTANTS ========================
const SHEET_PELANGGAN = 'Pelanggan';
const SHEET_LAYANAN = 'Layanan';
const SHEET_TRANSAKSI = 'Transaksi';
const SHEET_PENGATURAN = 'Pengaturan';

const STATUS_LIST = ['Antrian', 'Proses', 'Selesai', 'Diambil'];

// ======================== ENTRY POINTS ========================

/**
 * Handle GET requests
 */
function doGet(e) {
  const action = e.parameter.action;
  let result;

  try {
    switch (action) {
      case 'getPelanggan':
        result = getAllPelanggan();
        break;
      case 'getTransaksi':
        result = getAllTransaksi();
        break;
      case 'getLayanan':
        result = getAllLayanan();
        break;
      case 'cekStatus':
        result = cekStatusByNoHp(e.parameter.no_hp);
        break;
      case 'getTransaksiById':
        result = getTransaksiById(e.parameter.id);
        break;
      case 'getDashboard':
        result = getDashboardData();
        break;
      case 'getPengaturan':
        result = getPengaturan();
        break;
      case 'initSheets':
        result = initializeSheets();
        break;
      default:
        result = { success: false, message: 'Action tidak dikenali: ' + action };
    }
  } catch (error) {
    result = { success: false, message: error.toString() };
  }

  return createJsonResponse(result);
}

/**
 * Handle POST requests
 */
function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return createJsonResponse({ success: false, message: 'Invalid JSON data' });
  }

  const action = data.action;
  let result;

  try {
    switch (action) {
      case 'tambahPelanggan':
        result = addPelanggan(data);
        break;
      case 'tambahTransaksi':
        result = addTransaksi(data);
        break;
      case 'updateStatus':
        result = updateStatusTransaksi(data.id_transaksi, data.status);
        break;
      case 'tambahLayanan':
        result = addLayanan(data);
        break;
      case 'hapusTransaksi':
        result = deleteTransaksi(data.id_transaksi);
        break;
      case 'hapusPelanggan':
        result = deletePelanggan(data.id_pelanggan);
        break;
      case 'updatePelanggan':
        result = updatePelanggan(data);
        break;
      case 'updateLayanan':
        result = updateLayanan(data);
        break;
      case 'hapusLayanan':
        result = deleteLayanan(data.id_layanan);
        break;
      case 'updatePengaturan':
        result = updatePengaturanData(data.key, data.value);
        break;
      default:
        result = { success: false, message: 'Action tidak dikenali: ' + action };
    }
  } catch (error) {
    result = { success: false, message: error.toString() };
  }

  return createJsonResponse(result);
}

// ======================== DATABASE HELPERS ========================

/**
 * Get a sheet by name from active spreadsheet
 */
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name);
}

/**
 * Get all data from a sheet as array of objects
 */
function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      let value = data[i][j];
      // Format date values
      if (value instanceof Date) {
        value = Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
      }
      row[headers[j]] = value;
    }
    rows.push(row);
  }

  return rows;
}

/**
 * Add a row to a sheet
 */
function addRowToSheet(sheetName, rowData) {
  const sheet = getSheet(sheetName);
  if (!sheet) throw new Error('Sheet ' + sheetName + ' tidak ditemukan');

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => rowData[header] || '');
  sheet.appendRow(row);
}

/**
 * Find row index by column value
 */
function findRowIndex(sheetName, columnName, value) {
  const sheet = getSheet(sheetName);
  if (!sheet) return -1;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const colIndex = headers.indexOf(columnName);

  if (colIndex === -1) return -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][colIndex] == value) {
      return i + 1; // 1-indexed for sheet
    }
  }
  return -1;
}

/**
 * Update a cell value
 */
function updateCell(sheetName, rowIndex, columnName, value) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colIndex = headers.indexOf(columnName);
  if (colIndex === -1) throw new Error('Kolom ' + columnName + ' tidak ditemukan');
  sheet.getRange(rowIndex, colIndex + 1).setValue(value);
}

/**
 * Delete a row by index
 */
function deleteRow(sheetName, rowIndex) {
  const sheet = getSheet(sheetName);
  sheet.deleteRow(rowIndex);
}

// ======================== UTILITY ========================

/**
 * Generate unique ID
 */
function generateId() {
  return Utilities.getUuid().substring(0, 8).toUpperCase();
}

/**
 * Get current timestamp formatted
 */
function getNow() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Create JSON response with CORS headers
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ======================== INITIALIZE SHEETS ========================

/**
 * Initialize all sheets with headers if they don't exist
 */
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Pelanggan
  let sheet = ss.getSheetByName(SHEET_PELANGGAN);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PELANGGAN);
    sheet.appendRow(['id_pelanggan', 'nama', 'no_hp', 'alamat', 'created_at']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  }

  // Layanan
  sheet = ss.getSheetByName(SHEET_LAYANAN);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_LAYANAN);
    sheet.appendRow(['id_layanan', 'nama_layanan', 'harga_per_kg', 'estimasi_hari']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    // Default services
    sheet.appendRow([generateId(), 'Cuci Kering', 7000, 2]);
    sheet.appendRow([generateId(), 'Cuci Setrika', 10000, 3]);
    sheet.appendRow([generateId(), 'Setrika Saja', 5000, 1]);
    sheet.appendRow([generateId(), 'Express', 15000, 1]);
  }

  // Transaksi
  sheet = ss.getSheetByName(SHEET_TRANSAKSI);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_TRANSAKSI);
    sheet.appendRow([
      'id_transaksi', 'id_pelanggan', 'nama_pelanggan', 'no_hp',
      'id_layanan', 'nama_layanan', 'berat_kg', 'harga_per_kg',
      'total_harga', 'status', 'catatan',
      'tanggal_masuk', 'tanggal_selesai', 'tanggal_diambil'
    ]);
    sheet.getRange(1, 1, 1, 14).setFontWeight('bold');
  }

  // Pengaturan
  sheet = ss.getSheetByName(SHEET_PENGATURAN);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PENGATURAN);
    sheet.appendRow(['key', 'value']);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
    sheet.appendRow(['nama_toko', 'Fresh Laundry']);
    sheet.appendRow(['alamat_toko', 'Jl. Contoh No. 123']);
    sheet.appendRow(['no_telp', '08123456789']);
    sheet.appendRow(['jam_buka', '08:00 - 21:00']);
  }

  return { success: true, message: 'Semua sheet berhasil diinisialisasi' };
}

// ======================== PELANGGAN CRUD ========================

function getAllPelanggan() {
  const data = getSheetData(SHEET_PELANGGAN);
  return { success: true, data: data };
}

function addPelanggan(data) {
  const id = generateId();
  const pelanggan = {
    id_pelanggan: id,
    nama: data.nama,
    no_hp: data.no_hp,
    alamat: data.alamat || '',
    created_at: getNow()
  };

  addRowToSheet(SHEET_PELANGGAN, pelanggan);
  return { success: true, message: 'Pelanggan berhasil ditambahkan', data: pelanggan };
}

function updatePelanggan(data) {
  const rowIndex = findRowIndex(SHEET_PELANGGAN, 'id_pelanggan', data.id_pelanggan);
  if (rowIndex === -1) return { success: false, message: 'Pelanggan tidak ditemukan' };

  if (data.nama) updateCell(SHEET_PELANGGAN, rowIndex, 'nama', data.nama);
  if (data.no_hp) updateCell(SHEET_PELANGGAN, rowIndex, 'no_hp', data.no_hp);
  if (data.alamat !== undefined) updateCell(SHEET_PELANGGAN, rowIndex, 'alamat', data.alamat);

  return { success: true, message: 'Pelanggan berhasil diupdate' };
}

function deletePelanggan(id) {
  const rowIndex = findRowIndex(SHEET_PELANGGAN, 'id_pelanggan', id);
  if (rowIndex === -1) return { success: false, message: 'Pelanggan tidak ditemukan' };

  deleteRow(SHEET_PELANGGAN, rowIndex);
  return { success: true, message: 'Pelanggan berhasil dihapus' };
}

// ======================== LAYANAN CRUD ========================

function getAllLayanan() {
  const data = getSheetData(SHEET_LAYANAN);
  return { success: true, data: data };
}

function addLayanan(data) {
  const id = generateId();
  const layanan = {
    id_layanan: id,
    nama_layanan: data.nama_layanan,
    harga_per_kg: Number(data.harga_per_kg),
    estimasi_hari: data.estimasi_hari || ''
  };

  addRowToSheet(SHEET_LAYANAN, layanan);
  return { success: true, message: 'Layanan berhasil ditambahkan', data: layanan };
}

function updateLayanan(data) {
  const rowIndex = findRowIndex(SHEET_LAYANAN, 'id_layanan', data.id_layanan);
  if (rowIndex === -1) return { success: false, message: 'Layanan tidak ditemukan' };

  if (data.nama_layanan) updateCell(SHEET_LAYANAN, rowIndex, 'nama_layanan', data.nama_layanan);
  if (data.harga_per_kg) updateCell(SHEET_LAYANAN, rowIndex, 'harga_per_kg', Number(data.harga_per_kg));
  if (data.estimasi_hari !== undefined) updateCell(SHEET_LAYANAN, rowIndex, 'estimasi_hari', data.estimasi_hari);

  return { success: true, message: 'Layanan berhasil diupdate' };
}

function deleteLayanan(id) {
  const rowIndex = findRowIndex(SHEET_LAYANAN, 'id_layanan', id);
  if (rowIndex === -1) return { success: false, message: 'Layanan tidak ditemukan' };

  deleteRow(SHEET_LAYANAN, rowIndex);
  return { success: true, message: 'Layanan berhasil dihapus' };
}

// ======================== TRANSAKSI CRUD ========================

function enrichTransaksi(transaksiArray) {
  const pelangganList = getSheetData(SHEET_PELANGGAN);
  const layananList = getSheetData(SHEET_LAYANAN);
  
  return transaksiArray.map(t => {
    if (!t.nama_pelanggan) {
      const p = pelangganList.find(x => x.id_pelanggan === t.id_pelanggan);
      if (p) {
        t.nama_pelanggan = p.nama;
        t.no_hp = p.no_hp;
      }
    }
    if (!t.nama_layanan) {
      const l = layananList.find(x => x.id_layanan === t.id_layanan);
      if (l) {
        t.nama_layanan = l.nama_layanan;
      }
    }
    return t;
  });
}

function getAllTransaksi() {
  const data = enrichTransaksi(getSheetData(SHEET_TRANSAKSI));
  return { success: true, data: data };
}

function getTransaksiById(id) {
  const allData = enrichTransaksi(getSheetData(SHEET_TRANSAKSI));
  const found = allData.find(row => row.id_transaksi === id);

  if (!found) return { success: false, message: 'Transaksi tidak ditemukan' };
  return { success: true, data: found };
}

function addTransaksi(data) {
  // Lookup pelanggan
  const pelangganList = getSheetData(SHEET_PELANGGAN);
  const pelanggan = pelangganList.find(p => p.id_pelanggan === data.id_pelanggan);
  if (!pelanggan) return { success: false, message: 'Pelanggan tidak ditemukan' };

  // Lookup layanan
  const layananList = getSheetData(SHEET_LAYANAN);
  const layanan = layananList.find(l => l.id_layanan === data.id_layanan);
  if (!layanan) return { success: false, message: 'Layanan tidak ditemukan' };

  const berat = Number(data.berat_kg);
  const totalHarga = berat * Number(layanan.harga_per_kg);

  // Calculate estimated completion date
  const now = new Date();
  const estimasiSelesai = new Date(now);
  const estimasiHari = parseInt(layanan.estimasi_hari);
  estimasiSelesai.setDate(estimasiSelesai.getDate() + (isNaN(estimasiHari) ? 3 : estimasiHari));

  const id = generateId();
  const transaksi = {
    id_transaksi: id,
    id_pelanggan: pelanggan.id_pelanggan,
    nama_pelanggan: pelanggan.nama,
    no_hp: pelanggan.no_hp,
    id_layanan: layanan.id_layanan,
    nama_layanan: layanan.nama_layanan,
    berat_kg: berat,
    harga_per_kg: Number(layanan.harga_per_kg),
    total_harga: totalHarga,
    status: 'Antrian',
    catatan: data.catatan || '',
    tanggal_masuk: getNow(),
    tanggal_selesai: Utilities.formatDate(estimasiSelesai, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
    tanggal_diambil: ''
  };

  addRowToSheet(SHEET_TRANSAKSI, transaksi);
  return { success: true, message: 'Transaksi berhasil ditambahkan', data: transaksi };
}

function updateStatusTransaksi(id, newStatus) {
  if (!STATUS_LIST.includes(newStatus)) {
    return { success: false, message: 'Status tidak valid. Gunakan: ' + STATUS_LIST.join(', ') };
  }

  const rowIndex = findRowIndex(SHEET_TRANSAKSI, 'id_transaksi', id);
  if (rowIndex === -1) return { success: false, message: 'Transaksi tidak ditemukan' };

  updateCell(SHEET_TRANSAKSI, rowIndex, 'status', newStatus);

  // Set tanggal_diambil if status is "Diambil"
  if (newStatus === 'Diambil') {
    updateCell(SHEET_TRANSAKSI, rowIndex, 'tanggal_diambil', getNow());
  }

  return { success: true, message: 'Status berhasil diupdate menjadi ' + newStatus };
}

function deleteTransaksi(id) {
  const rowIndex = findRowIndex(SHEET_TRANSAKSI, 'id_transaksi', id);
  if (rowIndex === -1) return { success: false, message: 'Transaksi tidak ditemukan' };

  deleteRow(SHEET_TRANSAKSI, rowIndex);
  return { success: true, message: 'Transaksi berhasil dihapus' };
}

// ======================== CEK STATUS (USER) ========================

function cekStatusByNoHp(noHp) {
  if (!noHp) return { success: false, message: 'Nomor HP harus diisi' };

  // Normalize: convert to string and strip leading zeros for comparison
  var searchHp = String(noHp).replace(/\D/g, '');
  if (searchHp.indexOf('62') === 0) searchHp = searchHp.substring(2);
  if (searchHp.indexOf('0') === 0) searchHp = searchHp.substring(1);

  const allTransaksi = enrichTransaksi(getSheetData(SHEET_TRANSAKSI));
  const filtered = allTransaksi.filter(function(t) {
    var hp = String(t.no_hp).replace(/\D/g, '');
    if (hp.indexOf('62') === 0) hp = hp.substring(2);
    if (hp.indexOf('0') === 0) hp = hp.substring(1);
    return hp === searchHp;
  });

  if (filtered.length === 0) {
    return { success: true, data: [], message: 'Tidak ada transaksi untuk nomor ' + noHp };
  }

  // Sort by tanggal_masuk descending (newest first)
  filtered.sort((a, b) => new Date(b.tanggal_masuk) - new Date(a.tanggal_masuk));

  return { success: true, data: filtered };
}

// ======================== DASHBOARD ========================

function getDashboardData() {
  const transaksi = enrichTransaksi(getSheetData(SHEET_TRANSAKSI));
  const pelanggan = getSheetData(SHEET_PELANGGAN);

  const totalOrder = transaksi.length;
  const antrian = transaksi.filter(t => t.status === 'Antrian').length;
  const proses = transaksi.filter(t => t.status === 'Proses').length;
  const selesai = transaksi.filter(t => t.status === 'Selesai').length;
  const diambil = transaksi.filter(t => t.status === 'Diambil').length;

  const totalPendapatan = transaksi.reduce((sum, t) => sum + Number(t.total_harga || 0), 0);
  const totalPelanggan = pelanggan.length;

  // Recent transactions (last 10)
  const recent = transaksi
    .sort((a, b) => new Date(b.tanggal_masuk) - new Date(a.tanggal_masuk))
    .slice(0, 10);

  return {
    success: true,
    data: {
      totalOrder,
      antrian,
      proses,
      selesai,
      diambil,
      totalPendapatan,
      totalPelanggan,
      recentTransaksi: recent
    }
  };
}

// ======================== PENGATURAN ========================

function getPengaturan() {
  const data = getSheetData(SHEET_PENGATURAN);
  const settings = {};
  data.forEach(row => {
    settings[row.key] = row.value;
  });
  return { success: true, data: settings };
}

function updatePengaturanData(key, value) {
  const rowIndex = findRowIndex(SHEET_PENGATURAN, 'key', key);
  if (rowIndex === -1) {
    // Add new setting
    addRowToSheet(SHEET_PENGATURAN, { key: key, value: value });
  } else {
    updateCell(SHEET_PENGATURAN, rowIndex, 'value', value);
  }
  return { success: true, message: 'Pengaturan berhasil diupdate' };
}
