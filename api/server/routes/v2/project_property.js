const Sentry = require('@sentry/node');
const h = require('../../helpers');
const models = require('../../models');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/project_property/:project_property_id',
    schema: {
      params: {
        type: 'object',
        required: ['project_property_id'],
        properties: {
          project_property: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);
      const { project_property_id } = request.params;
      try {
        let project_property;
        if (project_property) {
          return h.api.createResponse(
            request,
            reply,
            200,
            {
              project_property,
            },
            '1-get-property-by-id-1668741556',
            { portal },
          );
        }

        project_property = await models.project_property.findOne({
          where: {
            project_property_id,
          },
          include: [
            {
              model: models.project_media,
              as: 'project_medias',
              attributes: { exclude: ['project_media_property'] },
              // sequelize wierd stuff https://github.com/sequelize/sequelize/issues/3664
              through: {
                attributes: [],
              },
              include: [{ model: models.project_media_tag }],
            },
          ],
        });

        project_property =
          project_property && project_property.toJSON
            ? project_property.toJSON()
            : project_property;

        return h.api.createResponse(
          request,
          reply,
          200,
          {
            project_property,
          },
          '1-get-property-by-id-1668741556',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: failed to retrieve contact with shortlisted project`,
          { err },
        );
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-get-property-by-id-1668741556',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
