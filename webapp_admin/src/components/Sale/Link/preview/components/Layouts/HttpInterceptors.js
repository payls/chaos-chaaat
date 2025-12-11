import React, {useEffect} from 'react';
import Axios from 'axios';
import {h} from '../../helpers';
import {h as globalHelper} from '../../../../../../helpers';

export default function HttpInterceptors() {
  useEffect(() => {
    const requestInterceptor = Axios.interceptors.request.use(
      (config) => {
        let accessToken = h.cookie.getAccessToken();
        config.headers = config.headers ? config.headers : {};
        if (h.notEmpty(accessToken)) {
          config.headers['x-access-token'] = accessToken;
        }

        console.log('---intercepted', config.data);

        if (config.data && !(config.data instanceof FormData)) {
          config.data = globalHelper.api.encodeObject(config.data);
        }
      
        if (config.params) {
          config.params = globalHelper.api.encodeObject(config.params);
        }

        return config;
      },
      async (error) => {
        await h.api.handleApiResponse(error.response);
      },
    );
    const responseInterceptor = Axios.interceptors.response.use(
      function (response) {
        return response;
      },
      async (error) => {
        const dontShowError = error.response.config.DONT_SHOW_ERROR;
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
