/* eslint-disable no-await-in-loop */
const fetch = require('node-fetch');
const { promisify } = require('util');
const { CloudFrontClient, CreateInvalidationCommand, GetInvalidationCommand } = require('@aws-sdk/client-cloudfront');

const setTimeoutPromise = promisify(setTimeout);

const testSecret = async () => {
    const client = new CloudFrontClient();

    const invalidateJwksCache = new CreateInvalidationCommand({
        DistributionId: 'E17I1UKAVJ369F',
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
            DistributionId: 'E17I1UKAVJ369F',
            Id: id
        });
        invalidationProgressCheck = await client.send(getInvalidationCommand);
    } while (invalidationProgressCheck.Invalidation.Status === 'InProgress');


    // check the S3 status
};

module.exports = testSecret;

testSecret()
    .then(() => console.log('done'))
    .catch((err) => console.log(err));
