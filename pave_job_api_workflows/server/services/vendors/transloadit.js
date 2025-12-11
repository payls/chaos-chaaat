const VendorCommon = require('./common');
const Transloadit = require('transloadit');
const h = require('../../helpers');
const constant = require('../../constants/constant.json');
const config = require('../../configs/config')(process.env.NODE_ENV);

/**
 * Result item
 * @typedef {{
 *  id: number,
 *  name: string,
 *  ssl_url: string
 * }} ResultItem
 *
 * Result
 * @typedef {{
 *  :original: ResultItem[],
 *  thumbnailed: ResultItem[]
 *  compress_image: ResultItem[]
 * }} Result
 *
 * Assembly execution result
 * @typedef {{
 *  ok: string,
 *  message: string,
 *  results: Result
 * }} AssemblyResult
 */

class TransloaditService extends VendorCommon {
  constructor() {
    super();

    this.transloadit = new Transloadit({
      authKey: process.env.TRANSLOADIT_AUTH_KEY,
      authSecret: process.env.TRANSLOADIT_AUTH_SECRET,
      endpoint: 'http://api2.transloadit.com',
    });
  }

  setDbTransaction(dbTransaction) {
    super.setDbTransaction(dbTransaction);
  }

  /**
   * Optimise images via Transloadit
   * @param Buffer file
   * @param string fileName
   * @param string path
   * @returns {Promise<void>}
   */
  async optimiseImage(file, fileName, path) {
    const funcName = 'optimiseImage';
    const options = {
      uploads: { [fileName]: file },
      waitForCompletion: true,
      timeout: 120000,
      params: {
        steps: {
          ':original': {
            robot: '/upload/handle',
          },
          compress_image: {
            use: ':original',
            robot: '/image/optimize',
            progressive: true,
          },
          export: {
            use: [':original', 'compress_image'],
            robot: '/s3/store',
            bucket: process.env.AWS_S3_PUBLIC_BUCKET,
            bucket_region: 'ap-southeast-1',
            key: process.env.AWS_ACCESS_KEY_ID,
            secret: process.env.AWS_SECRET_ACCESS_KEY,
            path,
          },
        },
      },
    };

    // Start the Assembly
    try {
      const result = await this.transloadit.createAssembly(options);
      console.log(`${funcName}: successfully optimised image`, result.results);
    } catch (err) {
      console.log(
        `${funcName}: failed to optimise image with Transloadit`,
        err,
      );
    }
  }

  /**
   * Create thumbnail via Transloadit
   * @param Buffer file
   * @param string fileName
   * @param Object size
   * @returns {Promise<{{
   *  full_file_url: string,
   *  file_url: string,
   *  file_name: string
   * }}>>}
   */
  async createImageBySize(file, fileName, path, size) {
    const funcName = 'optimiseImage';
    const options = {
      uploads: { [fileName]: file },
      waitForCompletion: true,
      timeout: 120000,
      params: {
        steps: {
          thumbnail: {
            robot: '/image/resize',
            width: size.width,
            height: size.height, // Set null/undfined to fit ratio
          },
          export: {
            use: ['thumbnail'],
            robot: '/s3/store',
            bucket: process.env.AWS_S3_PUBLIC_BUCKET,
            bucket_region: 'ap-southeast-1',
            key: process.env.AWS_ACCESS_KEY_ID,
            secret: process.env.AWS_SECRET_ACCESS_KEY,
            path,
          },
        },
      },
    };

    // Start the Assembly
    try {
      const result = await this.transloadit.createAssembly(options);
      console.log(
        `${funcName}: Successfully created thumbnail image`,
        result.results,
      );
    } catch (err) {
      console.log(
        `${funcName}: Failed to create thumbnail image with Transloadit`,
        err,
      );
    }
  }

  /**
   * Create thumbnail via Transloadit
   * @param Buffer file
   * @param string fileName
   * @param Object size
   * @returns {Promise<{{
   *  full_file_url: string,
   *  file_url: string,
   *  file_name: string
   * }}>>}
   */
  async createVideoThumbnailBySize(file, fileName, path, size) {
    const funcName = 'optimiseImage';
    const options = {
      uploads: { [fileName]: file },
      waitForCompletion: true,
      timeout: 120000,
      params: {
        steps: {
          thumbnail: {
            use: ':original',
            robot: '/video/thumbs',
            count: 1,
            width: size.width,
            height: size.height, // Set null/undfined to fit ratio
            resize_strategy: 'fit',
            result: true,
            ffmpeg_stack: 'v4.3.1',
          },
          export: {
            use: ['thumbnail'],
            robot: '/s3/store',
            bucket: process.env.AWS_S3_PUBLIC_BUCKET,
            bucket_region: 'ap-southeast-1',
            key: process.env.AWS_ACCESS_KEY_ID,
            secret: process.env.AWS_SECRET_ACCESS_KEY,
            path,
          },
        },
      },
    };

    // Start the Assembly
    try {
      const result = await this.transloadit.createAssembly(options);
      console.log(
        `${funcName}: Successfully created thumbnail image`,
        result.results,
      );
    } catch (err) {
      console.log(
        `${funcName}: Failed to create thumbnail image with Transloadit`,
        err,
      );
    }
  }

  /**
   * Extract PDF pages as images via Transloadit
   * @param Buffer file
   * @param string fileName
   * @returns {Promise<{{
   *  full_file_url: string,
   *  file_url: string,
   *  file_name: string
   * }}>>}
   */
  async extractPdfAsImages(file, fileName) {
    const funcName = 'extractPdfAsImages';
    const options = {
      uploads: { [fileName]: file },
      waitForCompletion: true,
      timeout: 120000,
      params: {
        steps: {
          ':original': {
            robot: '/upload/handle',
          },
          thumbnailed: {
            use: ':original',
            robot: '/document/thumbs',
            result: true,
            width: 874,
            height: 1240,
            resize_strategy: 'fit',
            imagemagick_stack: 'v2.0.7',
          },
          compress_image: {
            use: 'thumbnailed',
            robot: '/image/optimize',
            progressive: true,
          },
          export_images: {
            use: ['compress_image'],
            robot: '/s3/store',
            bucket: process.env.AWS_S3_PUBLIC_BUCKET,
            bucket_region: 'ap-southeast-1',
            key: process.env.AWS_ACCESS_KEY_ID,
            secret: process.env.AWS_SECRET_ACCESS_KEY,
            path: h.file.getFilePath(constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE, {
              file_name: `sample_file_name.png`,
              show_path_only: true,
            }),
            url_prefix: `${config.cdnUrls[0]}/`,
          },
        },
      },
    };

    // Start the Assembly
    try {
      /**
       * @type {AssemblyResult as any}
       * Sample Assembly payload:
       * https://assets.transloadit.com/assets/demos/outputs/document-processing-convert-all-pages-of-a-document-into-images--assembly.json
       */
      const result = await this.transloadit.createAssembly(options);
      const pdfImages = result.results.compress_image.map((image) => {
        return {
          full_file_url: image.ssl_url,
          file_url: image.ssl_url.replace(config.cdnUrls[0], ''),
          file_name: image.name,
        };
      });
      console.log(`${funcName}: successfully optimised image`, result.results);
      return pdfImages;
    } catch (err) {
      console.log(
        `${funcName}: failed to optimise image with Transloadit`,
        err,
      );
    }
  }
}

module.exports = TransloaditService;
