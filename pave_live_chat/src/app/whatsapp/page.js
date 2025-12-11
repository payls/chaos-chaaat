'use client';

import Image from 'next/image';
import h from '../services/helpers';
import IconChevronLeft from '../components/Icons/IconChevronLeft';
import IconWhatsApp from '../components/Icons/IconWhatsApp';

export default function index() {
  const phone = h.findGetParameter('phone');
  const text = h.findGetParameter('text');

  return (
    <main id="pave-chat">
      <div className="pave-chat-body">
        <div
          className="pave-chat-welcome"
          style={{
            backgroundColor: '#02021e',
          }}
        >
          <div>
            <Image
              src="https://cdn.yourpave.com/assets/chaaat-logo.png"
              width={80}
              height={80}
              alt="Pave Logo"
            />
            <div className="pave-chat-welcome-greet">
              Hello 👋
              <br />
              <span>How can we help?</span>
            </div>
            <div className="pave-chat-welcome-actions">
              <button
                type="button"
                className="pave-chat-btn btn-red"
                onClick={() => {
                  window.open(
                    'https://wa.me/' + phone + '?text=' + text,
                    '_blank',
                  );
                }}
                style={{
                  background: 'rgb(60,166,229)',
                  background:
                    'linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%)',
                  border: 'none',
                  padding: '15px 30px !important',
                }}
              >
                <span
                  style={{
                    color: '#fff !important',
                  }}
                >
                  <IconWhatsApp
                    color="#fff"
                    width="20px"
                    style={{
                      display: 'inline-block',
                      verticalAlign: 'sub',
                    }}
                  />{' '}
                  Chat With Us
                </span>
                <IconChevronLeft
                  color="#fff"
                  width="20px"
                  style={{ transform: 'rotate(180deg)' }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
