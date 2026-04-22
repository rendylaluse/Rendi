// ============================================================
// 🧺 FRESH LAUNDRY — App Initialization
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

  // Set default hash if none
  if (!window.location.hash) {
    window.location.hash = '/user';
  }
});
