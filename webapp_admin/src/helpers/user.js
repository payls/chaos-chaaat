import { h } from './index';

/**
 * Format full name for a user
 * @param {object} user
 * @param separator
 * @returns {string}
 */
export function formatFullName(user, separator = ' ') {
  let formattedName = '';
  if (h.isEmpty(user)) return formattedName;
  if (h.notEmpty(user.first_name)) {
    formattedName += user.first_name;
  }
  if (h.notEmpty(user.last_name)) {
    formattedName += ' ' + user.last_name;
  }
  formattedName = h.general.ucFirstAllWords(formattedName);
  return formattedName.trim().replaceAll(' ', separator);
}

/**
 * Combines first name and last name into a string
 * @param first_name
 * @param last_name
 * @param separator
 * @returns {string}
 */
export function combineFirstNLastName(first_name, last_name, separator = ' ') {
  if (
    first_name !== null &&
    last_name !== null &&
    first_name.toLowerCase() === 'unknown' &&
    last_name.toLowerCase() === 'unknown'
  ) {
    return '';
  }

  if (
    last_name &&
    first_name !== null &&
    (first_name === '' || first_name.toLowerCase() === 'unknown')
  ) {
    return last_name.trim().replaceAll(' ', separator);
  }
  if (
    first_name &&
    last_name !== null &&
    (last_name === '' || last_name.toLowerCase() === 'unknown')
  ) {
    return first_name.trim().replaceAll(' ', separator);
  }
  const fname = first_name || '';
  const lname = last_name || '';
  return fname.concat(' ', lname).trim().replaceAll(' ', separator);
}

/**
 * Parse Google signin payload and extract it to a standardized format
 * @param {{
 * 	profileObj:{
 *     email:string,
 *     familyName:string,
 *     givenName:string,
 *     googleId:string,
 *     imageUrl:string,
 *     name:string
 * 	},
 * 	tokenId:string
 * }} payload
 * @returns {{google_id: string, full_name: string, profile_picture_url: string, last_name: string, first_name: string, email: string, token_id: string}}
 */
export function parseGoogleSigninPayload(payload) {
  let extractedData = {
    first_name: '',
    last_name: '',
    email: '',
    profile_picture_url: '',
    google_id: '',
    full_name: '',
    token_id: '',
  };
  if (!payload || !payload.profileObj || !payload.tokenId) return extractedData;
  const { profileObj, tokenId } = payload;
  const { email, family_name, given_name, id, picture, name } = profileObj;
  extractedData.first_name = given_name;
  extractedData.last_name = family_name;
  extractedData.email = email;
  extractedData.profile_picture_url = picture;
  extractedData.google_id = id;
  extractedData.full_name = name;
  extractedData.token_id = tokenId;
  return extractedData;
}

/**
 * Get Initials
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
export function getNameInitials(firstname, lastname) {
  let firstInitial;
  let secondInitial;

  if (h.general.notEmpty(firstname)) {
    firstInitial = firstname.charAt(0).toUpperCase();
  } else {
    firstInitial = '';
  }

  if (h.general.notEmpty(lastname)) {
    secondInitial = lastname.charAt(0).toUpperCase();
  } else {
    secondInitial = '';
  }
  return firstInitial + secondInitial;
}
