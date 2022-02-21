const { DescribeSecretCommand, UpdateSecretVersionStageCommand } = require('@aws-sdk/client-secrets-manager');
const client = require('../util/getSecretsManagerClient')();

const finishSecret = async (event) => {
    const secretId = event.SecretId;

    const describeSecretCommand = new DescribeSecretCommand({
        SecretId: secretId
    });
    const secretState = await client.send(describeSecretCommand);

    // move the pending version to current version
    const currentVersionId = Object.keys(secretState.VersionIdsToStages).find((id) => secretState.VersionIdsToStages[id].includes('AWSCURRENT'));
    const pendingVersionId = Object.keys(secretState.VersionIdsToStages).find((id) => secretState.VersionIdsToStages[id].includes('AWSPENDING'));

    const updateVersionCommand = new UpdateSecretVersionStageCommand({
        SecretId: secretId,
        RemoveFromVersionId: currentVersionId,
        MoveToVersionId: pendingVersionId,
        VersionStage: 'AWSCURRENT'
    });

    await client.send(updateVersionCommand);

    // reset ECS Service
};

module.exports = finishSecret;
