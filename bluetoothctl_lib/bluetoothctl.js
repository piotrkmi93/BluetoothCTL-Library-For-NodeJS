let pty = require("ptyw.js/lib/pty.js");
let term = pty.spawn("bash", [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
});

let running = false,
    scanning = false,
    beginning = false,
    ending = false,
    commands = {
        begin:                  require("./functions/begin")            (term),
        end:                    require("./functions/end")              (term),
        scanon:                 require("./functions/scanon")           (term),
        scanoff:                require("./functions/scanoff")          (term),
        devices:                require("./functions/devices")          (term),
        info:                   require("./functions/info")             (term),
        pair:                   require("./functions/pair")             (term),
        remove:                 require("./functions/remove")           (term),
        paireddevices:          require("./functions/paireddevices")    (term),
        devicesWithInfo:        devicesWithInfo
    };


module.exports = {
    
    exec: exec,
    
    isRunning: () => running,
    isScanning: () => scanning
    
};

function exec(command, attrs, resolve, reject){
    
    if(
        typeof command === "string" &&
        commands.hasOwnProperty( command ) &&
        typeof resolve !== "undefined" &&
        typeof reject !== "undefined"
    ){
        
        if( running ) {
            
            if      (command === "end")         end(attrs, resolve, reject);
            else if (command === "scanon")      scanon(attrs, resolve, reject);
            else if (command === "scanoff")     scanoff(attrs, resolve, reject);
            else if (command === "devices")     devices(attrs, resolve, reject);
            else commands [ command ] ( attrs, resolve, reject );

        } else {
        
            if (command === "begin"){  begin(attrs, resolve, reject); } 
            else {
                
                reject({
                    success: false,
                    reason: "Bluetoothctl is not running"
                });
                
            }
                
        }
        
    } else {
        console.log("Error in parameters while calling " + String(command));
        console.log(command, resolve, reject);
    }
    
}


// rest stuff
function begin(attrs, resolve, reject){
    beginning = true;
    commands [ "begin" ] ( attrs, data => {
        running = data.success;
        beginning = false;
        resolve(data);
    }, reject );
}

function end(attrs, resolve, reject){
    ending = true;
    commands [ "end" ] ( attrs, data => {
        running = !data.success;
        ending = false;
        resolve(data);
    }, reject );
}

function scanon(attrs, resolve, reject){
    if(!scanning){
        commands [ "scanon" ] ( attrs, data => {
            scanning = data.success;
            resolve(data);
        }, reject );
    } else {
        reject({ success: false, reason: "Scanning is already turned on" });
    }
}

function scanoff(attrs, resolve, reject){
    if(scanning){
        commands [ "scanoff" ] ( attrs, data => {
            scanning = !data.success;
            resolve(data);
        }, reject );
    } else {
        reject({ success: false, reason: "Scanning is already turned off" });
    }
}

function devices(attrs, resolve, reject){
    commands [ "devices" ] ( attrs, data => {
        devices = data.devices;
        resolve(data);
    }, reject );
}

function devicesWithInfo( attrs, resolve, reject, index = 0, array = [], first = true ) {
    
    // console.log("scanning", scanning);
    if(scanning){
        
        // console.log("first", first);
        if( first ){
        
            let fun;
            if( !attrs.only_paired ) fun = devices;
            else fun = commands.paireddevices;
            
            fun(
                {},
                data => {
                    // console.log("devices without info", data.devices);
                    array = data.devices
                    if(!array.length) resolve({ devices: [] })
                    else devicesWithInfo(attrs,resolve,reject,0,array,false);
                },
                err => reject(err)
            )

        } else {
            
            if(typeof array[index] !== "undefined"){
                
                if(typeof array[index].mac !== "undefined"){

                    commands.info(
                        {mac: array[index].mac},
                        data => {
                            // console.log("device with info", data.device);
                            array[index] = data.device;
                            setTimeout(() => devicesWithInfo(attrs, resolve, reject, index+1, array, false), 100);
                        },
                        err => reject(err)
                    );

                } else reject({ success: false, reason: "No mac given" });

            } else {
                scanoff(
                    {},
                    () => resolve({ success: true, devices: array }),
                    er => {
                        console.log(er);
                        resolve({ success: true, devices: array });
                    }
                )
                
            }
        }
        
    } else scanon(
        {}, 
        data => {
            console.log("Waiting " + attrs.seconds + " seconds");
            setTimeout(
                () => {
                    console.log(attrs.seconds + " seconds pass");
                    devicesWithInfo(attrs, resolve, reject, index, array, first)
                },
                (attrs.seconds || 5) * 1000
            );
            
        },
        err => reject(err)
    );
  
}