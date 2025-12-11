'use client';

import React from 'react';
import HeaderContentVertical from './HeaderContentVertical';
import { ToastContainer } from 'react-toastify';
import HttpInterceptors from './HttpInterceptors';
import Head from 'next/head';
import { config } from '../../configs/config';
import { h } from '../../helpers';

/**
 * Header layout
 * @returns {JSX.Element}
 * @constructor
 */
export function Header({ className = '', showHeaderContent = true }) {
  return (
    <div
      // style={{ boxShadow: ' 1px -1px 7px 0px #595959' }}
    >
      <Head>
        <title>Chaaat</title>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="https://cdn.yourpave.com/assets/favicon-32x32-kH8gKq9n.png"
        />
        <link rel="canonical" href="https://staff.chaaat.io/" />
        <meta charSet="utf-8" />

        <meta name="description" content="Pave" />
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
        <meta property="og:title" content="chaaat.io | Chaaat" />
        <meta property="og:description" content="Pave" />
        <meta property="og:url" content="https://chaaat.io/" />
        <meta property="og:site_name" content="Chaaat" />
        <meta name="allow-scripts" content="always" />
      </Head>
      <HttpInterceptors />
      {/* {showHeaderContent && <HeaderContentVertical className={className} />} */}
      {showHeaderContent && <HeaderContentVertical className={className} />}
    </div>
  );
}

/**
 * Body layout
 * @param {boolean} isLoading
 * @param {Array<{path?:string, label:string}>} breadcrumbs
 * @param {objects} children
 * @returns {JSX.Element}
 * @constructor
 */
export function Body({ className, isLoading = false, breadcrumbs, children }) {
  return (
    <div className={className || 'container-fluid no-gutters pl-0 pr-0'}>
      {isLoading && (
        <div
          data-testid="chaaat-loading-cube"
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
      {children}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer d-none">
      {/*<div className="container-fluid">*/}
      {/*	<span className="text-muted">Chaaat 2023</span>*/}
      {/*</div>*/}
    </footer>
  );
}
