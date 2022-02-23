const { GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const client = require('./getSecretsManagerClient')();

const getSecrets = async (secretId, versionStage) => {
    const getSecretValue = new GetSecretValueCommand({
        SecretId: secretId,
        VersionStage: versionStage
    });

    const response = await client.send(getSecretValue);
    const secrets = JSON.parse(response.SecretString);

    return secrets;
};

module.exports = getSecrets;
