// ============================================================
// 🧺 RENDI LAUNDRY — Hash Router
// ============================================================

const Router = (() => {
  const routes = {};
  let currentRoute = null;
  let currentCleanup = null;

  /**
   * Register a route
   * @param {string} path - Hash path (e.g., '/user', '/admin')
   * @param {Function} handler - Function to render the page, returns optional cleanup function
   */
  function register(path, handler) {
    routes[path] = handler;
  }

  /**
   * Navigate to a route
   * @param {string} path
   */
  function navigate(path) {
    window.location.hash = path;
  }

  /**
   * Get current route path
   */
  function getCurrentPath() {
    const hash = window.location.hash.slice(1) || '/user';
    return hash;
  }

  /**
   * Handle route change
   */
  async function handleRouteChange() {
    const path = getCurrentPath();

    // Run cleanup for previous route
    if (currentCleanup && typeof currentCleanup === 'function') {
      currentCleanup();
      currentCleanup = null;
    }

    // Find matching route
    let handler = null;
    let params = {};

    // Exact match first
    if (routes[path]) {
      handler = routes[path];
    } else {
      // Try prefix match for admin sub-routes
      const sortedRoutes = Object.keys(routes).sort((a, b) => b.length - a.length);
      for (const route of sortedRoutes) {
        if (path.startsWith(route)) {
          handler = routes[route];
          params.subPath = path.slice(route.length);
          break;
        }
      }
    }

    if (handler) {
      currentRoute = path;
      try {
        currentCleanup = await handler(params);
      } catch (error) {
        console.error('Route handler error:', error);
      }
    } else {
      // Default redirect
      navigate('/user');
    }
  }

  /**
   * Initialize the router
   */
  function init() {
    window.addEventListener('hashchange', handleRouteChange);
    // Handle initial load
    handleRouteChange();
  }

  /**
   * Check if a given path is active
   */
  function isActive(path) {
    const current = getCurrentPath();
    if (path === current) return true;
    if (path !== '/' && current.startsWith(path)) return true;
    return false;
  }

  return {
    register,
    navigate,
    getCurrentPath,
    init,
    isActive
  };
})();
