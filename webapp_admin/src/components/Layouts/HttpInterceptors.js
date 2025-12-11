import React, { useEffect } from 'react';
import Axios from 'axios';
import { h } from '../../helpers';

export default function HttpInterceptors() {
  useEffect(() => {
    const requestInterceptor = Axios.interceptors.request.use(
      (config) => {
        let accessToken = h.cookie.getAccessToken();
        config.headers = config.headers ? config.headers : {};
        if (h.notEmpty(accessToken)) {
          config.headers['x-access-token'] = accessToken;
        }
  
        if (config.data && !(config.data instanceof FormData)) {
          config.data = h.api.encodeObject(config.data);
        }
      
        if (config.params) {
          config.params = h.api.encodeObject(config.params);
        }
        
        return config;
      },
      async (error) => {
        // Handle Request error
        h.sentry.captureException(error);
        await h.api.handleApiResponse(error.response);
      },
    );
    const responseInterceptor = Axios.interceptors.response.use(
      function (response) {
        return response;
      },
      async (error) => {
        // Handle Request error
        const dontShowError = error.response?.config?.DONT_SHOW_ERROR;
        if (!dontShowError) h.sentry.captureException(error);
        await h.api.handleApiResponse(error.response, !dontShowError);
      },
    );
    return () => {
      Axios.interceptors.request.eject(requestInterceptor);
      Axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);
  return <div></div>;
}
