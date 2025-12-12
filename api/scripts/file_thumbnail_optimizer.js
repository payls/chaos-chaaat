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
const constant = require('../server/constants/constant.json');
const uuid = require('uuid');
const Promise = require('bluebird');

const _ = require('lodash');

const typeToOptimize = ['project_media_image'];

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

function optimizeImage({ success, fileBuffer, filename, remoteThumbnailPath }) {
  const transloaditService = new TransloaditService();
  if (success) {
    return transloaditService.createImageBySize(
      fileBuffer,
      filename,
      remoteThumbnailPath,
      {
        width: 600,
      },
    );
  }

  return undefined;
}

function deleteTempFile(filePath) {
  fs.unlinkSync(filePath);
}

function getFileBuffer(filePath) {
  return fs.promises.readFile(filePath);
}

async function optimize(nameOfFile, upload_type, downloadFilePath) {
  try {
    const fileBuffer = await getFileBuffer(downloadFilePath);

    const remoteThumbnailPath = h.file.getFilePath(
      constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE_THUMBNAIL,
      {
        file_name: `sample_file_name.png`,
      },
    );

    const result = {
      success: true,
      fileBuffer,
      fileName: nameOfFile,
      remoteThumbnailPath,
    };

    const optimiseImg = await optimizeImage(result);
    // deleteTempFile(downloadFilePath)
    return {
      newUrl: remoteThumbnailPath,
    };
  } catch (e) {
    console.log('error', e);
    return {
      newUrl: null,
    };
  }
}

async function optimizeImages() {
  const projectMedias = await models.project_media.findAll({
    where: {
      type: {
        [Op.in]: typeToOptimize,
      },
      thumbnail_src: {
        [Op.eq]: null,
      },
      // project_media_id: {
      //     [Op.in]: [
      //         'f3a33e88-c755-43be-91d5-1b8a14c024eb'
      //     ]
      // }
    },
    sort: ['created_date', 'desc'],
  });

  // projectMedias = [projectMedias[0]];

  const chunkedPM = _.chunk(projectMedias, 5);

  return Promise.mapSeries(chunkedPM, (chunks) => {
    return Promise.all(chunks.map((c) => load(c)));
  });
}

async function load({ dataValues }) {
  try {
    const { project_media_id, url, filename = 'unnamed', type } = dataValues;
    const unique_filename = uuid.v4() + '_' + filename;
    const downloadFilePath = await downloadFile(url, unique_filename);
    const { newUrl } = await optimize(filename, type, downloadFilePath);
    if (project_media_id && newUrl) {
      const cdn = `${config.cdnUrls[0]}/${newUrl}`;
      await models.project_media.update(
        { thumbnail_src: cdn },
        { where: { project_media_id } },
      );
      deleteTempFile(downloadFilePath);
      return {
        project_media_id,
        newUrl: cdn,
      };
    }
  } catch (err) {
    console.log(err);
  }
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
