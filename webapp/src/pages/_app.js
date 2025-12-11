import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/scss/style.scss';
import '../assets/css/custom-bootstrap-style.css';
import 'react-toastify/dist/ReactToastify.css';
import 'cropperjs/dist/cropper.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { config } from '../configs/config';
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

export default function Webapp({ Component, pageProps }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10000,
          },
        },
      }),
  );

  return (
    <GoogleOAuthProvider clientId={config.googleAuth.clientId}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <Component {...pageProps} />
        </Hydrate>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
