const { PutSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const jose = require('node-jose');
const getSecrets = require('../util/getSecrets');
const client = require('../util/getSecretsManagerClient')();

const keyStore = jose.JWK.createKeyStore();

const createSecret = async (event) => {
    const secretId = event.SecretId;

    const secrets = await getSecrets(secretId, 'AWSCURRENT');
    const newKey = await keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' });

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
