const axios = require('axios');
const generalHelper = require('./general');

const h = {
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
  cmpStr: generalHelper.cmpStr,
  cmpInt: generalHelper.cmpInt,
  cmpBool: generalHelper.cmpBool,
  getMessageByCode: generalHelper.getMessageByCode,
};
const slackHelper = module.exports;

slackHelper.sendMessage = async ({ message }) => {
  const data = JSON.stringify({
    text: `${message}`,
  });

  const channel_url = h.cmpStr(process.env.NODE_ENV, 'production')
    ? 'https://hooks.slack.com/services/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'
    : 'https://hooks.slack.com/services/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';

  const config = {
    method: 'post',
    url: channel_url,
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  };

  await axios(config)
    // eslint-disable-next-line promise/always-return
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
};
