const Sentry = require('@sentry/node');
require('newrelic');
const environment = process.env.NODE_ENV || 'development';
if (environment === 'development') require('dotenv').config({ path: '.env' });
const config = require('./server/configs/config')(environment);
const path = require('path');
const h = require('./server/helpers');

if (h.cmpStr(environment, 'production')) {
  Sentry.init({
    dsn: 'https://9aa8a442f8374170f85b36769e20b6a3@o4505836464701440.ingest.sentry.io/4505836480167936',
    environment: process.env.NODE_ENV,
  });
}

const RabbitMq = require('./server/helpers/rabbitmq');

const fastify = require('fastify')({
  logger: true,
  bodyLimit: 504857600,
});

(async () => {
  const rabbitmq = new RabbitMq({ config, log: fastify.log });
  await rabbitmq.init();
  fastify.decorateRequest('rabbitmq', rabbitmq);
})().catch((err) => {
  fastify.log('RabbitMQ Init Error', { err });
});

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

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
  list: false,
});

if (environment !== 'development') {
  fastify.register(require('fastify-helmet'), {
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
fastify.register(require('fastify-cors'), {
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
fastify.register(require('fastify-jwt'), { secret: process.env.JWT_SECRET });
fastify.register(require('fastify-rate-limit'), {
  max: 100,
  timeWindow: '1 minute',
});
fastify.register(require('fastify-multipart'), {
  attachFieldsToBody: true,
  limits: {
    fieldNameSize: 100, // Max field name size in bytes
    fieldSize: 1000000, // Max field value size in bytes
    fields: 10, // Max number of non-file fields
    fileSize: 20 * 1024 * 1024, // For multipart forms, the max file size
    files: 1, // Max number of file fields
    headerPairs: 2000, // Max number of header key=>value pairs
  },
});

// fastify.addHook("onRequest", async (request, reply) => {
// 	try {
// 		await request.jwtVerify()
// 	} catch (err) {
// 		reply.send(err)
// 	}
// });

// fastify.register(require('fastify-nextjs'));
// fastify.after(() => {
// Client side routes
// fastify.next('/');
// fastify.next('/login');
// fastify.next('/confirm');
// fastify.next('/logout');
// fastify.next('/dashboard');
// });

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
fastify.register(require('./server/routes/index'));

// Staff Portal
fastify.register(require('./server/routes/v1/staff/integrations/hubspot'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/integrations/salesforce'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/integrations/tray'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/integrations/webhook'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/integrations/gmail'), {
  prefix: '/v1',
});

const start = async () => {
  try {
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

    await fastify.listen(
      process.env.PORT || 8080,
      process.env.DOCKER_API_HOST || 'localhost',
    );
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
