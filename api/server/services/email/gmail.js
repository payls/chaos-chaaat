const Sentry = require('@sentry/node');
const gmailService = module.exports;
const nodemailer = require('nodemailer');
const h = require('../../helpers');
const constant = require('../../constants/constant.json');
const { default: axios } = require('axios');
const { google } = require('googleapis');
const request = require('request');
const { notEmpty } = require('../../helpers');
const config = require('../../configs/config')(process.env.NODE_ENV);

/**
 * Get access and refresh token with authentication code
 * @param {string} code
 * @returns { error: boolean, access_token: string, refresh_token: string} */
gmailService.getTokens = async (code) => {
  let res = {
    error: true,
    access_token: null,
    refresh_token: null,
  };

  const authOptions = {
    url: 'https://oauth2.googleapis.com/token',
    method: 'POST',
    form: {
      code,
      client_id: config.gmail.web.client_id,
      client_secret: config.gmail.web.client_secret,
      redirect_uri: config.gmail.web.javascript_origins,
      grant_type: 'authorization_code',
    },
    headers: {
      Accept: 'application/json',
      origin: config.gmail.web.javascript_origins,
    },
  };

  const googleResponse = await new Promise((resolve, reject) => {
    request(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        resolve({
          error: false,
          access_token: JSON.parse(body).access_token,
          refresh_token: JSON.parse(body).refresh_token,
        });
      }
      reject(error);
    });
  });

  if (notEmpty(googleResponse)) {
    res = googleResponse;
  }

  return res;
};

/**
 *
 * @param {string} webhookTrigger
 * @param {string} gmailId
 * @param {string} receiverEmail
 * @param {string} receiverName
 * @param {string} senderEmail
 * @param {string} senderName
 * @param {string} [subject]
 * @param {string} [body]
 * @param {string} [hubspotBccId]
 * @returns {Promise<{email_sent: boolean}>} */

gmailService.sendGmailEmail = async ({
  receiverEmail,
  senderEmail,
  senderName,
  subject,
  body,
  accessToken,
  refreshToken,
}) => {
  let email_sent = false;

  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: senderEmail,
        clientId: config.gmail.web.client_id,
        clientSecret: config.gmail.web.client_secret,
        accessToken,
        refreshToken,
      },
    });

    // send mail with defined transport object
    await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`, // sender address
      to: receiverEmail, // list of receivers
      text: body, // plain text body
      html: body,
      subject, // Subject line
    });
    email_sent = true;
  } catch (err) {
    Sentry.captureException(err);
    console.log('💥💥💥💥💥💥💥START ERROR💥💥💥💥💥💥💥');
    console.log(err);
    console.log('💥💥💥💥💥💥💥END ERROR💥💥💥💥💥💥💥');
  }

  return email_sent;
};
