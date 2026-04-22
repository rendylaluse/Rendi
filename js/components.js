// ============================================================
// 🧺 RENDI LAUNDRY — Reusable UI Components
// ============================================================

const Components = (() => {

  // ======================== SKELETON LOADING ========================

  function skeletonCard(count = 1) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="order-card" style="animation-delay: ${i * 100}ms">
          <div class="order-card-header">
            <div class="skeleton skeleton-badge"></div>
            <div class="skeleton skeleton-badge"></div>
          </div>
          <div class="order-details">
            <div class="order-detail-item">
              <div class="skeleton skeleton-text shorter"></div>
              <div class="skeleton skeleton-text short"></div>
            </div>
            <div class="order-detail-item">
              <div class="skeleton skeleton-text shorter"></div>
              <div class="skeleton skeleton-text short"></div>
            </div>
            <div class="order-detail-item">
              <div class="skeleton skeleton-text shorter"></div>
              <div class="skeleton skeleton-text short"></div>
            </div>
            <div class="order-detail-item">
              <div class="skeleton skeleton-text shorter"></div>
              <div class="skeleton skeleton-text short"></div>
            </div>
          </div>
          <div class="status-timeline">
            <div class="timeline-step"><div class="skeleton" style="width:32px;height:32px;border-radius:50%"></div><div class="skeleton skeleton-text" style="width:40px;margin-top:8px"></div></div>
            <div class="timeline-step"><div class="skeleton" style="width:32px;height:32px;border-radius:50%"></div><div class="skeleton skeleton-text" style="width:40px;margin-top:8px"></div></div>
            <div class="timeline-step"><div class="skeleton" style="width:32px;height:32px;border-radius:50%"></div><div class="skeleton skeleton-text" style="width:40px;margin-top:8px"></div></div>
            <div class="timeline-step"><div class="skeleton" style="width:32px;height:32px;border-radius:50%"></div><div class="skeleton skeleton-text" style="width:40px;margin-top:8px"></div></div>
          </div>
        </div>`;
    }
    return html;
  }

  function skeletonTable(rows = 5) {
    let html = '<div class="table-container"><table class="data-table"><thead><tr>';
    for (let i = 0; i < 6; i++) {
      html += `<th><div class="skeleton skeleton-text" style="width:${60 + i * 15}px"></div></th>`;
    }
    html += '</tr></thead><tbody>';
    for (let i = 0; i < rows; i++) {
      html += '<tr>';
      for (let j = 0; j < 6; j++) {
        html += `<td><div class="skeleton skeleton-text" style="width:${50 + j * 20}px"></div></td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    return html;
  }

  function skeletonStats(count = 4) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="stats-card">
          <div class="skeleton" style="width:48px;height:48px;border-radius:12px;flex-shrink:0"></div>
          <div class="stats-content">
            <div class="skeleton" style="width:80px;height:28px;margin-bottom:8px;border-radius:6px"></div>
            <div class="skeleton skeleton-text short"></div>
          </div>
        </div>`;
    }
    return html;
  }

  // ======================== STATUS BADGE ========================

  function statusBadge(status) {
    const statusLower = status.toLowerCase();
    const classMap = {
      'antrian': 'badge-antrian',
      'proses': 'badge-proses',
      'selesai': 'badge-selesai',
      'diambil': 'badge-diambil'
    };
    const badgeClass = classMap[statusLower] || 'badge-antrian';
    return `<span class="badge ${badgeClass}">${status}</span>`;
  }

  // ======================== STATUS TIMELINE ========================

  function statusTimeline(currentStatus) {
    const steps = ['Antrian', 'Proses', 'Selesai', 'Diambil'];
    const icons = ['⏳', '🔄', '✅', '📦'];
    const currentIndex = steps.indexOf(currentStatus);

    let html = '<div class="status-timeline">';
    steps.forEach((step, i) => {
      let cls = '';
      if (i < currentIndex) cls = 'completed';
      else if (i === currentIndex) cls = 'active';

      html += `
        <div class="timeline-step ${cls}">
          <div class="timeline-dot">${i <= currentIndex ? icons[i] : ''}</div>
          <div class="timeline-label">${step}</div>
        </div>`;
    });
    html += '</div>';
    return html;
  }

  // ======================== STATS CARD ========================

  function statsCard(icon, value, label, type = '') {
    return `
      <div class="stats-card ${type}">
        <div class="stats-icon">${icon}</div>
        <div class="stats-content">
          <div class="stats-value">${value}</div>
          <div class="stats-label">${label}</div>
        </div>
      </div>`;
  }

  // ======================== FORMAT HELPERS ========================

  function formatCurrency(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (d.getFullYear() === 1970) return '-'; // Fallback for invalid mapped dates from old records
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatPhone(noHp) {
    if (!noHp) return '-';
    let hp = String(noHp).replace(/\D/g, '');
    // Add leading 0 if it starts with 8 (Google Sheets strips leading zero)
    if (hp.charAt(0) === '8') hp = '0' + hp;
    return hp;
  }

  // ======================== TOAST NOTIFICATION ========================

  function toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;
    toastEl.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300)">✕</button>
    `;

    container.appendChild(toastEl);

    // Auto remove
    setTimeout(() => {
      if (toastEl.parentElement) {
        toastEl.classList.add('removing');
        setTimeout(() => toastEl.remove(), 300);
      }
    }, 4000);
  }

  // ======================== MODAL ========================

  function showModal(title, bodyHtml, footerHtml = '') {
    const backdrop = document.getElementById('modal-backdrop');
    if (!backdrop) return;

    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="Components.closeModal()" aria-label="Tutup">✕</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>`;

    backdrop.classList.add('active');

    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    // Close on Escape
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  function closeModal() {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      backdrop.innerHTML = '';
    }
  }

  // ======================== CONFIRM DIALOG ========================

  function confirm(message, onConfirm) {
    const body = `<p class="confirm-text">${message}</p>`;
    const footer = `
      <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
      <button class="btn btn-danger" id="confirm-btn">Hapus</button>`;

    showModal('Konfirmasi', body, footer);

    // Bind after render
    setTimeout(() => {
      const btn = document.getElementById('confirm-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          closeModal();
          if (onConfirm) onConfirm();
        });
      }
    }, 50);
  }

  // ======================== EMPTY STATE ========================

  function emptyState(icon, title, desc) {
    return `
      <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <div class="empty-title">${title}</div>
        <div class="empty-desc">${desc}</div>
      </div>`;
  }

  // ======================== STATUS SELECT ========================

  function statusSelect(currentStatus, transactionId) {
    const statuses = ['Antrian', 'Proses', 'Selesai', 'Diambil'];
    let html = `<select class="form-select" style="min-width:120px;padding:4px 28px 4px 8px;font-size:0.75rem" data-id="${transactionId}" onchange="AdminPage.handleStatusChange(this)">`;
    statuses.forEach(s => {
      html += `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>`;
    });
    html += '</select>';
    return html;
  }

  return {
    skeletonCard,
    skeletonTable,
    skeletonStats,
    statusBadge,
    statusTimeline,
    statsCard,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatPhone,
    toast,
    showModal,
    closeModal,
    confirm,
    emptyState,
    statusSelect
  };
})();
