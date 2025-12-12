const config = require('../../configs/config')(process.env.NODE_ENV);
const axios = require('axios');

module.exports.makeAuth0Controller = () => {
  const auth0Controller = {};

  auth0Controller.generateAccessToken = async () => {
    const axiosConfig = {
      method: 'post',
      url: `https://${process.env.AUTH0_DOMAIN}${config.auth0.token}`,
      data: {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}${config.auth0.audience}`,
        grant_type: 'client_credentials',
      },
    };
    await axios(axiosConfig);
  };

  return auth0Controller;
};
