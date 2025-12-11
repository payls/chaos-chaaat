import { h } from './index';

/**
 * Format full name for a user
 * @param {object} user
 * @returns {string}
 */
export function formatFullName(user) {
  let formattedName = '';
  if (h.isEmpty(user)) return formattedName;
  if (h.notEmpty(user.first_name)) {
    formattedName += user.first_name;
  }
  if (h.notEmpty(user.last_name)) {
    formattedName += ' ' + user.last_name;
  }
  formattedName = h.general.ucFirstAllWords(formattedName);
  return formattedName.trim();
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
 * Parse Facebook signin payload and extract it to a standardized format
 * @param {{
 * 	accessToken: string,
 * 	data_access_expiration_time: number,
 * 	email: string,
 * 	expiresIn: number,
 * 	first_name: string,
 * 	graphDomain: string,
 * 	id: string,
 * 	last_name: string,
 * 	name: string,
 * 	picture: { data: {
 * 	    url: string
 * 	}},
 * 	signedRequest: string,
 * 	userID:string
 * }} payload
 * @returns {{access_token: string, full_name: string, profile_picture_url: string, last_name: string, first_name: string, signed_request: string, email: string, facebook_id: string}}
 */
export function parseFacebookSigninPayload(payload) {
  let extractedData = {
    first_name: '',
    last_name: '',
    email: '',
    profile_picture_url: '',
    facebook_id: '',
    full_name: '',
    access_token: '',
    signed_request: '',
  };
  if (!payload) return extractedData;
  const {
    email,
    first_name,
    last_name,
    userID: facebook_id,
    picture = { data: { url: '' } },
    name,
    accessToken,
    signedRequest,
  } = payload;
  extractedData.first_name = first_name;
  extractedData.last_name = last_name;
  extractedData.email = email;
  extractedData.profile_picture_url = picture.data.url;
  extractedData.facebook_id = facebook_id;
  extractedData.full_name = name;
  extractedData.access_token = accessToken;
  extractedData.signed_request = signedRequest;
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

/**
 * Validate number if with valid counytry code
 * @param {string} number
 * @returns {boolean}
 */
export function isValidNumberWithCountryCode(number) {
  const countryNumberCodes = require('../constants/countryNumberCodes.json');

  return (
    countryNumberCodes
      .map((m) => ({ code: m.dial_code.replace('+', '') }))
      .filter((f) => {
        if (f.code.length > 0) {
          const numberCountryCode = number
            .replace('+', '')
            .substring(0, f.code.length);

          return numberCountryCode === f.code;
        }
        return false;
      }).length > 0
  );
}
