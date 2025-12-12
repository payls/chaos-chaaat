/**
 * initialize intercom chat
 * @param {string} appId
 * @param {function} [callback]
 */
export function init(appId, callback = () => {}) {
  (function (w, d, id, s, x) {
    function i() {
      i.c(arguments);
    }
    i.q = [];
    i.c = function (args) {
      i.q.push(args);
    };
    w.Intercom = i;
    s = d.createElement('script');
    s.async = 1;
    s.src = 'https://widget.intercom.io/widget/' + id;
    d.head.appendChild(s);
    s.onload = () => {
      window.intercomSettings = { app_id: id };
      window.Intercom('boot', window.intercomSettings);
      callback();
    };
  })(window, document, appId);
}

/**
 * Shutdown and clean up intercom chat
 */
export function destroy() {
  if (window.Intercom) {
    window.Intercom('shutdown');
    delete window.Intercom;
    delete window.intercomSettings;
  }
}
