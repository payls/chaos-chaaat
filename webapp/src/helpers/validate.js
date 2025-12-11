/**
 * Validate whether an email is valid
 * @param {string} value
 * @returns {boolean}
 */
export function validateEmail(value) {
  if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,10}$/i.test(value)) {
    return true;
  }
  return false;
}

/**
 * Validate whether an password is valid
 * Definition of valid is at least 8 characters, at least 1 number and 1 letter
 * @param {string} value
 * @returns {boolean}
 */
 export function validatePassword(value) {
  const regex = new RegExp("^((?=.*?[a-zA-Z])(?=.*?[0-9])).{8,}$");
  if (regex.test(value)) {
    return true;
  }
  return false;
}

