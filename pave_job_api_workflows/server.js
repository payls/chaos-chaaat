// require('newrelic');
const environment = process.env.NODE_ENV || 'development';
if (environment === 'development') require('dotenv').config({ path: '.env' });
const config = require('./server/configs/config')(environment);
const Amq = require('./server/amq');
const h = require('./server/helpers');
const Sentry = require('@sentry/node');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.init({
    dsn: 'https://2f6ec47044dc5afceaf45e3d70de82d8@o4505836464701440.ingest.us.sentry.io/4505837206700032',
    environment: process.env.NODE_ENV,
  });
}

const fastify = require('fastify')({
  logger: true,
  bodyLimit: 504857600,
});

async function loadSecret(_fastify) {
  const encryptionKeys = await h.crypto.getEncryptionKeys();
  _fastify.decorateRequest('ek', {
    getter: () => ({ ek: JSON.parse(encryptionKeys) }),
  });
  return _fastify;
}

fastify.setErrorHandler(async (error, request, reply) => {
  if (String(error).indexOf('CORS') > -1) {
    request.log.warn(
      {
        route: request.raw.originalUrl,
        error: String(error),
      },
      'API > CORS Error Catcher',
    );

    return reply.status(403).send({
      message: 'Not Allowed.',
    });
  }

  if (String(error).indexOf('csrf') > -1) {
    request.log.warn(
      {
        route: request.raw.originalUrl,
        error: String(error),
      },
      'API > CSRF Error Catcher',
    );
    return reply.status(403).send({
      message: 'Forbidden',
    });
  }

  request.log.warn(
    {
      route: request.raw.originalUrl,
      error,
    },
    'API > Generic Error Catcher',
  );

  h.api.createResponse(
    reply,
    reply.statusCode || 500,
    { route: request.url, error },
    '2-generic-001',
    { origin: request.headers.origin },
  );
});

if (environment !== 'development') {
  fastify.register(require('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'api-integrations.yourpave.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'https://cdn.yourpave.com http://www.w3.org data:'],
        upgradeInsecureRequests: [],
      },
    },
  });
}
fastify.register(require('@fastify/cors'), {
  origin: function (origin, callback) {
    const whitelist = config.corsSettings.api.whitelistOrigins;
    if (whitelist && whitelist.length > 0) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      for (let i = 0; i < whitelist.length; i++) {
        const whitelistOrigin = whitelist[i];
        if (h.cmpStr(whitelistOrigin, origin)) {
          // if (h.general.validateRegex(whitelistOrigin)) {
          // 	if (whitelistOrigin.test(origin)) {
          return callback(null, true);
          // }
        } else {
          if (origin.indexOf(whitelistOrigin) > -1) {
            return callback(null, true);
          }
        }
      }
      const msg = `The CORS policy for this site does not allow access from the specified Origin '${origin}'.`;
      return callback(new Error(msg), false);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  allowedHeaders: [
    'Authorization',
    'Accept',
    'Origin',
    'DNT',
    'Keep-Alive',
    'User-Agent',
    'X-Requested-With',
    'If-Modified-Since',
    'Cache-Control',
    'Content-Type',
    'Content-Range',
    'Range',
    'x-access-token',
  ],
  preflightContinue: true,
  methods: 'GET,POST,OPTIONS,PUT,DELETE,PATCH',
  maxAge: 86400,
});
fastify.register(require('@fastify/jwt'), { secret: process.env.JWT_SECRET });
fastify.register(require('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute',
});

fastify.addHook('onRequest', (request, reply, done) => {
  request.log.info({
    origin: (request.headers && request.headers.origin) || 'no-origin',
    referer: (request.headers && request.headers.referer) || 'no-referer',
    url: request.url,
  });

  done();
});

// API endpoints
// Public
fastify.route({
  method: 'GET',
  url: '/',
  handler: async (request, reply) => {
    return {
      message: 'success',
    };
  },
});

const start = async () => {
  const additionalConfig = {};
  const secretKeys = await h.crypto.getEncryptionKeys();
  additionalConfig.ek = JSON.parse(secretKeys);
  const amq = new Amq({ log: fastify.log, config, additionalConfig });
  try {
    await amq.startProcess();
    await fastify.register(require('@fastify/rate-limit'), {
      global: true,
      max: 5000,
      timeWindow: '1 minute',
    });

    fastify.setNotFoundHandler(
      {
        preHandler: fastify.rateLimit({
          max: 10,
          timeWindow: '1 minute',
        }),
      },
      function (request, reply) {
        request.log.warn({
          url: request.url,
          message: 'Invalid Route',
        });
        reply.code(404).send({ message: 'route not found' });
      },
    );

    await fastify.listen({
      port: process.env.PORT || 8080,
      host: process.env.DOCKER_API_HOST || 'localhost',
    });
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

loadSecret(fastify)
  .then(() => {
    return start();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
