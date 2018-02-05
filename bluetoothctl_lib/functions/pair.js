let self = {
    resolveFunc     : undefined,
    rejectFunc      : undefined,

    alreadyRun      : false,
    resolveFuncRun  : false,
    rejectFuncRun   : false,

    attrs           : undefined,

    attempt         : 0,
    maxAttempt      : 100,
    
    timeout         : undefined
};

function takeOver( data ) {
    
    if( typeof data === "string" ){
        
        if( ++self.attempt < self.maxAttempt ){
            
            let exists = !!~data.indexOf( "Pairing successful" );     
            let fail = !!~data.indexOf( "Device " + self.attrs.mac + " not available" );
            let fail2 = !!~data.indexOf( "Failed to pair" );
            
            if( exists && !self.resolveFuncRun ) {
                clearTimeout( self.timeout );
                self.resolveFuncRun = true;
                self.alreadyRun = false;
                self.resolveFunc( { success: true } );
            }
            else if( fail && !self.rejectFuncRun ) {
                clearTimeout( self.timeout );
                self.rejectFuncRun = true;
                self.alreadyRun = false;
                self.rejectFunc( { success: false, reason: "Device " + self.attrs.mac + " not available" } );
            }
            else if( fail2 && !self.rejectFuncRun ) {
                clearTimeout( self.timeout );
                self.rejectFuncRun = true;
                self.alreadyRun = false;
                self.rejectFunc( { success: false, reason: "Failed to pair with " + self.attrs.mac } );
            }

        } else {

            clearTimeout( self.timeout );
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
                typeof reject   !== "undefined" &&
                typeof attrs     !== "undefined" &&
                typeof attrs.mac !== "undefined") {

                self.resolveFunc = resolve;
                self.rejectFunc = reject;

                self.alreadyRun = true;
                self.resolveFuncRun = false;
                self.rejectFuncRun = false;

                self.attrs = attrs;
                self.attempt = 0;

                term.on("data", data => takeOver( data ));

                term.write("pair " + attrs.mac + "\r");
                
                self.timeout = setTimeout(
                    () => reject({ success: false, reason: "Time limit has been reached" }),
                    30000
                );

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