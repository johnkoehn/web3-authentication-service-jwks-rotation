const { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const jose = require('node-jose');

const keyStore = jose.JWK.createKeyStore();

const createSecret = async (event) => {
    const secretId = event.SecretId;
    const client = new SecretsManagerClient({
        region: process.env.AWS_REGION
    });

    // generate the new key
    const newKey = await keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' });

    // get the existing secrets
    const getSecretCommand = new GetSecretValueCommand({
        SecretId: secretId,
        VersionStage: 'AWSCURRENT'
    });

    const response = await client.send(getSecretCommand);
    const secrets = JSON.parse(response.SecretString);

    const newSecrets = {
        keys: [
            newKey,
            secrets.keys[0]
        ]
    };

    const putSecretCommand = new PutSecretValueCommand({
        SecretId: secretId,
        VersionStages: ['AWSPENDING'],
        ClientRequestToken: event.ClientRequestToken,
        SecretString: JSON.stringify(newSecrets)
    });

    await client.send(putSecretCommand);
};

module.exports = createSecret;
