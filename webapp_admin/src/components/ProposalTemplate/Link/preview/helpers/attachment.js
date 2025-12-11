import constant from '../constants/constant.json';

/**
 * Return the support attachment files types in string
 * @returns {string}
 */
export function getSupportedFileTypes() {
  let supportedFilesArray = [];
  supportedFilesArray = supportedFilesArray.concat(constant.MIME_TYPE.DOC);
  supportedFilesArray = supportedFilesArray.concat(constant.MIME_TYPE.XLS);
  supportedFilesArray = supportedFilesArray.concat(constant.MIME_TYPE.PPT);
  supportedFilesArray = supportedFilesArray.concat(constant.MIME_TYPE.PDF);
  supportedFilesArray = supportedFilesArray.concat(constant.MIME_TYPE.IMAGE);


  let supportedFilesString = supportedFilesArray.join(", ");
  return supportedFilesString;
};

  