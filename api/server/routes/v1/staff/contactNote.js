const Sentry = require('@sentry/node');
const models = require('../../../models');
const h = require('../../../helpers');
const c = require('../../../controllers');
const userMiddleware = require('../../../middlewares/user');
const config = require('../../../configs/config')(process.env.NODE_ENV);

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'POST',
    url: '/staff/contact-note/create',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const { contact_id, agency_user_id, note } = request.body;
      try {
        await h.database.transaction(async (transaction) => {
          await c.contactNoteCtlr.create(
            {
              contact_fk: contact_id,
              agency_user_fk: agency_user_id,
              note,
            },
            { transaction },
          );
        });
        h.api.createResponse(
          request,
          reply,
          200,
          {},
          'contact-note-1692757100-create-success',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          'contact-note-1692757100-create-failed',
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/contact-note/:contact_id',
    schema: {
      params: {
        type: 'object',
        required: ['contact_id'],
        properties: {
          contact_id: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const { contact_id } = request.params;
      try {
        const contactNote = await c.contactNoteCtlr.findAll(
          {
            contact_fk: contact_id,
          },
          {
            include: [
              {
                model: models.agency_user,
                require: false,
                include: [{ model: models.user }],
              },
            ],
          },
        );
        h.api.createResponse(
          request,
          reply,
          200,
          { contactNote },
          'contact-note-1692757100-retrieve-success',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          'contact-note-1692757100-retrieve-failed',
        );
      }
    },
  });

  fastify.route({
    method: 'PUT',
    url: '/staff/contact-note/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          contact_id: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const { note } = request.body;
      try {
        const contactNote = await c.contactNoteCtlr.findOne({
          contact_note_id: id,
        });
        if (h.notEmpty(contactNote)) {
          await h.database.transaction(async (transaction) => {
            await c.contactNoteCtlr.update(
              id,
              {
                note,
              },
              { transaction },
            );
          });

          h.api.createResponse(
            request,
            reply,
            200,
            {},
            'contact-note-1692757100-update-success',
          );
        } else {
          h.api.createResponse(
            request,
            reply,
            400,
            {},
            'contact-note-1692757100-update-not-found',
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          'contact-note-1692757100-update-failed',
        );
      }
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/staff/contact-note/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          contact_id: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      try {
        await c.contactNoteCtlr.destroy({
          contact_note_id: id,
        });

        h.api.createResponse(
          request,
          reply,
          200,
          {},
          'contact-note-1692757100-delete-success',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          'contact-note-1692757100-delete-failed',
        );
      }
    },
  });

  next();
};
