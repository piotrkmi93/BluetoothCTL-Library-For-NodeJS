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

function takeOver(data, destroyCurrentTakeOverFunc) {

    self.devices = [];

    if (typeof data === "string") {

        let lines = data.split("\r\n");

        if (lines.length) {

            if (!self.resolveFuncRun && !self.rejectFuncRun) {

                for (let line of lines) {

                    let idx = line.indexOf("Device ");
                    if (idx === 0) {
                        let mac = line.slice(line.indexOf("Device ") + 7, 24);
                        let name = line.slice(line.indexOf("Device ") + 25);

                        let device = self.devices.find(dev => dev.mac === mac);

                        if (!device) self.devices.push({
                            mac: mac,
                            name: name
                        });
                    }
                }

                clearTimeout(self.timeout);
                self.resolveFuncRun = true;
                self.alreadyRun = false;
                self.destroyCurrentTakeOverFunc();
                self.tout(() => self.resolveFunc({
                    success: true,
                    devices: self.devices
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

            console.error("DEVICES COMMAND ALREADY RUNNING");

        } else {

            if (typeof resolve !== "undefined" &&
                typeof reject !== "undefined") {

                self.resolveFunc = resolve;
                self.rejectFunc = reject;

                self.alreadyRun = true;
                self.resolveFuncRun = false;
                self.rejectFuncRun = false;

                self.attrs = attrs;
                self.attempt = 0;

                self.tout(() => term.write("devices\r"));

                self.timeout = setTimeout(
                    () => {
                        self.rejectFuncRun = true;
                        self.destroyCurrentTakeOverFunc();
                        self.tout(() => reject({
                            success: false,
                            reason: "DEVICES: Time limit has been reached"
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
