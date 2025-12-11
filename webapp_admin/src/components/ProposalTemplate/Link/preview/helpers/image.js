import axios from 'axios';

/**
 * Get thumbnail of the media
 * @param {media}
 * @returns {string}
 */
export function getMediaThumbnail(media) {
  let thumb =
    media.thumbnail_src ??
    media.url ??
    media.media_thumbnail_src ??
    media.media_url;

  let url = media.url ?? media.media_url;
  const isYoutube = url.match(
    /\/\/(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?([a-z0-9_\-]+)/i,
  );
  const isVimeo = url.match(
    /(http|https)?:\/\/(www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)/,
  );
  const isWistia = url.match(/(wistia\.net|wi\.st)\/(medias|embed)\/.*/);

  if (isYoutube) {
    const videoId = url.split('/')[url.split('/').length - 1];
    thumb = `https://i3.ytimg.com/vi/${videoId}/default.jpg`;
  }

  if (isVimeo) {
    const videoId = url.split('/')[url.split('/').length - 1];
    thumb = `https://vumbnail.com/${videoId}.jpg`;
  }

  if (isWistia) {
    const videoId = url.split('/')[url.split('/').length - 1];

    const response = axios.get(
      `http://fast.wistia.net/oembed?url=https%3A%2F%2Fsupport.wistia.com%2Fmedias%2F${videoId}&embedType=async`,
    );

    if (response && response.data && response.data.thumbnail_url) {
      thumb = response.data.thumbnail_url;

      return {
        url: `https://home.wistia.com/medias/${videoId}`,
        thumb,
        tag: media.tag,
      };
    } else {
      return null;
    }
  }
  return thumb;
}
