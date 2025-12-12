const Sentry = require('@sentry/node');
const h = require('../helpers');

async function crypto(fastify, opts, done) {
  try {
    const encryptionKeys = await h.crypto.getEncryptionKeys();
    fastify.decorateRequest('ek', {
      getter: () => ({ ek: JSON.parse(encryptionKeys) }),
    });
    return done();
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    process.exit(1);
  }
}

module.exports = crypto;
