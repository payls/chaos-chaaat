const Sentry = require('@sentry/node');
const { v4 } = require('uuid');
const environment = process.env.NODE_ENV || 'development';
if (environment === 'development') require('dotenv').config({ path: '.env' });
const config = require('./server/configs/config')(environment);
const path = require('path');
const h = require('./server/helpers');
const userMiddleware = require('./server/middlewares/user');
const dataMiddleware = require('./server/middlewares/data');
const RabbitMQ = require('./server/services/vendors/rabbitmq');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.init({
    dsn: 'https://9aa8a442f8374170f85b36769e20b6a3@o4505836464701440.ingest.us.sentry.io/4505836480167936',
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

(async () => {
  const rabbitmq = new RabbitMQ({ config, log: fastify.log });
  await rabbitmq.init();
  fastify.decorateRequest('rabbitmq', { getter: () => rabbitmq });
})().catch((err) => {
  Sentry.captureException(err);
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

  if (error.statusCode === 400) {
    request.log.warn(error);
    return h.api.createResponse(
      request,
      reply,
      400,
      error,
      '400 - bad request'
    );
  }

  request.log.error(error);

  request.log.error(
    {
      route: request.raw.originalUrl,
      error,
    },
    'API > Generic Error Catcher',
  );

  h.api.createResponse(
    request,
    reply,
    reply.statusCode || 500,
    { route: request.url, error },
    '2-generic-001',
  );
});

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
  list: false,
});

if (environment !== 'development') {
  fastify.register(require('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'api.chaaat.io'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'https://cdn.yourpave.com http://www.w3.org data:'],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
}
fastify.register(require('@fastify/cors'), {
  origin: function (origin, callback) {
    const whitelist = config.corsSettings.api.whitelistOrigins;
    const noOriginMessage = `The CORS policy for this site does not allow access from unknown.`;
    console.log(`ORIGIN: ${origin}`);
    // if (!origin) return callback(new Error(noOriginMessage), false);
    // Need to deal with no origin request. for now disabling it
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (whitelist && whitelist.length > 0) {
      let isAllowed = false;
      for (const allowed of whitelist) {
        const allowedOriginRegex = new RegExp(allowed);
        if (!isAllowed) isAllowed = allowedOriginRegex.test(origin);
      }

      if (isAllowed) {
        return callback(null, true);
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
    'Content-Disposition',
    'Access-Control-Expose-Headers',
    'x-component-secret',
    'x-csrf-token',
    'Cookie',
  ],
  preflightContinue: true,
  methods: 'GET,POST,OPTIONS,PUT,DELETE,PATCH',
  maxAge: 86400,
});
fastify.register(require('@fastify/jwt'), { secret: process.env.JWT_SECRET });

fastify.register(require('@fastify/multipart'), {
  attachFieldsToBody: true,
  limits: {
    fieldNameSize: 100, // Max field name size in bytes
    fieldSize: 1000000, // Max field value size in bytes
    fields: 10, // Max number of non-file fields
    fileSize: 100 * 1024 * 1024, // For multipart forms, the max file size
    files: 1, // Max number of file fields
    headerPairs: 2000, // Max number of header key=>value pairs
  },
});

fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/csrf-protection'));
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

// API endpoints
// Public
fastify.addHook('onRequest', (request, reply, done) => {
  const requestId = v4();
  request.id = requestId;
  request.log = request.log.child({ requestId });
  request.log.info({
    origin: (request.headers && request.headers.origin) || 'no-origin',
    referer: (request.headers && request.headers.referer) || 'no-referer',
    url: request.url,
  });

  if (request.url === '/') {
    return done();
  }

  if (
    [
      '/v1/services/mindbody-webhook',
      '/v1/services/mindbody-update-packages',
      '/v1/services/mindbody-update-contact',
      '/v1/services/trigger-image',
      '/v1/wix/webhook',
      '/v1/staff/agency/check-full-subscription-capacity',
      '/v1/calendar/googlecalendar/:agency_id/:crm_settings_id/available-timeslot',
      '/v1/calendar/outlookcalendar/:agency_id/:crm_settings_id/available-timeslot',
      '/v1/staff/agency/check-trial-subscription',
    ].includes(request.context.config.url) // needs to be checked when fastify is upgraded to 5
  ) {
    return done();
  }

  if (!request.headers || !request.headers.origin) {
    request.log.info({
      url: request.url,
      message: 'Request has no Origin, validating if Authorized.',
    });
    return userMiddleware.isAuthorizedComponent(request, reply, done);
  }

  done();
});

// implement a global hook for handling sanitize of request data
fastify.addHook('preValidation', (request, reply, done) => {
  console.log(request.context.config.url);
  if (
    ['/v1/staff/upload/:upload_type'].includes(request.context.config.url) // needs to be checked when fastify is upgraded to 5
  ) {
    return done();
  }
  dataMiddleware.sanitizeRequest(request, reply);
  done();
});

fastify.register(require('./server/routes/index'));
fastify.register(require('./server/routes/v1/auth'), { prefix: '/v1' });
fastify.register(require('./server/routes/v1/upload'), { prefix: '/v1' });
fastify.register(require('./server/routes/v1/download'), { prefix: '/v1' });
fastify.register(require('./server/routes/v1/contact'), { prefix: '/v1' });
fastify.register(require('./server/routes/v1/contactActivity'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/general'), { prefix: '/v1' });
fastify.register(require('./server/routes/v1/userSavedProperty'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/task'), { prefix: '/v1' });
fastify.register(require('./server/routes/v1/taskMessage'), { prefix: '/v1' });
fastify.register(require('./server/routes/v1/shortlistedProperty'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/shortlistedProject'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/shortlistedProjectComment'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/shortlistedPropertyComment'), {
  prefix: '/v1',
});
fastify.register(
  require('./server/routes/v1/shortlistedPropertyCommentReaction'),
  { prefix: '/v1' },
);
fastify.register(
  require('./server/routes/v1/shortlistedProjectCommentReaction'),
  { prefix: '/v1' },
);
fastify.register(require('./server/routes/v1/agency'), { prefix: '/v1' });

fastify.register(require('./server/routes/v1/lead'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/proposalTemplate'), {
  prefix: '/v1',
});

fastify.register(
  require('./server/routes/v1/shortlistedProjectProposalTemplate'),
  { prefix: '/v1' },
);

fastify.register(require('./server/routes/v1/whatsapp'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/wix'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/agency_user'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/appSync'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/liveChat'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/line'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/meta'), {
  prefix: '/v1',
});

// v2 non staff
fastify.register(require('./server/routes/v2/contact'), {
  prefix: '/v2',
});

fastify.register(require('./server/routes/v2/project'), {
  prefix: '/v2',
});

fastify.register(require('./server/routes/v2/project_property'), {
  prefix: '/v2',
});

// Staff Portal
fastify.register(require('./server/routes/v1/staff/auth'), { prefix: '/v1' });
fastify.register(require('./server/routes/v1/staff/upload'), { prefix: '/v1' });
fastify.register(require('./server/routes/v1/staff/download'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/agency'), { prefix: '/v1' });
fastify.register(require('./server/routes/v1/staff/agency_user'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/contact'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/contactActivity'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/contactLink'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/dashboard'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/task'), { prefix: '/v1' });
fastify.register(require('./server/routes/v1/staff/taskMessage'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/userSavedProperty'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/project'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/project_property'), {
  prefix: '/v1',
});
fastify.register(
  require('./server/routes/v1/staff/shortlistedPropertyComment'),
  { prefix: '/v1' },
);
fastify.register(
  require('./server/routes/v1/staff/shortlistedProjectComment'),
  { prefix: '/v1' },
);
fastify.register(
  require('./server/routes/v1/staff/shortlistedPropertyCommentReaction'),
  { prefix: '/v1' },
);
fastify.register(require('./server/routes/v1/staff/userManagement'), {
  prefix: '/v1',
});
fastify.register(require('./server/routes/v1/staff/agencyReport'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/contactView'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/shortlistedProject'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/proposalTemplate'), {
  prefix: '/v1',
});

fastify.register(
  require('./server/routes/v1/staff/shortlistedProjectProposalTemplate'),
  { prefix: '/v1' },
);

fastify.register(require('./server/routes/v1/staff/whatsappMessageTracker'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/whatsappChat'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/whatsappTemplate'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/whatsappFlow'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/unifiedInbox'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/campaignSchedule'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/contactList'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/contactListUser'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/liveChat'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/lineChat'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/messengerChat'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/messenger'), {
  prefix: '/v1',
});

// @TODO will delete all cron related code once the cloudwatch event has been integrated and tested.
if (process.env.CRON_ENABLED === 'true') {
  fastify.register(require('./server/services/cron'));
}

fastify.register(
  require('./server/routes/v1/services/emailNotificationSettingNoAuth'),
  {
    prefix: '/v1',
  },
);

fastify.register(require('./server/routes/v1/services/csrf'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/services/mindbody'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/services/image'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/smsMessageTracker'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/agencyCustomLandingPage'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/emailNotificationSetting'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/agencyCustomLandingPage'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/automation'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/automationWorkflow'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/integration'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/appSync'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/contactNote'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/liveChatSettings'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/lineTemplate'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/lineMessageTracker'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/salesforceReports'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/salesforceContacts'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/calendar'), {
  prefix: '/v1'
});

fastify.register(require('./server/routes/v1/staff/appointmentBooking'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v1/staff/hubSpotContacts'), {
  prefix: '/v1',
});

fastify.register(require('./server/routes/v2/crm_settings'), {
  prefix: '/v2',
});

fastify.register(require('./server/routes/v2/agency_oauth'), {
  prefix: '/v2',
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
    Sentry.captureException(err);
    console.error(err);
    process.exit(1);
  });
