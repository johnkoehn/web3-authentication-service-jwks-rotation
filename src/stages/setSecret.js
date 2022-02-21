const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const jose = require('node-jose');
const getSecrets = require('../util/getSecrets');

const setSecret = async (event) => {
    const secretId = event.SecretId;
    const pendingSecrets = await getSecrets(secretId, 'AWSPENDING');

    const publicJwks = (await jose.JWK.asKeyStore(pendingSecrets)).toJSON(false);

    const s3Client = new S3Client({
        region: process.env.AWS_REGION
    });

    const updateJwksCommand = new PutObjectCommand({
        Bucket: process.env.JWKS_BUCKET,
        Key: '.well-known/jwks.json',
        Body: JSON.stringify(publicJwks, null, 4),
        ContentType: 'application/json'
    });

    await s3Client.send(updateJwksCommand);
};

module.exports = setSecret;
