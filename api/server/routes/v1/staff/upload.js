const Sentry = require('@sentry/node');
const mime = require('mime-types');
const config = require('../../../configs/config')(process.env.NODE_ENV);
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const Jimp = require('jimp');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/upload/:upload_type Upload file
   * @apiName StaffUpload
   * @apiVersion 1.0.0
   * @apiGroup Staff Upload
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
    url: '/staff/upload/:upload_type',
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
                full_file_white_bg_url: { type: 'string' },
                file_white_bg_url: { type: 'string' },
                file_name: { type: 'string' },
                file_thumbnail: { type: 'string' },
              },
            },
            additional_files: {
              type: 'array',
              items: {
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
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
    },
    handler: async (request, reply) => {
      const { upload_type } = request.params;
      const { file } = request.body;

      try {
        const fileBuffer = await file.toBuffer();
        const fileContentType = mime.contentType(file.mimetype);
        let fileExt = mime.extension(file.mimetype);
        if (h.cmpStr(file.mimetype, "audio/aac")) {
          fileExt = "aac"
        }

        const isValidExtension = h.validation.isAllowedFileExtension(fileExt, file.filename);

        if (!isValidExtension) {
          return reply.status(400).send({
            message: 'Unsupported File Type',
          });
        }

        // check file extension if allowed
        const remoteFilePath = h.file.getFilePath(upload_type, {
          file_name: `sample_file_name.${fileExt}`,
        });
        let whiteBGUrl = null;
        let additionalMedias;
        let thumbnailUrl = null;

        switch (upload_type) {
          case constant.UPLOAD.TYPE.USER_PROFILE_IMAGE:
          case constant.UPLOAD.TYPE.PROJECT_PROPERTY_MEDIA_IMAGE:
          case constant.UPLOAD.TYPE.PROJECT_PROPERTY_MEDIA_VIDEO:
          case constant.UPLOAD.TYPE.PROJECT_PROPERTY_MEDIA_YOUTUBE:
          case constant.UPLOAD.TYPE.SHORTLISTED_PROPERTY_COMMENT_ATTACHMENT:
          case constant.UPLOAD.TYPE.SHORTLISTED_PROJECT_COMMENT_ATTACHMENT:
          case constant.UPLOAD.TYPE.PROJECT_PROPERTY_HEADER_INFO_COVER_PICTURE:
          case constant.UPLOAD.TYPE.PROJECT_BROCHURE:
          case constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE:
          case constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO:
          case constant.UPLOAD.TYPE.PROJECT_TEAM_BEHIND_LOGO:
          case constant.UPLOAD.TYPE.MESSAGE_MEDIA:
            await h.file.uploadBufferToS3(
              fileBuffer,
              fileContentType,
              remoteFilePath,
            );
            break;
        }

        if (upload_type === constant.UPLOAD.TYPE.AGENCY_LOGO_IMAGE) {
          await h.file.uploadBufferToS3(
            fileBuffer,
            fileContentType,
            remoteFilePath,
          );

          whiteBGUrl = h.general.addSuffix(remoteFilePath, '-white');
          // Convert buffer to add white bg
          const whiteBgLogoBuffer = await Jimp.read(
            Buffer.from(fileBuffer, 'base64'),
          ).then(async (image) => {
            return image
              .rgba(false)
              .background(0xffffffff)
              .getBufferAsync(Jimp.MIME_JPEG);
          });

          // Upload white-bg logo to s3
          await h.file.uploadBufferToS3(
            whiteBgLogoBuffer,
            fileContentType,
            whiteBGUrl,
          );
        }

        // Create Image variation
        if (upload_type === constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE) {
          const remoteThumbnailPath = h.file.getFilePath(
            constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE_THUMBNAIL,
            {
              file_name: `sample_file_name.png`,
            },
          );
          thumbnailUrl = `${config.cdnUrls[0]}/${remoteThumbnailPath}`;
        }

        // Create Mp4 variation
        if (upload_type === constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO) {
          const remoteThumbnailPath = h.file.getFilePath(
            constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE_THUMBNAIL,
            {
              file_name: `sample_file_name.png`,
            },
          );
          thumbnailUrl = `${config.cdnUrls[0]}/${remoteThumbnailPath}`;
        }

        // create video message media thumbnail
        if (upload_type === constant.UPLOAD.TYPE.MESSAGE_MEDIA) {
          const remoteThumbnailPath = h.file.getFilePath(
            constant.UPLOAD.TYPE.MESSAGE_MEDIA_IMAGE_THUMBNAIL,
            {
              file_name: `sample_file_name.png`,
            },
          );

          thumbnailUrl = `${config.cdnUrls[0]}/${remoteThumbnailPath}`;
        }

        const fullRemoteFileUrl = `${config.cdnUrls[0]}/${remoteFilePath}`;
        let fullRemoteWhiteBgUrl = null;
        if (whiteBGUrl) {
          fullRemoteWhiteBgUrl = `${config.cdnUrls[0]}/${whiteBGUrl}`;
        }

        console.log(`${request.url}: uploaded file(s) successfully.`, {
          upload_type,
          file_name: file.filename,
          mime_type: file.mimetype,
          encoding: file.encoding,
          file_url: fullRemoteFileUrl,
          file_thumbnail: thumbnailUrl,
          full_file_white_bg_url: fullRemoteWhiteBgUrl,
          file_white_bg_url: whiteBGUrl,
          additionalMedias,
        });

        h.api.createResponse(
          request,
          reply,
          200,
          {
            file: {
              full_file_url: fullRemoteFileUrl,
              file_url: remoteFilePath,
              full_file_white_bg_url: fullRemoteWhiteBgUrl,
              file_white_bg_url: whiteBGUrl,
              file_name: file.filename,
              file_thumbnail: thumbnailUrl,
            },
            additional_files: additionalMedias,
          },
          '1-file-1620451489206',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        reply.log.error({
          message: `${request.url}: failed to upload file.`,
          file_meta: {
            upload_type,
            file_name: file.filename,
            mime_type: file.mimetype,
            encoding: file.encoding,
          },
          err,
      });
        reply.status(500).send({
          message: 'An error occured while uploading File. Please try again.'
        });
      }
    },
  });

  next();
};
