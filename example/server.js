const RPC = require('../');

function helloWorld() {
    return "Hello World!";
}

function afterDelay(delay, callback) {
    setTimeout(() => {
        callback(`Async functions work just as well!`);
    }, delay);
}

function goodbyeWorld(one, two, three) {
    return {calledWith: `${one}, ${JSON.stringify(two)}, ${JSON.stringify(three)}`};
}

RPC.serve(3451, helloWorld, afterDelay, goodbyeWorld);
