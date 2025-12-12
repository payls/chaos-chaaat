module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/services/csrf',
    handler: async (req, reply) => {
      const token = await reply.generateCsrf();
      return { token };
    },
  });

  next();
};
