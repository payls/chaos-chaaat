function PaveChat(e) {
  (e = {
    ...{
      iframeUrl: 'http://localhost:3000',
      styleUrl: 'http://localhost:3000/v1/css/pave-live-chat.css',
      user: null,
      isTECform: false,
    },
    ...e,
  }),
    (this.init = function () {
      console.log(e.container), this.construct_uis(e);
    }),
    (this.construct_uis = function (e) {
      const t = document.querySelector(e.container),
        n = document.createElement('div');
      n.setAttribute('id', 'pave-chat');
      const s = document.createElement('div');
      s.setAttribute('class', 'pave-chat-init-btn');
      const i = document.createElement('img');
      i.setAttribute(
        'src',
        'http://localhost:3110/v1/services/trigger-image?id=' + e.agency_id,
      ),
        i.setAttribute('width', '50px'),
        s.appendChild(i);
      const c = document.createElement('div');
      c.setAttribute('class', 'pave-chat-body');
      const a = document.createElement('iframe'),
        o = new URL(
          e.iframeUrl +
            '?agency_id=' +
            e.agency_id +
            '&api_key=' +
            e.api_key +
            '&isTECform=' +
            e.isTECform +
            '&language=' +
            e.language,
        );
      e.user && o.searchParams.append('user_json', JSON.stringify(e.user)),
        a.setAttribute('src', o),
        a.setAttribute('style', 'height:100%;width:100%;border:none'),
        c.appendChild(a),
        n.appendChild(c),
        n.appendChild(s),
        t.appendChild(n),
        s.addEventListener('click', function () {
          document.querySelector('button');
          c.matches('.opened')
            ? c.classList.remove('opened')
            : c.classList.add('opened');
        });
    }),
    this.init();
}
