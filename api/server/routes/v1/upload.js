const mime = require('mime-types');
const config = require('../../configs/config')(process.env.NODE_ENV);
const constant = require('../../constants/constant.json');
const h = require('../../helpers');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/upload/:upload_type Upload file
   * @apiName Upload
   * @apiVersion 1.0.0
   * @apiGroup Upload
   * @apiUse LoginRequired
   * @apiUse ServerError
   *
   * @apiParam {string="shortlisted_property_comment_attachment"} upload_type File upload purpose
   * @apiparam {File} file Form-based File Upload in HTML
   *
   * @apiSuccess {String} status Response status.
   * @apiSuccess {String} message Message to display to user.
   * @apiSuccess {String} message_code Message code of message for developer use.
   * @apiSuccess {Object} user User data
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001"
   *      "file": {
   * 			"file_url": "full_file_url.extension"
   *      },
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/upload/:upload_type',
    schema: {
      params: {
        type: 'object',
        required: ['upload_type'],
        properties: {
          upload_type: { type: 'string' },
        },
      },
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          file: { type: 'object' },
          user_id: { type: 'object' },
        },
        required: ['file'],
      },
      response: {
        '2xx': {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            file: {
              type: 'object',
              properties: {
                full_file_url: { type: 'string' },
                file_url: { type: 'string' },
                file_name: { type: 'string' },
              },
            },
          },
        },
      },
    },
    // preValidation: async (request, reply) => {
    // 	await userMiddleware.isLoggedIn(request, reply);
    // },
    handler: async (request, reply) => {
      const { upload_type } = request.params;
      const { file } = request.body;

      const fileBuffer = await file.toBuffer();
      const fileContentType = mime.contentType(file.mimetype);
      const fileExt = mime.extension(file.mimetype);
      const remoteFilePath = h.file.getFilePath(upload_type, {
        file_name: `sample_file_name.${fileExt}`,
      });

      const isValidExtension = h.validation.isAllowedFileExtension(fileExt, file.file_name);

      if (!isValidExtension) {
        return reply.status(400).send({
          message: 'Unsupported File Type',
        });
      }

      switch (upload_type) {
        case constant.UPLOAD.TYPE.USER_PROFILE_IMAGE:
          await h.file.uploadBufferToS3(
            fileBuffer,
            fileContentType,
            remoteFilePath,
          );
          break;
        case constant.UPLOAD.TYPE.SHORTLISTED_PROJECT_COMMENT_ATTACHMENT:
        case constant.UPLOAD.TYPE.SHORTLISTED_PROPERTY_COMMENT_ATTACHMENT:
          await h.file.uploadBufferToS3(
            fileBuffer,
            fileContentType,
            remoteFilePath,
          );
          break;
        case constant.UPLOAD.TYPE.MESSAGE_MEDIA:
          await h.file.uploadBufferToS3(
            fileBuffer,
            fileContentType,
            remoteFilePath,
          );
          break;
      }

      const fullRemoteFileUrl = `${config.cdnUrls[0]}/${remoteFilePath}`;

      h.api.createResponse(
        request,
        reply,
        200,
        {
          file: {
            full_file_url: fullRemoteFileUrl,
            file_url: remoteFilePath,
            file_name: file.filename,
          },
        },
        '1-file-1620451489206',
      );
    },
  });

  next();
};
