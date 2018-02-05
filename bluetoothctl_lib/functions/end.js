let self = {
    resolveFunc     : undefined,
    rejectFunc      : undefined,

    alreadyRun      : false,
    resolveFuncRun  : false,
    rejectFuncRun   : false,

    attrs           : undefined,

    attempt         : 0,
    maxAttempt      : 100
};

function takeOver( data ) {
    
    if( typeof data === "string" ){

        if( ++self.attempt < self.maxAttempt ){
            let exists = !~data.indexOf( "[bluetooth]" );     
            if( exists && !self.resolveFuncRun ) {
                self.resolveFunc( { success: true } );
                self.resolveFuncRun = true;
                self.alreadyRun = false;
            }

        } else {

            self.rejectFunc( { success: false, reason: "Max attempt has been achieved" } );
            self.rejectFuncRun = true;
            self.alreadyRun = false;

        }

    }

}

module.exports = ( term ) => {
    
    return function(attrs, resolve, reject) {
        
        if( self.alreadyRun ){
        
            console.error("COMMAND ALREADY RUNNING");

        } else {

            if( typeof resolve  !== "undefined" &&
                typeof reject   !== "undefined") {

                self.resolveFunc = resolve;
                self.rejectFunc = reject;

                self.alreadyRun = true;
                self.resolveFuncRun = false;
                self.rejectFuncRun = false;

                self.attrs = attrs;
                self.attempt = 0;

                term.on("data", data => takeOver( data ));

                term.write("exit\r");

            } else {

                console.error( {
                    attrs: attrs,
                    resolve: resolve,
                    reject: reject
                } );

            }

        }

    }
      
};