// ============================================================
// 🧺 FRESH LAUNDRY — API Client
// ============================================================

const API = (() => {
  // URL Google Apps Script Web App
  let BASE_URL = 'https://script.google.com/macros/s/AKfycbw9dzEzboohNxRvAeQB3Zw8T-cS-yfxInsZGEsZFcr21TTPggzK8Ahac6PNmN4PhJ7I/exec';

  /**
   * Set the API base URL
   */
  function setBaseUrl(url) {
    BASE_URL = url;
    localStorage.setItem('laundry_api_url', url);
  }

  /**
   * Get the API base URL
   */
  function getBaseUrl() {
    if (!BASE_URL) {
      BASE_URL = localStorage.getItem('laundry_api_url') || '';
    }
    return BASE_URL;
  }

  /**
   * Check if API is configured
   */
  function isConfigured() {
    return !!getBaseUrl();
  }

  /**
   * GET request
   */
  async function get(action, params = {}) {
    const url = new URL(getBaseUrl());
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`API GET [${action}] error:`, error);
      throw error;
    }
  }

  /**
   * POST request
   */
  async function post(action, data = {}) {
    const url = getBaseUrl();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...data })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`API POST [${action}] error:`, error);
      throw error;
    }
  }

  // ======================== PELANGGAN ========================
  const Pelanggan = {
    getAll: () => get('getPelanggan'),
    add: (data) => post('tambahPelanggan', data),
    update: (data) => post('updatePelanggan', data),
    delete: (id) => post('hapusPelanggan', { id_pelanggan: id })
  };

  // ======================== TRANSAKSI ========================
  const Transaksi = {
    getAll: () => get('getTransaksi'),
    getById: (id) => get('getTransaksiById', { id }),
    add: (data) => post('tambahTransaksi', data),
    updateStatus: (id, status) => post('updateStatus', { id_transaksi: id, status }),
    delete: (id) => post('hapusTransaksi', { id_transaksi: id })
  };

  // ======================== LAYANAN ========================
  const Layanan = {
    getAll: () => get('getLayanan'),
    add: (data) => post('tambahLayanan', data),
    update: (data) => post('updateLayanan', data),
    delete: (id) => post('hapusLayanan', { id_layanan: id })
  };

  // ======================== lAINNYA ========================
  const Dashboard = {
    get: () => get('getDashboard')
  };

  const Status = {
    cek: (noHp) => get('cekStatus', { no_hp: noHp })
  };

  const Pengaturan = {
    get: () => get('getPengaturan'),
    update: (key, value) => post('updatePengaturan', { key, value })
  };

  const Init = {
    sheets: () => get('initSheets')
  };

  return {
    setBaseUrl,
    getBaseUrl,
    isConfigured,
    get,
    post,
    Pelanggan,
    Transaksi,
    Layanan,
    Dashboard,
    Status,
    Pengaturan,
    Init
  };
})();
