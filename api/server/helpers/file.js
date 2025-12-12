const AWS = require('aws-sdk');
const fs = require('fs');
const crypto = require('crypto');
const mime = require('mime');
const axios = require('axios');
const Sentry = require('@sentry/node');
const constant = require('../constants/constant.json');
const h = {
  general: require('./general'),
  validation: require('./validation'),
};
const fileHelper = module.exports;

/**
 * Check if file exists in S3
 * @param {string} s3KeyPath
 * @returns {Promise<boolean>}
 */
fileHelper.isFileExistInS3 = async (s3KeyPath) => {
  const funcName = 'fileHelper.isFileExistInS3';
  h.validation.requiredParams(funcName, { s3KeyPath });
  try {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const s3 = new AWS.S3();
    const s3Params = {
      Bucket: process.env.AWS_S3_PUBLIC_BUCKET,
      Key: s3KeyPath,
    };
    await s3.headObject(s3Params).promise();
    return true;
  } catch (err) {
    Sentry.captureException(err);
    return false;
  }
};

/**
 * Delete a file from S3
 * @param {string} s3KeyPath
 * @returns {Promise<void>}
 */
fileHelper.deleteFileFromS3 = async (s3KeyPath) => {
  const funcName = 'fileHelper.deleteFileFromS3';
  h.validation.requiredParams(funcName, { s3KeyPath });
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  const s3 = new AWS.S3();
  const s3Params = {
    Bucket: process.env.AWS_S3_PUBLIC_BUCKET,
    Key: s3KeyPath,
  };
  if (await fileHelper.isFileExistInS3(s3KeyPath)) {
    await s3.deleteObject(s3Params).promise();
  }
};

/**
 * Get file path based on different upload types
 * @param {string} uploadType
 * @param {{file_name:string, show_path_only:boolean}} options
 * @returns {string}
 */
fileHelper.getFilePath = (uploadType, options) => {
  const funcName = 'fileHelper.getFilePath';
  h.validation.requiredParams(funcName, {
    uploadType,
    options,
    options_file_name: options.file_name,
  });
  h.validation.validateConstantValue(
    funcName,
    { uploadType: constant.UPLOAD.TYPE },
    { uploadType: uploadType },
  );
  let filePath = '';
  const fileExtOnly = h.general.getFileExt(options.file_name);
  const hashedFileNameOnly = crypto
    .createHash('sha512')
    .update(`${Date.now()}`)
    .digest('hex');
  const fileName =
    options.show_path_only === true
      ? ''
      : `${hashedFileNameOnly}.${fileExtOnly}`;
  switch (uploadType) {
    case constant.UPLOAD.TYPE.USER_PROFILE_IMAGE:
      filePath = `user/profile/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.AGENCY_LOGO_IMAGE:
      filePath = `agency/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.PROJECT_PROPERTY_MEDIA_IMAGE:
      filePath = `project/property/media/image/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.PROJECT_PROPERTY_MEDIA_VIDEO:
      filePath = `project/property/media/video/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.PROJECT_PROPERTY_MEDIA_YOUTUBE:
      filePath = `project/property/media/youtube/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.SHORTLISTED_PROPERTY_COMMENT_ATTACHMENT:
      filePath = `shortlisted_property/comment/attachment/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.SHORTLISTED_PROJECT_COMMENT_ATTACHMENT:
      filePath = `shortlisted_project/comment/attachment/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.PROJECT_PROPERTY_HEADER_INFO_COVER_PICTURE:
      filePath = `project/cover/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.PROJECT_BROCHURE:
      filePath = `project/brochure/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE:
      filePath = `project/media/image/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE_THUMBNAIL:
      filePath = `project/media/image/thumbnail/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO:
      filePath = `project/media/video/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.PROJECT_TEAM_BEHIND_LOGO:
      filePath = `project/team_behind/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.REPORT:
      filePath = `reports/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.MESSAGE_MEDIA:
      filePath = `message_media/${fileName}`;
      break;
    case constant.UPLOAD.TYPE.MESSAGE_MEDIA_IMAGE_THUMBNAIL:
      filePath = `message_media/image/thumbnail/${fileName}`;
      break;
  }
  return filePath;
};

/**
 * Upload file buffer to S3
 * @param {Buffer} fileBuffer
 * @param {string} contentType
 * @param {string} remoteFilePath
 * @returns {Promise<Boolean>}
 */
fileHelper.uploadBufferToS3 = async (
  fileBuffer,
  contentType,
  remoteFilePath,
) => {
  const funcName = 'fileHelper.uploadBufferToS3';
  h.validation.requiredParams(funcName, {
    fileBuffer,
    contentType,
    remoteFilePath,
  });
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  const s3 = new AWS.S3();
  const s3Params = {
    Bucket: process.env.AWS_S3_PUBLIC_BUCKET,
    Key: remoteFilePath,
    ContentType: contentType || '',
    CacheControl: 'max-age=31536000',
    Body: fileBuffer,
    ACL: 'public-read',
  };

  const resData = await new Promise((resolve, reject) => {
    s3.putObject(s3Params, (err, resData) => {
      if (err) reject(err);
      else resolve(resData);
    });
  });
  const uploadResult = h.general.notEmpty(resData);
  return uploadResult;
};

/**
 * Generic function to delete file
 * @returns {Promise<void>}
 */
fileHelper.deleteFile = async (localFilePath) => {
  const funcName = 'fileHelper.deleteFile';
  h.validation.requiredParams(funcName, { localFilePath });
  await new Promise((resolve, reject) => {
    fs.unlink(localFilePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

/**
 * Get mime type from base 64 content
 * Source: https://stackoverflow.com/a/49046568
 * @param {string} base64Str
 * @returns {string}
 */
fileHelper.getMimeTypeFromBase64 = (base64Str) => {
  const base64ContentArray = base64Str.split(',');
  const mimeType = base64ContentArray[0].match(
    /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/,
  )[0];
  return mimeType;
};

/**
 * Get file extension from mime type
 * @param {string} mimeType
 * @returns {string}
 */
fileHelper.getExtFromMimeType = (mimeType) => {
  if (!mimeType) return '';
  return mime.getExtension(mimeType);
};

/**
 * Download file from remote url
 * @param {string} file_url
 * @returns {Promise<{Buffer, string}>}
 */
fileHelper.downloadFile = async (file_url) => {
  const funcName = 'fileHelper.downloadFile';
  h.validation.requiredParams(funcName, { file_url });

  const { data, headers } = await axios({
    url: file_url,
    method: 'GET',
    responseType: 'arraybuffer',
  });

  const content_type = headers['content-type'];
  const file_buffer = Buffer.from(data, 'binary');

  return { file_buffer, content_type };
};

/**
 * Download file as buffer and upload buffer to S3
 * @param {string} file_url
 * @param {string} remote_file_path
 * @returns {Promise<void>}
 */
fileHelper.downloadFileAndUploadToS3 = async (file_url, remote_file_path) => {
  const funcName = 'fileHelper.downloadFileAndUploadToS3';
  h.validation.requiredParams(funcName, { file_url, remote_file_path });
  const { file_buffer, content_type } = await fileHelper.downloadFile(file_url);
  const upload_status = await fileHelper.uploadBufferToS3(
    file_buffer,
    content_type,
    remote_file_path,
  );
  if (!upload_status)
    throw new Error(`${funcName}: failed to upload file to remote`);
};

/**
 * Upload file buffer to S3
 * @param {Buffer} fileBuffer
 * @param {string} contentType
 * @param {string} remoteFilePath
 * @returns {Promise<Boolean>}
 */
fileHelper.scriptUploadBufferToS3 = async (
  fileBuffer,
  contentType,
  remoteFilePath,
) => {
  const funcName = 'fileHelper.uploadBufferToS3';
  h.validation.requiredParams(funcName, {
    fileBuffer,
    contentType,
    remoteFilePath,
  });
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  const s3 = new AWS.S3();
  const s3Params = {
    Bucket: process.env.AWS_S3_PUBLIC_BUCKET,
    Key: remoteFilePath,
    ContentType: contentType || '',
    CacheControl: 'max-age=31536000',
    Body: fileBuffer,
    ACL: 'public-read',
  };

  const resData = await new Promise((resolve, reject) => {
    s3.putObject(s3Params, (err, resData) => {
      if (err) reject(err);
      else resolve(resData);
    });
  });
  const uploadResult = h.general.notEmpty(resData);
  return uploadResult;
};
