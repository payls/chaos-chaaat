import { config } from '../configs/config';

/**
 * initialize chaaat chat
 * @param {string} appId
 * @param {function} [callback]
 */
export function init(options, callback = () => {}) {
  (function (w, d, op, s, x) {
    function i() {
      i.c(arguments);
    }
    i.q = [];
    i.c = function (args) {
      i.q.push(args);
    };
    w.ChaaatChat = i;
    s = d.createElement('script');
    s.async = 1;
    s.src = config.liveChatUrl;

    const fileref = document.createElement('link');
    fileref.rel = 'stylesheet';
    fileref.type = 'text/css';
    fileref.href = config.liveChatCSSUrl;

    d.head.appendChild(fileref);
    d.head.appendChild(s);
    s.onload = () => {
      window.ChaaatChat(options);
      callback();
    };
  })(window, document, options);
}

// /**
//  * Shutdown and clean up chaaat chat
//  */
// export function destroy() {
//   if (window.ChaaatApp) {
//     window.ChaaatApp('shutdown');
//     delete window.ChaaatApp;
//     delete window.ChaaatAppSettings;
//   }
// }
