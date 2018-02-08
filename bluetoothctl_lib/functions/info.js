let self = {
    resolveFunc: undefined,
    rejectFunc: undefined,

    alreadyRun: false,
    resolveFuncRun: false,
    rejectFuncRun: false,

    attrs: undefined,

    attempt: 0,
    maxAttempt: 100,

    devices: [],
    timeout: undefined,

    destroyCurrentTakeOverFunc: undefined,
    tout: undefined
};

function takeOver(data) {

    if (typeof data === "string") {

        let lines = data.split("\r\n");

        if (lines.length) {

            if (lines.length > 2 && (!!~lines[0].indexOf("Device ") || !!~lines[1].indexOf("Device ")) && !self.resolveFuncRun && !self.rejectFuncRun) {

                let device = {};

                for (let line of lines) {

                    if (~line.indexOf("Device ")) device.mac = line.slice(7);
                    else if (~line.indexOf("\tName: ")) device.name = line.slice(7);
                    else if (~line.indexOf("\tAlias: ")) device.alias = line.slice(8);
                    else if (~line.indexOf("\tClass: ")) device.class = line.slice(9);
                    else if (~line.indexOf("\tPaired: ")) device.paired = line.slice(9);
                    else if (~line.indexOf("\tTrusted: ")) device.trusted = line.slice(10);
                    else if (~line.indexOf("\tBlocked: ")) device.blocked = line.slice(10);
                    else if (~line.indexOf("\tConnected: ")) device.connected = line.slice(12);
                    else if (~line.indexOf("\tLegacyPairing: ")) device.legacyPairing = line.slice(16);

                }

                clearTimeout(self.timeout);
                self.resolveFuncRun = true;
                self.alreadyRun = false;
                self.destroyCurrentTakeOverFunc();
                self.tout(() => self.resolveFunc({
                    success: true,
                    device: device
                }));

            }

        } else {

            if (!self.resolveFuncRun && !self.rejectFuncRun) {
                clearTimeout(self.timeout);
                self.rejectFuncRun = true;
                self.alreadyRun = false;
                self.destroyCurrentTakeOverFunc();
                self.tout(() => self.rejectFunc({
                    success: false,
                    reason: "No data returned"
                }));
            }
        }

    }

}

module.exports = (term, setCurrentTakeOverFunc, destroyCurrentTakeOverFunc, tout) => {

    if (!self.destroyCurrentTakeOverFunc)
        self.destroyCurrentTakeOverFunc = destroyCurrentTakeOverFunc;
    if (!self.tout)
        self.tout = tout;

    return function (attrs, resolve, reject) {

        if (self.alreadyRun) {

            console.error("INFO COMMAND ALREADY RUNNING");

        } else {

            if (typeof resolve !== "undefined" &&
                typeof reject !== "undefined" &&
                typeof attrs !== "undefined" &&
                typeof attrs.mac !== "undefined") {

                self.resolveFunc = resolve;
                self.rejectFunc = reject;

                self.alreadyRun = true;
                self.resolveFuncRun = false;
                self.rejectFuncRun = false;

                self.attrs = attrs;
                self.attempt = 0;

                self.tout(() => term.write("info " + attrs.mac + "\r"));

                self.timeout = setTimeout(
                    () => {
                        self.rejectFuncRun = true;
                        self.destroyCurrentTakeOverFunc();
                        self.tout(() => reject({
                            success: false,
                            reason: "INFO: Time limit has been reached"
                        }));
                    },
                    30000
                );

                setCurrentTakeOverFunc(takeOver);

            } else {

                console.error({
                    attrs: attrs,
                    resolve: resolve,
                    reject: reject
                });

            }

        }

    }

};
