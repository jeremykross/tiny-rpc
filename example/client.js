const RPC = require('../');

RPC.withTarget("localhost:3451", (rpc) => {
    rpc.helloWorld((result) => {
        console.log(`First call returned:\n ${result}`);
    });

    rpc.afterDelay(2000, console.log);

    rpc.goodbyeWorld("That's", ['all'], {folks: "!"}, (result) => {
        const { calledWith } = result;
        console.log(calledWith);
    });

});


