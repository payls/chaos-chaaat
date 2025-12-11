require('dotenv').config();

const crypto = require('crypto');
const AWS = require('aws-sdk');

const config = require('../configs/config')(process.env.NODE_ENV);
const { region, secretsManager } = config.aws;

AWS.config.update({
  accessKeyId: process.env.CHAAAT_API_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.CHAAAT_API_AWS_SECRET_ACCESS_KEY,
});

const client = new AWS.SecretsManager({
  region,
});

function getSecretKeys() {
  const encryptionKeySecret = secretsManager.encryptionKeySecret;
  return new Promise((res, rej) => {
    client.getSecretValue(
      {
        SecretId: encryptionKeySecret,
        VersionStage: 'AWSCURRENT', // VersionS
      },
      (err, data) => {
        if (err) return rej(err);
        return res(data);
      },
    );
  });
}

async function getEncryptionKeys() {
  try {
    const response = await getSecretKeys();
    const secret = response.SecretString;

    return secret;
  } catch (err) {
    throw err;
  }
}

function encrypt({ encryptionKey, encryptionIv }, plainText) {
  try {
    const key = Buffer.from(encryptionKey, 'hex'); // 256-bit key
    const iv = Buffer.from(encryptionIv, 'hex'); // 128-bit IV
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  } catch (err) {
    return plainText;
  }
}

function decrypt({ encryptionKey, encryptionIv }, encryptedText) {
  try {
    const key = Buffer.from(encryptionKey, 'hex'); // 256-bit key
    const iv = Buffer.from(encryptionIv, 'hex'); // 128-bit IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    return encryptedText;
  }
}

module.exports = {
  getEncryptionKeys,
  encrypt,
  decrypt,
};
