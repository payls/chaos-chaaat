import axios from 'axios';
import constant from '../constants/constant.json';

/**
 * Get Youtube video ID from Youtube URL
 * @param {string} youtubeUrl
 * @returns {string}
 */
export function getYoutubeId(youtubeUrl) {
  let youtubeId = '';
  if (!youtubeUrl) return youtubeId;

  if (youtubeUrl.includes('.be')) {
    if (youtubeUrl.includes('https://')) {
      youtubeId = youtubeUrl.split('/')[3];
    } else {
      youtubeId = youtubeUrl.split('/')[1];
    }
  } else {
    let url = new URL(youtubeUrl);
    if (url.searchParams.get('v')) {
      youtubeId = url.searchParams.get('v');
    }
  }

  return youtubeId;
}

/**
 * Format Youtube embed URL with Youtube ID
 * @param {string} youtubeId
 * @returns {string|`https://www.youtube.com/embed/${string}`}
 */
export function formatYoutubeEmbedUrl(youtubeId) {
  let youtubeEmbedUrl = '';
  if (!youtubeId) return youtubeEmbedUrl;
  youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeId}`;
  return youtubeEmbedUrl;
}

/**
 * Get embedded video ID from video URL
 * eg. Wistia - (https://support.wistia.com/medias/h1z3uqsjal)
 * eg. Vimeo - (https://vimeo.com/403530213)
 * @param {string} embedUrl
 * @param {string} videoType
 * @returns {string}
 */
export function getEmbeddedId(embedUrl, videoType) {
  let embedID = '';
  if (!embedUrl) return embedUrl;
  switch (videoType) {
    case constant.UPLOAD.TYPE.PROJECT_MEDIA_VIMEO:
      embedID = embedUrl.split('/')[embedUrl.split('/').length - 1];

      if (isNaN(embedID)) {
        embedID = embedUrl.split('/')[embedUrl.split('/').length - 2];
      }
      break;
    case constant.UPLOAD.TYPE.PROJECT_MEDIA_WISTIA:
      embedID = embedUrl.split('/')[embedUrl.split('/').length - 1];
      break;
    default:
  }
  return embedID;
}

/**
 * Format Vimeo embed URL with Vimeo ID
 * @param {string} vimeoId
 * @returns {string|`https://player.vimeo.com/video/${string}`}
 */
export function formatVimeoEmbedUrl(vimeoId) {
  let vimeoEmbedUrl = '';
  if (!vimeoId) return vimeoEmbedUrl;
  vimeoEmbedUrl = `https://player.vimeo.com/video/${vimeoId}`;
  return vimeoEmbedUrl;
}

/**
 * Format Vimeo filename in correct format
 * @param {string} vimeoId
 * @returns {string|`https://vimeo.com/${string}`}
 */
export function formatVimeoFilename(vimeoId) {
  let vimeoEmbedUrl = '';
  if (!vimeoId) return vimeoEmbedUrl;
  vimeoEmbedUrl = `https://vimeo.com/${vimeoId}`;
  return vimeoEmbedUrl;
}

/**
 * Format Wistia embed URL with Wistia ID
 * @param {string} wistiaId
 * @returns {string|`//fast.wistia.net/embed/iframe/${string}`}
 */
export function formatWistiaEmbedUrl(wistiaId) {
  let wistiaEmbedUrl = '';
  if (!wistiaId) return wistiaEmbedUrl;
  wistiaEmbedUrl = `//fast.wistia.net/embed/iframe/${wistiaId}`;
  return wistiaEmbedUrl;
}

export function getVideoThumbnail(src) {
  const isYoutube = src.match(
    /\/\/(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?([a-z0-9_\-]+)/i,
  );
  const isVimeo = src.match(
    /(http|https)?:\/\/(www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)/,
  );
  // const isWistia = src.match(/(wistia\.net|wi\.st)\/(medias|embed)\/.*/);

  let thumb;
  if (isYoutube) {
    const videoId = src.split('/')[src.split('/').length - 1];
    thumb = `https://i3.ytimg.com/vi/${videoId}/default.jpg`;
  }

  if (isVimeo) {
    const videoId = src.split('/')[src.split('/').length - 1];
    thumb = `https://vumbnail.com/${videoId}.jpg`;
  }

  // if (isWistia) {
  //   const videoId = src.split('/')[src.split('/').length - 1];
  //
  //   const response = await axios.get(
  //     `http://fast.wistia.net/oembed?url=https%3A%2F%2Fsupport.wistia.com%2Fmedias%2F${videoId}&embedType=async`,
  //   );
  //
  //   thumb = response.data.thumbnail_url;
  //
  //   return { src: `https://home.wistia.com/medias/${videoId}`, thumb };
  // }

  return thumb;
}
