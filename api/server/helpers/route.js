const h = {
  general: require('./general'),
  user: require('./user'),
};
const routeHelper = module.exports;

const formatFirstMiddleLastNameV2 = (data, separator = ' ') => {
  let formattedName = '';
  // no data found
  if (h.general.isEmpty(data)) {
    return formattedName;
  }
  // first name
  if (h.general.notEmpty(data.first_name)) {
    let firstName = data.first_name;
    firstName = firstName.toLowerCase().replaceAll('unknown', '');
    formattedName = firstName;
  }
  // middle name
  if (h.general.notEmpty(data.middle_name)) {
    let middleName = data.middle_name;
    middleName = middleName.toLowerCase().replaceAll('unknown', '');
    formattedName = h.general.isEmpty(formattedName)
      ? middleName
      : formattedName + ' ' + middleName;
  }
  // last name
  if (h.general.notEmpty(data.last_name)) {
    let lastName = data.last_name;
    lastName = lastName.toLowerCase().replaceAll('unknown', '');
    formattedName = h.general.isEmpty(formattedName)
      ? lastName
      : formattedName + ' ' + lastName;
  }
  formattedName = h.general.ucFirstAllWords(formattedName).trim();
  return formattedName.replaceAll(' ', separator);
};

const createSubdomainUrl = (subdomain, url) => {
  if (h.general.isEmpty(url)) return null;
  if (h.general.isEmpty(subdomain)) return url.replaceAll(' ', '-');
  if (process.env.NODE_ENV === 'production')
    return url.replace('app', subdomain).replaceAll(' ', '-');

  const envSeparator = h.general.cmpStr(process.env.NODE_ENV, 'development')
    ? '.'
    : '-';
  const final_url =
    url.split('//')[0] + '//' + subdomain + envSeparator + url.split('//')[1];
  return final_url.replaceAll(' ', '-');
};

routeHelper.createSubdomainUrl = createSubdomainUrl;

routeHelper.createPermalink = (
  agency_subdomain,
  webUrl,
  agency_name,
  contactRecord,
  buyerPermalink,
) => {
  const contactName = formatFirstMiddleLastNameV2(contactRecord, '-');
  const formattedContactName = h.general.isEmpty(contactName)
    ? ''
    : `-for-${contactName}`;
  const commentLink = createSubdomainUrl(
    agency_subdomain,
    `${webUrl}/${
      agency_subdomain || agency_name
    }-Proposal${formattedContactName}-${buyerPermalink}`,
  );

  return commentLink;
};
