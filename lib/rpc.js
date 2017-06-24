const _ = require('lodash');
const express = require('express');
const request = require('request');

let boundPorts = {};

function call(name, isIndepotent, args, cb) {
    const method = isIndepotent ? 'GET' : 'POST'; 
    const params = isIndepotent ? {qs: {args}} : {body: {args}};

    request(_.merge({
        baseUrl: `http://${ip}`,
        method: method,
        uri: `/rpc/${name}`,
        json: true
    }, params), (err, res) => {
        if(err) {
            cb(err);
        } else {
            const returned = _.get(res, ['body', 'returned'], null);
            cb(returned);
        }
    });

};

function serve(port) {
    const endpoints = _.flow(
        _.tail,
        _.partial(_.map, _, (ep) => _.isFunction(ep) ? {fn: ep} : ep),
        _.partial(_.map,_, (ep) => _.defaults(ep, {'idepotent': true, 'name': ep.fn.name})),
        _.partial(_.filter, _, (ep) => !_.isEmpty(ep.name)) 
    )(arguments);

    const shouldListen = ! _.has(boundPorts, port);
    const server = _.get(boundPorts, port, express());

    _.each(endpoints, (ep) => {

        const method = ep.idepotent ? server.get : server.post;
        const target = `/rpc/${ep.name}`;

        method.call(server, target, (req, res) => {

            const args = _.get(req, ['body', 'args']) || _.get(req, ['query', 'args']) || [];

            var callbackCalled = false;
            const cb = (result) => {
                if(!callbackCalled) {
                    callbackCalled = true;
                }

                res.json({returned: result});

            };

            const result = ep.fn.apply(null, _.concat(args, cb));

            if(!_.isEmpty(result)) {
                cb(result);
            }

        });
    });


    server.get("/rpc/interface.js", (req, res) => {

        const endpointToCall = (endpoint) => 
            `function ${endpoint.name} () {
                const lastIndex = arguments.length -1;
                const cb = arguments[lastIndex];
                call("${endpoint.name}", ${endpoint.idepotent}, Array.prototype.slice.call(arguments, 0, lastIndex), cb);
            };`;

        const interface = `(ip, request) => {
            /* This is an auto-generated file. */
            ${call}
            ${_.join(_.map(endpoints, endpointToCall), ";\n")}
            return { ${_.map(endpoints, (ep) => ep.name)} };
        }`;

        res.send(interface);
    });

    if(shouldListen) server.listen(port);

    console.log(`Serving ${_.map(endpoints, (ep) => ep.name)} on ${port}.`);

}

function withTarget(uri, cb) {
    //Testing purposes only!
    request(`http://${uri}/rpc/interface.js`, (err, res, body) => {
        cb(eval(body)(uri, request));
    });
}


module.exports = { serve, call, withTarget }

