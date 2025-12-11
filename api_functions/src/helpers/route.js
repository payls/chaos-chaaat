const h = {
  general: require('./general'),
};
const routeHelper = module.exports;

routeHelper.createSubdomainUrl = (subdomain, url) => {
  if (h.general.isEmpty(url)) return null;
  if (h.general.isEmpty(subdomain)) return url;
  if (process.env.NODE_ENV === 'production')
    return url.replace('app', subdomain);
  return url.split('//')[0] + '//' + subdomain + '.' + url.split('//')[1];
};
