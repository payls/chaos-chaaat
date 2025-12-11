/**
 * Formats the content by replacing special characters with HTML tags.
 * FOR INBOX
 * @param {string} content - The content to be formatted.
 * @returns {string} The formatted content.
 */
export function formatMsg(content) {
  let formattedResult = content;

  formattedResult = formattedResult.replace(
    /(?<!<[^>]+)(\*{1})(.*?)(\*{1})(?!>)/g,
    '<b style="font-family: PoppinsSemiBold">$2</b>',
  );
  formattedResult = formattedResult.replace(
    /(?<!<[^>]+)(_{1})(.*?)(_{1})(?!>)/g,
    '<i>$2</i>',
  );
  formattedResult = formattedResult.replace(
    /(?<!<[^>]+)(~{1})(.*?)(~{1})(?!>)/g,
    '<s>$2</s>',
  );

  return formattedResult;
}

/**
 * Formats the content by replacing special characters with HTML tags.
 * @param {string} content - The content to be formatted.
 * @returns {string} The formatted content.
 */
export function formatBodyMsg(content) {
  let formattedResult = content;

  formattedResult = formattedResult.replace(
    /(\*{1})(.*?)(\*{1})/g,
    '<b>$2</b>',
  );
  formattedResult = formattedResult.replace(/(_{1})(.*?)(_{1})/g, '<i>$2</i>');
  formattedResult = formattedResult.replace(/(~{1})(.*?)(~{1})/g, '<s>$2</s>');

  return formattedResult;
}
