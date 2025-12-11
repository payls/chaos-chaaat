const Sentry = require('@sentry/node');
const h = require('../../helpers');
const models = require('../../models');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/project/:project_id',
    schema: {
      params: {
        type: 'object',
        required: ['project_id'],
        properties: {
          project_id: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);
      const { project_id } = request.params;
      try {
        let project;
        if (project) {
          return h.api.createResponse(
            request,
            reply,
            200,
            {
              project,
            },
            '1-get-project-by-id-1668741556',
            { portal },
          );
        }
        project = await models.project.findOne({
          where: {
            project_id,
          },
          include: [
            {
              model: models.project_media,
              include: [{ model: models.project_media_tag }],
            },
            {
              model: models.feature,
              as: 'features',
              attributes: { exclude: ['project_feature'] },
              // sequelize wierd stuff https://github.com/sequelize/sequelize/issues/3664
              through: {
                attributes: [],
              },
            },
          ],
        });

        project = project && project.toJSON ? project.toJSON() : project;
        return h.api.createResponse(
          request,
          reply,
          200,
          {
            project,
          },
          '1-get-project-by-id-1668741556',
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
          '2-get-project-by-id-1668741556',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
