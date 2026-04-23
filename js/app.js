// ============================================================
// 🧺 RENDI LAUNDRY — App Initialization
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Register routes
  Router.register('/user', () => {
    UserPage.render();
  });

  Router.register('/admin', () => {
    AdminPage.render();
  });

  // Initialize router
  Router.init();

  // Sync profile photo from backend
  syncProfilePhoto();

  // Set default hash if none
  if (!window.location.hash) {
    window.location.hash = '/user';
  }
});

/**
 * Sync profile photo from backend settings
 */
async function syncProfilePhoto() {
  if (!API.isConfigured()) return;

  try {
    const result = await API.Pengaturan.get();
    if (result.success && result.data.profile_photo) {
      const remotePhoto = result.data.profile_photo;
      const localPhoto = localStorage.getItem('laundry_profile_photo');

      // Update if different
      if (remotePhoto !== localPhoto) {
        localStorage.setItem('laundry_profile_photo', remotePhoto);
        // Update all profile images on the page
        document.querySelectorAll('#user-profile-img, #sidebar-profile-img').forEach(img => {
          img.src = remotePhoto;
        });
      }
    }
  } catch (error) {
    console.warn('Gagal sinkronisasi foto profil:', error);
  }
}
