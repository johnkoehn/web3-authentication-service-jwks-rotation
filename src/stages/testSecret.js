/* eslint-disable no-await-in-loop */
const fetch = require('node-fetch');
const { promisify } = require('util');
const jose = require('node-jose');
const { CloudFrontClient, CreateInvalidationCommand, GetInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const getSecrets = require('../util/getSecrets');

const setTimeoutPromise = promisify(setTimeout);

const invalidateCloudFrontCache = async () => {
    const client = new CloudFrontClient();

    const invalidateJwksCache = new CreateInvalidationCommand({
        DistributionId: process.env.DISTRIBUTION_ID,
        InvalidationBatch: {
            CallerReference: Date.now(),
            Paths: {
                Items: ['/.well-known/jwks.json'],
                Quantity: 1
            }
        }
    });

    const invalidationResult = await client.send(invalidateJwksCache);
    const id = invalidationResult.Invalidation.Id;

    let invalidationProgressCheck;
    do {
        await setTimeoutPromise(2000);

        const getInvalidationCommand = new GetInvalidationCommand({
            DistributionId: process.env.DISTRIBUTION_ID,
            Id: id
        });
        invalidationProgressCheck = await client.send(getInvalidationCommand);
    } while (invalidationProgressCheck.Invalidation.Status === 'InProgress');
};

const testSecret = async (event) => {
    await invalidateCloudFrontCache();

    const secretId = event.SecretId;
    const pendingSecrets = await getSecrets(secretId, 'AWSPENDING');

    const publicJwks = (await jose.JWK.asKeyStore(pendingSecrets)).toJSON(false);

    const response = await fetch(`${process.env.BASE_AUTH_URL}/.well-known/jwks.json`, {
        method: 'GET',
        headers: {
            Accept: 'application/json'
        }
    });

    const cloudfrontJwks = await response.json();

    if (JSON.stringify(publicJwks) !== JSON.stringify(cloudfrontJwks)) {
        console.log(`ALERT: The jwks returned by ${process.env.BASE_AUTH_URL} did not match the JWKS`);
        console.log('jwks during rotation: ', JSON.stringify(publicJwks, null, 4));
        console.log('Cloudfront jwks: ', JSON.stringify(cloudfrontJwks, null, 4));
        throw new Error('The jwks does not match!');
    }
};

module.exports = testSecret;
