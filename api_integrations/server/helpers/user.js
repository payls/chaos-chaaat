const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userHelper = module.exports;
const h = {
  general: require('./general'),
};

/**
 * Get current user details from access token in request header
 * @param {FastifyRequest} request
 * @returns {{user_id: string, profile_picture_url: string, last_name: string, mobile_number: string, first_name: string, email: string, status: string}}
 */
userHelper.getCurrentUser = (request) => {
  const currentUser = {
    user_id: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    profile_picture_url: '',
    status: '',
  };
  const accessToken = h.general.getAccessToken(request);
  if (h.general.isEmpty(accessToken)) return currentUser;
  const accessTokenUser = jwt.decode(accessToken);
  currentUser.user_id = accessTokenUser.user_id;
  currentUser.first_name = accessTokenUser.first_name;
  currentUser.last_name = accessTokenUser.last_name;
  currentUser.email = accessTokenUser.email;
  currentUser.mobile_number = accessTokenUser.mobile_number;
  currentUser.profile_picture_url = accessTokenUser.profile_picture_url;
  currentUser.status = accessTokenUser.status;
  return currentUser;
};

/**
 * Generate password salt
 * @param {number} [length=30]
 * @returns {string}
 */
userHelper.generatePasswordSalt = (length = 30) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
};

/**
 * Hash password with salt
 * @param {string} password
 * @param {string} salt
 * @returns {{password_salt: string, hashed_password: string}}
 */
userHelper.hashPasswordWithSalt = (password, salt) => {
  const hash = crypto.createHmac(
    'sha512',
    salt,
  ); /** Hashing algorithm sha512 */
  hash.update(password);
  const value = hash.digest('hex');
  return { password_salt: salt, hashed_password: value };
};

/**
 * Hash password and automatically generate a new salt
 * @param {string} password
 * @returns {{password_salt: string, hashed_password: string}}
 */
userHelper.hashPassword = (password) => {
  if (!password) return { password_salt: '', hashed_password: '' };
  const salt = userHelper.generatePasswordSalt();
  return userHelper.hashPasswordWithSalt(password, salt);
};

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
userHelper.parseGoogleSigninPayload = (payload) => {
  const extractedData = {
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
  const { email, familyName, givenName, googleId, imageUrl, name } = profileObj;
  extractedData.first_name = givenName;
  extractedData.last_name = familyName;
  extractedData.email = email;
  extractedData.profile_picture_url = imageUrl;
  extractedData.google_id = googleId;
  extractedData.full_name = name;
  extractedData.token_id = tokenId;
  return extractedData;
};

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
userHelper.parseFacebookSigninPayload = (payload) => {
  const extractedData = {
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
};

/**
 * Format user's full name by taking in user's first name, middle name and last name
 * @param {{first_name?:string, middle_name?:string, last_name?:string}} data
 * @returns {string}
 */
userHelper.formatFirstMiddleLastName = (data) => {
  let formattedName = '';
  // no data found
  if (h.general.isEmpty(data)) {
    return formattedName;
  }
  // first name
  if (h.general.notEmpty(data.first_name)) {
    formattedName = data.first_name;
  }
  // middle name
  if (h.general.notEmpty(data.middle_name)) {
    formattedName = h.general.isEmpty(formattedName)
      ? data.middle_name
      : formattedName + ' ' + data.middle_name;
  }
  // last name
  if (h.general.notEmpty(data.last_name)) {
    formattedName = h.general.isEmpty(formattedName)
      ? data.last_name
      : formattedName + ' ' + data.last_name;
  }
  formattedName = h.general.ucFirstAllWords(formattedName);
  return formattedName;
};

/**
 * Capitalize First Character of the string
 * @param { string: string }
 * @returns {string}
 */
userHelper.capitalizeFirstLetter = (string = '') => {
  string = typeof string === 'string' ? string.trim() : '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};
