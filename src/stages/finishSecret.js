const { DescribeSecretCommand, UpdateSecretVersionStageCommand } = require('@aws-sdk/client-secrets-manager');
const { ECSClient, UpdateServiceCommand } = require('@aws-sdk/client-ecs');
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
    const ecsClient = new ECSClient({ region: process.env.AWS_REGION });
    const resetTasksCommand = new UpdateServiceCommand({
        service: process.env.ECS_SERVICE_NAME,
        forceNewDeployment: true,
        cluster: process.env.ECS_CLUSTER_NAME
    });

    await ecsClient.send(resetTasksCommand);
};

module.exports = finishSecret;
