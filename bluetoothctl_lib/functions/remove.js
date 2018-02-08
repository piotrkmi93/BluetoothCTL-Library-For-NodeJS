let self = {
    resolveFunc: undefined,
    rejectFunc: undefined,

    alreadyRun: false,
    resolveFuncRun: false,
    rejectFuncRun: false,

    attrs: undefined,

    attempt: 0,
    maxAttempt: 100,

    timeout: undefined,

    destroyCurrentTakeOverFunc: undefined,
    tout: undefined
};

function takeOver(data) {

    if (typeof data === "string") {

        if (++self.attempt < self.maxAttempt) {

            let exists = !!~data.indexOf("Device has been removed");
            let fail = !!~data.indexOf("Device " + self.attrs.mac + " not available");

            if (exists && !self.resolveFuncRun && !self.rejectFuncRun) {
                clearTimeout(self.timeout);
                self.resolveFuncRun = true;
                self.alreadyRun = false;
                self.destroyCurrentTakeOverFunc();
                self.tout(() => self.resolveFunc({
                    success: true
                }));
            } else if (fail && !self.rejectFuncRun && !self.resolveFuncRun) {
                clearTimeout(self.timeout);
                self.rejectFuncRun = true;
                self.alreadyRun = false;
                self.destroyCurrentTakeOverFunc();
                self.tout(() => self.rejectFunc({
                    success: false,
                    reason: "Device " + self.attrs.mac + " not available"
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
                    reason: "Max attempt has been achieved"
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

            console.error("REMOVE COMMAND ALREADY RUNNING");

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

                self.tout(() => term.write("remove " + attrs.mac + "\r"));

                self.timeout = setTimeout(
                    () => {
                        self.rejectFuncRun = true;
                        self.destroyCurrentTakeOverFunc();
                        self.tout(() => reject({
                            success: false,
                            reason: "REMOVE: Time limit has been reached"
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
