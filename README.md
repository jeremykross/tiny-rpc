# tiny-rpc
A grokable Javascript RPC library.

Server.js

    function helloWorld() {
        return "Hello World!";
    }

    RPC.serve(3451, helloWorld);
 
Then...

    RPC.withTarget("localhost:3451", (rpc) => {
        rpc.helloWorld((result) => {
            console.log(`First call returned:\n ${result}`);
        });
    });
  
See ./example for more.
  
