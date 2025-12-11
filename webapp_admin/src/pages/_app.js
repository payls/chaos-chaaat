import React from 'react';

import '../assets/css/style.css';
import '../assets/css/dashboard.css';

import 'bootstrap/dist/css/bootstrap.min.css';

//import css from permalink
import '../components/Sale/Link/preview/assets/css/style.css';
import '../components/Sale/Link/preview/assets/css/custom-bootstrap-style.css';

import '../assets/css/custom-bootstrap-style.css';
import 'react-toastify/dist/ReactToastify.css';
import 'cropperjs/dist/cropper.css';
// The following import prevents a Font Awesome icon server-side rendering bug,
// where the icons flash from a very large icon down to a properly sized one:
import '@fortawesome/fontawesome-svg-core/styles.css';
// Prevent fontawesome from adding its CSS since we did it manually above:
import { config } from '@fortawesome/fontawesome-svg-core';

import { config as paveConfig } from '../configs/config';

config.autoAddCss = false; /* eslint-disable import/first */

export default function WebappAdmin({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
