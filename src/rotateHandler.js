const createSecret = require('./stages/createSecret');
const setSecret = require('./stages/setSecret');
const testSecret = require('./stages/testSecret');
const finishSecret = require('./stages/finishSecret');

const rotateHandler = async (event) => {
    const step = event.Step;

    console.log(`Current step: ${step}`);
    switch (step) {
    case 'createSecret':
        await createSecret(event);
        break;
    case 'setSecret':
        await setSecret(event);
        break;
    case 'testSecret':
        await testSecret(event);
        break;
    case 'finishSecret':
        await finishSecret(event);
        break;
    default:
        console.log(`Unknown step: ${step}`);
        throw new Error(`Unknown step: ${step}`);
    }
};

exports.handler = rotateHandler;
