import { config } from '../configs/config';
/**
 * Generic function to append CDN URL to URLs with no https:// or http:// prefix
 * @param {string} image_url
 * @returns {string}
 */
export function formatImageCdnUrl(image_url) {
  if (!image_url) return image_url;
  if (image_url.indexOf('https://') > -1 || image_url.indexOf('http://') > -1)
    return image_url;
  return `${config.cdnUrls[0]}/${image_url}`;
}

/**
 * Generic function to remove DOMAIN to URLs
 * @param {string} image_url
 * @returns {string}
 */
export function removeDomainUrl(image_url) {
  if (!image_url) return image_url;
  return image_url.replace(/^.*\/\/[^\/]+/, '').replace(/^\/|\/$/g, '');
}
