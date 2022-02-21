const { SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');

let client;
const getSecretsManagerClient = () => {
    if (!client) {
        client = new SecretsManagerClient({
            region: process.env.AWS_REGION
        });
    }

    return client;
};

module.exports = getSecretsManagerClient;
