// const h = require('../helpers');
const path = require('path');
const fs = require('fs');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/',
    // preValidation: async (request, reply) => {
    // 	await userMiddleware.isLoggedIn(request, reply);
    // },
    handler: async (request, reply) => {
      // await h.file.downloadFile(
      //   'https://lh3.googleusercontent.com/a-/AOh14GhxwscLhuVbZCUnPCBY3712ZIIV_GKvQnvS7HVloXQ=s96-c',
      // );
      // h.api.createResponse(
      //   request,
      //   reply,
      //   200,
      //   { hello: 'world' },
      //   '1-login-1601650244920',
      // );

      reply.status(200).send({ hello: 'world' });
    },
  });

  // @TODO update code to use env vars.
  fastify.route({
    method: 'GET',
    url: '/7f720acb5582acc68146a16a059c2769.txt',
    handler: async (request, reply) => {
      const stream = fs.createReadStream(
        path.join(
          __dirname,
          '..',
          '..',
          '/7f720acb5582acc68146a16a059c2769.txt',
        ),
      );
      reply.type('text/plain').send(stream);
    },
  });

  next();
};
