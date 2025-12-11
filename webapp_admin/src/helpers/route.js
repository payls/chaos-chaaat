import { h } from '../helpers';
import { config } from '../configs/config';

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

export function createSubdomainUrl(subdomain, url) {
  let subdomainStr = subdomain;
  if (h.isEmpty(url)) return null;
  if (!h.cmpStr(config.env, 'production')) {
    subdomainStr = '';
  }

  if (h.isEmpty(subdomainStr)) return url.replaceAll(' ', '-');
  if (h.cmpStr(config.env, 'production'))
    return url.replace('app', subdomainStr).replaceAll(' ', '-');

  const envSeparator = h.cmpStr(config.env, 'development') ? '.' : '-';

  let linkArr = url.split('-');
  let modifiedLink = url;

  if (
    linkArr[linkArr.length - 2] &&
    linkArr[linkArr.length - 2].toLowerCase() === 'unknown'
  ) {
    modifiedLink = modifiedLink.replace(/unknown/i, '');
    linkArr[linkArr.length - 2] = '';
  }

  if (linkArr[linkArr.length - 2] === '') {
    modifiedLink = modifiedLink.replace('-for-', '');
  }

  const final_url =
    modifiedLink.split('//')[0] +
    '//' +
    subdomainStr +
    envSeparator +
    modifiedLink.split('//')[1];
  return final_url.replaceAll(' ', '-');
}
