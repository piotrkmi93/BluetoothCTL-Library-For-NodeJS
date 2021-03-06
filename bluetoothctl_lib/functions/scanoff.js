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
            let exists = !!~data.indexOf("Discovery stopped");

            if (exists && !self.resolveFuncRun && !self.rejectFuncRun) {

                clearTimeout(self.timeout);
                self.resolveFuncRun = true;
                self.alreadyRun = false;
                self.destroyCurrentTakeOverFunc();
                self.tout(() => self.resolveFunc({
                    success: true
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

            console.error("SCANOFF COMMAND ALREADY RUNNING");

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

                self.tout(() => term.write("scan off\r"));

                self.timeout = setTimeout(
                    () => {
                        self.rejectFuncRun = true;
                        self.destroyCurrentTakeOverFunc();
                        self.tout(() => reject({
                            success: false,
                            reason: "SCANOFF: Time limit has been reached"
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
