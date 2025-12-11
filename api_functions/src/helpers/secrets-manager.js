const AWS = require('aws-sdk');

/**
 * Helper function to get secrets from AWS Secrets Manager
 * @returns {Promise<{
 *   username: string,
 *   password: string,
 *   database: string,
 *   host: string,
 *   dialect: string,
 *   logging: boolean
 * }>}
 */
exports.getSecrets = async () => {
  const region = 'ap-southeast-1';
  const secretId =
    'arn:aws:secretsmanager:ap-southeast-1:273523142243:secret:prod/aerospec/app-0SYFas';
  let secret;
  let decodedBinarySecret;

  // Create a Secrets Manager client
  let client = new AWS.SecretsManager({
    region: region,
  });

  const secretsData = await client
    .getSecretValue({ SecretId: secretId })
    .promise();
  if ('SecretString' in secretsData) {
    secret = secretsData.SecretString;
  } else {
    let buff = new Buffer(secretsData.SecretBinary, 'base64');
    decodedBinarySecret = buff.toString('ascii');
  }

  return JSON.parse(secret || decodedBinarySecret);
};
