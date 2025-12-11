import React from 'react';
import HeaderContent from './HeaderContent';
import { ToastContainer } from 'react-toastify';
import HttpInterceptors from './HttpInterceptors';
import Head from 'next/head';
import FooterContent from './FooterContent';
import { useRouter } from 'next/router';
import { config } from '../../configs/config';
import { h } from '../../helpers';
import { Container, Nav, Navbar } from 'react-bootstrap';

import {
  faLaptop,
  faMobileAlt,
  faTabletAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function PreviewHeader({ selectedPreview, setSelectedPreview }) {
  const icons = {
    faMobileAlt: { icon: faMobileAlt, class: 'mobile-preview' },
    faTabletAlt: { icon: faTabletAlt, class: 'tablet-preview' },
    faLaptop: { icon: faLaptop, class: 'desktop-preview' },
  };
  return (
    <Navbar
      className="pt-5 pt-lg-4 pb-5 pb-lg-3 d-none d-lg-flex"
      expand="lg"
      style={{ backgroundColor: 'grey' }}
    >
      <Container>
        <Navbar.Collapse>
          {Object.keys(icons).map((icon) => (
            <Nav
              className={'m-auto'}
              onClick={() => setSelectedPreview(icons[icon].class)}
            >
              <FontAwesomeIcon
                className={
                  selectedPreview === icons[icon].class
                    ? 'selected-preview preview-icon'
                    : 'preview-icon'
                }
                size="3x"
                icon={icons[icon].icon}
              />{' '}
            </Nav>
          ))}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

/**
 * Header layout
 * @returns {JSX.Element}
 * @constructor
 */
export function Header({
  className = '',
  title,
  titlePaveEnding = true,
  description = 'Share your business-critical real estate project information with prospects with ease. ' +
    'And get real-time, actionable feedback. Track Engagement. White-labeled for Agents and Developers. Access From Any Device.',
  imageOg = 'https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/pave-ogimage.jpg',
  imageTwitter = 'https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/pave-ogimage.jpg',
  showHeaderContent = true,
}) {
  if (h.notEmpty(title)) {
    if (titlePaveEnding) {
      title = title + ' | Chaaat';
    }
  } else {
    title = 'Chaaat - Share & Track Project Information with Prospects';
  }
  const router = useRouter();
  const current_url = `${config.webUrl}${router.pathname}`;
  return (
    <div>
      <Head>
        <title>{title}</title>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="https://cdn.yourpave.com/assets/favicon-32x32-kH8gKq9n.png"
        />
        <link
          rel="apple-touch-icon"
          href="https://cdn.yourpave.com/assets/favicon-32x32-kH8gKq9n.png"
        />
        <link rel="canonical" href={current_url} />
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />

        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={current_url} />
        <meta property="og:site_name" content="Pave" />
        <meta property="og:image" content={imageOg} />

        <meta name="twitter:image" content={imageTwitter} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:site" content={current_url} />
        <meta name="twitter:creator" content="Pave" />

        {h.cmpStr(config.env, 'production') && (
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-LQSTRFVLEB"
          ></script>
        )}
        {h.cmpStr(config.env, 'production') && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
					  window.dataLayer = window.dataLayer || [];
					  function gtag(){dataLayer.push(arguments);}
					  gtag('js', new Date());
					  gtag('config', 'G-LQSTRFVLEB');
					`,
            }}
          />
        )}

        {h.cmpStr(config.env, 'production') && (
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=UA-189461784-1"
          ></script>
        )}
        {h.cmpStr(config.env, 'production') && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
					  window.dataLayer = window.dataLayer || [];
					  function gtag(){dataLayer.push(arguments);}
					  gtag('js', new Date());
					  gtag('config', 'UA-189461784-1');
					`,
            }}
          />
        )}

        {/* Start VWO Async SmartCode */}
        {h.cmpStr(config.env, 'production') && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
						window._vwo_code = window._vwo_code || (function(){
						var account_id=557419,
						settings_tolerance=2000,
						library_tolerance=2500,
						use_existing_jquery=false,
						is_spa=1,
						hide_element='body',
						/* DO NOT EDIT BELOW THIS LINE */
						f=false,d=document,code={use_existing_jquery:function(){return use_existing_jquery;},library_tolerance:function(){return library_tolerance;},finish:function(){if(!f){f=true;var a=d.getElementById('_vis_opt_path_hides');if(a)a.parentNode.removeChild(a);}},finished:function(){return f;},load:function(a){var b=d.createElement('script');b.src=a;b.type='text/javascript';b.innerText;b.onerror=function(){_vwo_code.finish();};d.getElementsByTagName('head')[0].appendChild(b);},init:function(){
						window.settings_timer=setTimeout(function () {_vwo_code.finish() },settings_tolerance);var a=d.createElement('style'),b=hide_element?hide_element+'{opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important;}':'',h=d.getElementsByTagName('head')[0];a.setAttribute('id','_vis_opt_path_hides');a.setAttribute('type','text/css');if(a.styleSheet)a.styleSheet.cssText=b;else a.appendChild(d.createTextNode(b));h.appendChild(a);this.load('https://dev.visualwebsiteoptimizer.com/j.php?a='+account_id+'&u='+encodeURIComponent(d.URL)+'&f='+(+is_spa)+'&r='+Math.random());return settings_timer; }};window._vwo_settings_timer = code.init(); return code; }());
					`,
            }}
          />
        )}
        {/* End VWO Async SmartCode */}

        {/* Start Facebook Pixel Code */}
        {h.cmpStr(config.env, 'production') && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
						!function(f,b,e,v,n,t,s)
						{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
						n.callMethod.apply(n,arguments):n.queue.push(arguments)};
						if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
						n.queue=[];t=b.createElement(e);t.async=!0;
						t.src=v;s=b.getElementsByTagName(e)[0];
						s.parentNode.insertBefore(t,s)}(window, document,'script',
						'https://connect.facebook.net/en_US/fbevents.js');
						fbq('init', '3970808589679731');
						fbq('track', 'PageView');
					`,
            }}
          />
        )}
        {h.cmpStr(config.env, 'production') && (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `
						<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=3970808589679731&ev=PageView&noscript=1"/>
					`,
            }}
          />
        )}
        {/* End Facebook Pixel Code */}

        {/* Start Facebook Login Code */}
        {h.cmpStr(config.env, 'production') && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
						window.fbAsyncInit = function() {
							FB.init({
							  appId      : '244944790716805',
							  cookie     : true,
							  xfbml      : true,
							  version    : 'v10.0'
							});
							  
							FB.AppEvents.logPageView();   
						};
						(function(d, s, id){
						 var js, fjs = d.getElementsByTagName(s)[0];
						 if (d.getElementById(id)) {return;}
						 js = d.createElement(s); js.id = id;
						 js.src = "https://connect.facebook.net/en_US/sdk.js";
						 fjs.parentNode.insertBefore(js, fjs);
						}(document, 'script', 'facebook-jssdk'));
					`,
            }}
          />
        )}
        {/* End Facebook Login Code */}

        {h.cmpStr(config.env, 'production') && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
						 (function(h,o,t,j,a,r){
							h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
							h._hjSettings={hjid:2454011,hjsv:6};
							a=o.getElementsByTagName('head')[0];
							r=o.createElement('script');r.async=1;
							r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
							a.appendChild(r);
						})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
					`,
            }}
          />
        )}
      </Head>
      <HttpInterceptors />
      {showHeaderContent && <HeaderContent className={className} />}
    </div>
  );
}

/**
 * Body layout
 * @param {{
 *     className?:string,
 *     isLoading?:boolean,
 *     breadcrumbs?:Array<{path?:string, label:string}>,
 *     children?:objects
 * }} options
 * @returns {JSX.Element}
 * @constructor
 */
export function Body({ className, isLoading = false, breadcrumbs, children }) {
  return (
    <div className={className || 'container-fluid no-gutters pl-0 pr-0'}>
      {isLoading && (
        <div
          style={{
            content: '',
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              marginLeft: -30,
              marginTop: -80,
              fontSize: '30px',
              fontWeight: 'bold',
            }}
          >
            <div className="sk-cube-grid">
              <div className="sk-cube sk-cube1"></div>
              <div className="sk-cube sk-cube2"></div>
              <div className="sk-cube sk-cube3"></div>
              <div className="sk-cube sk-cube4"></div>
              <div className="sk-cube sk-cube5"></div>
              <div className="sk-cube sk-cube6"></div>
              <div className="sk-cube sk-cube7"></div>
              <div className="sk-cube sk-cube8"></div>
              <div className="sk-cube sk-cube9"></div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
      {/*<CommonBreadcrumb breadcrumbs={breadcrumbs} />*/}
      {children}
    </div>
  );
}

export function Footer({ isLoading = false }) {
  return <FooterContent isLoading={isLoading} />;
}
