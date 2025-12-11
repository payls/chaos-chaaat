function PaveWhatsApp(e) {
  (e = {
    ...{
      iframeUrl: 'https://livechat.yourpave.com/whatsapp',
      styleUrl: 'https://livechat.yourpave.com/v1/css/pave-live-chat.css',
      user: null,
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
      s.setAttribute('class', 'pave-chat-init-btn no-bg');
      const i = document.createElement('img');
      i.setAttribute(
        'src',
        'https://api.chaaat.io/v1/services/trigger-image?id=' + e.agency_id,
      ),
        i.setAttribute('width', '50px'),
        s.appendChild(i);
      const c = document.createElement('div');
      c.setAttribute('class', 'pave-chat-body wa');
      const a = document.createElement('iframe'),
        o = new URL(e.iframeUrl + '?phone=' + e.phone + '&text=' + e.text);
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
