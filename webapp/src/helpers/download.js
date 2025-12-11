import { config } from '../configs/config';
import { h } from '../helpers';

/**
 * Download a file with saved file name given the url
 * @param {string} url
 */
export function downloadWithFileName(url, downloadType) {
  const requestOptions = {
    method: 'POST',
    headers: {
      Accept: 'application/octet-stream',
      'Content-Type': 'application/json',
      Authorization: h.cookie.getAccessToken(),
    },
    body: JSON.stringify({ url: url }),
  };

  let fileName;
  fetch(`${config.apiUrl}/v1/download/${downloadType}`, requestOptions)
    .then((res) => {
      fileName = decodeURI(
        res.headers.get('content-disposition').split('filename=')[1],
      );
      return res.blob();
    })
    .then((blob) => {
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((err) => {
      h.general.alert('error', {
        message: 'Failed to download file',
        autoCloseInSecs: 3,
      });
      return Promise.reject({ Error: 'Failed to download file', err });
    });
}
