import constant from '../constants/constant.json';
const mime = require('mime-types');
const image = constant.MIME_TYPE.IMAGE;
const doc = constant.MIME_TYPE.DOC;
const xls = constant.MIME_TYPE.XLS;
const ppt = constant.MIME_TYPE.PPT;
const pdf = constant.MIME_TYPE.PDF;

/**
 * Return the support attachment files types in string
 * @returns {string}
 */
export function getSupportedFileTypes() {
  let supportedFilesArray = [];
  supportedFilesArray = supportedFilesArray.concat(doc);
  supportedFilesArray = supportedFilesArray.concat(xls);
  supportedFilesArray = supportedFilesArray.concat(ppt);
  supportedFilesArray = supportedFilesArray.concat(pdf);
  supportedFilesArray = supportedFilesArray.concat(image);

  let supportedFilesString = supportedFilesArray.join(', ');
  return supportedFilesString;
}

/**
 * Check if mime type is DOC
 * @param {string} [url]
 * @returns {boolean}
 */
export function isDoc(url) {
  let mime_type = mime.lookup(url);
  if (doc.includes(mime_type)) return true;
  return false;
}

/**
 * Check if mime type is XLS
 * @param {string} [url]
 * @returns {boolean}
 */
export function isXls(url) {
  let mime_type = mime.lookup(url);
  if (xls.includes(mime_type)) return true;
  return false;
}

/**
 * Check if mime type is PPT
 * @param {string} [url]
 * @returns {boolean}
 */
export function isPpt(url) {
  let mime_type = mime.lookup(url);
  if (ppt.includes(mime_type)) return true;
  return false;
}

/**
 * Check if mime type is PDF
 * @param {string} [url]
 * @returns {boolean}
 */
export function isPdf(url) {
  let mime_type = mime.lookup(url);
  if (pdf.includes(mime_type)) return true;
  return false;
}

/**
 * Check if mime type is image
 * @param {string} [url]
 * @returns {boolean}
 */
export function isImage(url) {
  let mime_type = mime.lookup(url);
  if (image.includes(mime_type)) return true;
  return false;
}
