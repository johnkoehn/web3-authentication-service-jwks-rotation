#!/bin/bash
set -e

RED='\033[0;31m'
NO_COLOR='\033[0m'

SERVICE_NAME=web3-authentication-service-jwks-rotation

aws cloudformation package --template-file ./infrastructure/cloudformation.yaml \
    --s3-bucket "koehn-trade-lambda-storage" \
    --output-template-file ./infrastructure/cloudformation-lambda.yaml

aws cloudformation deploy \
    --stack-name=${SERVICE_NAME} \
    --template-file=./infrastructure/cloudformation-lambda.yaml \
    --capabilities CAPABILITY_NAMED_IAM \
    --no-fail-on-empty-changeset \
    --parameter-overrides ServiceName=${SERVICE_NAME} $(cat "./infrastructure/parameters.dev.properties")