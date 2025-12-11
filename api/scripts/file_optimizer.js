require('dotenv').config();

const fs = require('fs');
const { Op } = require('sequelize');
const moment = require('moment');
const https = require('https');
const mime = require('mime-types');
const env = process.env.NODE_ENV || 'staging';
const models = require('../server/models');
const h = require('../server/helpers');
const TransloaditService = require('../server/services/vendors/transloadit');
const config = require('../server/configs/config')(env);
const Promise = require('bluebird');

const typeToOptimize = [
  'project_property_header_info_cover_picture',
  'project_property_media_image',
  'project_media_image',
];

function downloadFile(fileRemotePath, fileName) {
  return new Promise((resolve, reject) => {
    const path = `${__dirname}/${fileName}`;
    const file = fs.createWriteStream(path);

    https
      .get(fileRemotePath, function (response) {
        response.pipe(file);

        // after download completed close filestream
        file.on('finish', () => {
          file.close();
          resolve(path);
        });
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      });
  });
}

function reuploadImage(filePath, upload_type, filename) {
  const fileContentType = mime.contentType(filePath);
  const fileExt = filePath.split('.').reverse()[0]; // mime.extension(fileContentType);
  const remoteFilePath = h.file.getFilePath(upload_type, {
    file_name: `sample_file_name.${fileExt}`,
  });

  return fs.promises
    .readFile(filePath)
    .then((fileBuffer) => {
      return h.file
        .uploadBufferToS3(fileBuffer, fileContentType, remoteFilePath)
        .then((result) => {
          return { success: result, fileBuffer, filename, remoteFilePath };
        });
    })
    .then((results) => {
      return results;
    });
}

function optimizeImage({ success, fileBuffer, filename, remoteFilePath }) {
  const transloaditService = new TransloaditService();
  if (success) {
    return transloaditService.optimiseImage(
      fileBuffer,
      filename,
      remoteFilePath,
    );
  }

  return undefined;
}

function deleteTempFile(filePath) {
  fs.unlinkSync(filePath);
}

async function optimize(
  oldFileRemoteUrl,
  nameOfFile,
  upload_type,
  downloadFilePath,
) {
  try {
    const result = await reuploadImage(downloadFilePath, upload_type);
    const optimiseImg = await optimizeImage(result);
    const { remoteFilePath } = result;
    // deleteTempFile(downloadFilePath)
    return {
      oldUrl: oldFileRemoteUrl,
      newUrl: remoteFilePath,
    };
  } catch (e) {
    console.log('error', e);
    return {
      oldUrl: oldFileRemoteUrl,
      newUrl: null,
    };
  }
}

async function optimizeImages() {
  const before = moment({ y: 2022, M: 2 }).toDate();
  const projectMedias = await models.project_media.findAll({
    where: {
      type: {
        [Op.in]: typeToOptimize,
      },
      created_date: {
        [Op.lte]: before,
      },
    },
    sort: ['created_date', 'desc'],
  });

  // projectMedias = [projectMedias[0]];

  return Promise.mapSeries(projectMedias, async ({ dataValues }) => {
    const { project_media_id, url, filename = 'unnamed', type } = dataValues;

    try {
      const downloadFilePath = await downloadFile(url, filename);
      const { oldUrl, newUrl } = await optimize(
        url,
        filename,
        type,
        downloadFilePath,
      );
      if (project_media_id && newUrl) {
        const cdn = `${config.cdnUrls[0]}/${newUrl}`;
        await models.project_media.update(
          { url: cdn },
          { where: { project_media_id } },
        );
        deleteTempFile(downloadFilePath);
        return {
          project_media_id,
          oldUrl,
          newUrl,
        };
      }
    } catch (err) {
      console.log({
        project_media_id,
        err,
      });
    }
  });
}

optimizeImages()
  .then((res) => {
    console.log(res);
    return process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
