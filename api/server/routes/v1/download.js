const Sentry = require('@sentry/node');
const config = require('../../configs/config')(process.env.NODE_ENV);
const constant = require('../../constants/constant.json');
const h = require('../../helpers');
const c = require('../../controllers');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/download/:download_type Download file
   * @apiName Download
   * @apiVersion 1.0.0
   * @apiGroup Download
   * @apiUse ServerError
   *
   * @apiParam {string="shortlisted_property_comment_attachment"} download_type File download purpose
   * @apiparam {string} url File CDN Url
   *
   * @apiSuccess {Object} File Buffer
   */
  fastify.route({
    method: 'POST',
    url: '/download/:download_type',
    schema: {
      params: {
        type: 'object',
        required: ['download_type'],
        properties: {
          download_type: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          url: { type: 'string' },
        },
        required: ['url'],
      },
      response: {
        '2xx': {
          type: 'object',
        },
      },
    },
    handler: async (request, reply) => {
      const { download_type } = request.params;
      const { url } = request.body;

      try {
        const filteredUrl = url.replace(config.cdnUrls[0] + '/', '');

        let fileName;
        const UPLOAD_TYPE = constant.UPLOAD.TYPE;
        switch (download_type) {
          case UPLOAD_TYPE.SHORTLISTED_PROPERTY_COMMENT_ATTACHMENT: {
            const attachment =
              await c.shortListedPropertyCommentAttachment.findOne({
                attachment_url: filteredUrl,
              });
            if (h.general.isEmpty(attachment))
              throw new Error(`Url does not exist`);
            fileName = attachment.file_name;
            break;
          }
          default:
            throw new Error('CDN Url is invalid');
        }

        fileName = fileName.replaceAll(' ', '_');

        const { file_buffer } = await h.file.downloadFile(url);
        reply
          .type('application/octet-stream')
          .header('Access-Control-Expose-Headers', 'Content-Disposition')
          .header('Content-Disposition', `attachment; filename=${fileName}`)
          .send(file_buffer);
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to download file`, { err });
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-download-1642525751556',
        );
      }
    },
  });

  next();
};
