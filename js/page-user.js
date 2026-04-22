// ============================================================
// 🧺 FRESH LAUNDRY — User Page
// ============================================================

const UserPage = (() => {

  /**
   * Render the user page
   */
  function render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="user-page page active" id="page-user">
        <!-- Header -->
        <header class="user-header">
          <div class="user-logo">🧺</div>
          <h1 class="user-title"><span class="text-gradient">Fresh Laundry</span></h1>
          <p class="user-subtitle">Cek status cucian Anda dengan mudah</p>
        </header>

        <!-- Main Content -->
        <main class="user-main">
          <!-- Search Section -->
          <section class="search-section">
            <div class="search-card">
              <p class="search-card-title">📱 Masukkan nomor HP yang terdaftar</p>
              <div class="search-input-wrapper">
                <input
                  type="tel"
                  id="input-phone"
                  class="form-input form-input-lg"
                  placeholder="Contoh: 08123456789"
                  maxlength="15"
                  autocomplete="tel"
                  aria-label="Nomor HP"
                />
                <button class="btn btn-primary btn-lg" id="btn-cek-status" onclick="UserPage.cekStatus()">
                  🔍 Cek Status
                </button>
              </div>
            </div>
          </section>

          <!-- Results Section -->
          <section class="results-section" id="results-section" style="display:none;">
            <div class="results-header">
              <h2 class="results-title">📋 Hasil Pencarian</h2>
              <span class="results-count" id="results-count"></span>
            </div>
            <div id="results-list" class="stagger-children"></div>
          </section>
        </main>

        <!-- Footer -->
        <footer class="user-footer">
          <div class="user-footer-nav">
            <a href="#/admin">🔧 Admin Panel</a>
          </div>
          <p>© 2026 Fresh Laundry. All rights reserved.</p>
        </footer>
      </div>`;

    // Bind enter key
    const input = document.getElementById('input-phone');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') cekStatus();
      });
      input.focus();
    }
  }

  /**
   * Check laundry status by phone number
   */
  async function cekStatus() {
    const input = document.getElementById('input-phone');
    let noHp = input.value.trim();

    if (!noHp) {
      Components.toast('Masukkan nomor HP terlebih dahulu', 'warning');
      input.focus();
      return;
    }

    // Normalize: strip leading 0 or +62 for search (Google Sheets stores as number)
    let searchHp = noHp.replace(/\D/g, ''); // Remove non-digits
    if (searchHp.startsWith('62')) searchHp = searchHp.substring(2);
    if (searchHp.startsWith('0')) searchHp = searchHp.substring(1);

    if (!API.isConfigured()) {
      Components.toast('API belum dikonfigurasi. Buka Admin > Pengaturan untuk setup.', 'error');
      return;
    }

    // Show results section with skeleton
    const section = document.getElementById('results-section');
    const list = document.getElementById('results-list');
    const countEl = document.getElementById('results-count');

    section.style.display = 'block';
    list.innerHTML = Components.skeletonCard(2);
    countEl.textContent = 'Memuat...';

    // Disable button
    const btn = document.getElementById('btn-cek-status');
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> Mencari...';

    try {
      const result = await API.Status.cek(searchHp);

      if (result.success && result.data && result.data.length > 0) {
        countEl.textContent = `${result.data.length} transaksi ditemukan`;
        list.innerHTML = result.data.map(renderOrderCard).join('');
      } else {
        list.innerHTML = Components.emptyState(
          '🔍',
          'Tidak Ditemukan',
          `Tidak ada transaksi untuk nomor <strong>${noHp}</strong>. Pastikan nomor sudah benar.`
        );
        countEl.textContent = '';
      }
    } catch (error) {
      list.innerHTML = Components.emptyState(
        '⚠️',
        'Terjadi Kesalahan',
        'Gagal menghubungi server. Silakan coba lagi nanti.'
      );
      countEl.textContent = '';
      Components.toast('Gagal memuat data: ' + error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '🔍 Cek Status';
    }
  }

  /**
   * Render a single order card
   */
  function renderOrderCard(order) {
    return `
      <div class="order-card animate-fade-in-up">
        <div class="order-card-header">
          <span class="order-id">#${order.id_transaksi}</span>
          ${Components.statusBadge(order.status)}
        </div>

        <div class="order-details">
          <div class="order-detail-item">
            <span class="order-detail-label">Layanan</span>
            <span class="order-detail-value">${order.nama_layanan || '-'}</span>
          </div>
          <div class="order-detail-item">
            <span class="order-detail-label">Berat</span>
            <span class="order-detail-value">${order.berat_kg} kg</span>
          </div>
          <div class="order-detail-item">
            <span class="order-detail-label">Tanggal Masuk</span>
            <span class="order-detail-value">${Components.formatDate(order.tanggal_masuk)}</span>
          </div>
          <div class="order-detail-item">
            <span class="order-detail-label">Total</span>
            <span class="order-detail-value order-total">${Components.formatCurrency(order.total_harga)}</span>
          </div>
        </div>

        ${Components.statusTimeline(order.status)}

        <div style="text-align:center; margin-top: var(--space-2);">
          <span style="font-size: var(--text-xs); color: var(--text-tertiary);">
            Est. Selesai: ${Components.formatDate(order.tanggal_selesai)}
            ${order.tanggal_diambil ? ' • Diambil: ' + Components.formatDate(order.tanggal_diambil) : ''}
          </span>
        </div>
      </div>`;
  }

  return {
    render,
    cekStatus
  };
})();
