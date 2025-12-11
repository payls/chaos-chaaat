import React, { useEffect } from 'react';
import Axios from 'axios';
import { h } from '../../helpers';

export default function HttpInterceptors() {
  useEffect(() => {
    Axios.interceptors.request.use(
      (config) => {
        let accessToken = h.cookie.getAccessToken();
        config.headers = config.headers ? config.headers : {};
        if (h.notEmpty(accessToken)) {
          config.headers['x-access-token'] = accessToken;
        }
        return config;
      },
      async (error) => {
        await h.api.handleApiResponse(error.response);
      },
    );
    Axios.interceptors.response.use(
      function (response) {
        return response;
      },
      async (error) => {
        await h.api.handleApiResponse(error.response);
      },
    );
  });
  return <div></div>;
}
