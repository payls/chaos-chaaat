/**
 * Get route
 * @param {string} route
 * @param {object} [params]
 * @returns {string}
 */
export function getRoute(route, params) {
  if (params && Object.keys(params).length > 0) {
    for (let i = 0; i < Object.keys(params).length; i++) {
      const key = Object.keys(params)[i];
      if (!key) continue;
      const replaceValue = params[key] || '';
      const searchKey = `[${key.toLowerCase()}]`;
      route = route.replaceAll(searchKey, replaceValue);
    }
  }
  return route;
}

/**
 * Redirect to home page
 */
export function redirectToHome() {
  window.location.href = 'https://www.yourpave.com';
}
