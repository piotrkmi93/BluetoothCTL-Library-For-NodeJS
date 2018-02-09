/**
    PTY instance
*/
let pty = require("ptyw.js/lib/pty.js");

/**
    Emulated terminal object
*/
let term = pty.spawn("bash", [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
});

/**
    This function will take over the data from terminal and analyze it to find the correct pattern
    and run resolve or reject function
*/
let currentTakeOverFunc = undefined;

/**
    Just setTimeout function override
*/
let tout = (func, time = 100) => setTimeout(func, time);

/**
    This function takes every data from the terminal and send it to takeOver function if it's set
*/
term.on("data", data => {
    !!currentTakeOverFunc && currentTakeOverFunc(data);
});

/**
    This function is detroying the takeOver function when it is no longer needed
*/
function destroyCurrentTakeOverFunc() {
    currentTakeOverFunc = undefined;
}

/**
    This function sets takeOver function
*/
function setCurrentTakeOverFunc(func) {
    currentTakeOverFunc = func;
}

/**
    Set of some variables:
        running     ( true | false ) = inform that bluetoothctl program is running
        scanning    ( true | false ) = inform that is bluetoothctl scanning status is on
        beginning   ( true | false ) = if bluetoothctl program is turning on right now
        ending      ( true | false ) = if bluetoothctl program is turning off right now
        
    The commands object:
        begin           ( function ) = turn on the bluetoothctl program
        end             ( function ) = turn off the bluetoothctl program
        scanon          ( function ) = turn on scanning
        scanoff         ( function ) = turn off scanning
        devices         ( function ) = shows list of found devices
        info            ( function ) = gets details of device by his mac address
        pair            ( function ) = pairs with device by his mac address
        remove          ( function ) = remove paired device by his mac address
        paireddevices   ( function ) = shows list of paired devices
        devicesWithInfo ( function ) = turns scannning on, waits n secons, gets list of devices or paired devices, gets details of them and turns off scanning
*/
let running = false,
    scanning = false,
    beginning = false,
    ending = false,
    commands = {
        begin: require("./functions/begin")(term, setCurrentTakeOverFunc, destroyCurrentTakeOverFunc, tout),
        end: require("./functions/end")(term, setCurrentTakeOverFunc, destroyCurrentTakeOverFunc, tout),
        scanon: require("./functions/scanon")(term, setCurrentTakeOverFunc, destroyCurrentTakeOverFunc, tout),
        scanoff: require("./functions/scanoff")(term, setCurrentTakeOverFunc, destroyCurrentTakeOverFunc, tout),
        devices: require("./functions/devices")(term, setCurrentTakeOverFunc, destroyCurrentTakeOverFunc, tout),
        info: require("./functions/info")(term, setCurrentTakeOverFunc, destroyCurrentTakeOverFunc, tout),
        pair: require("./functions/pair")(term, setCurrentTakeOverFunc, destroyCurrentTakeOverFunc, tout),
        remove: require("./functions/remove")(term, setCurrentTakeOverFunc, destroyCurrentTakeOverFunc, tout),
        paireddevices: require("./functions/paireddevices")(term, setCurrentTakeOverFunc, destroyCurrentTakeOverFunc, tout),
        devicesWithInfo: devicesWithInfo
    };

/**
    The main module
        exec        ( function ) = runs command
        isRunning   ( function ) = inform if bluetoothctl program is turned on right now
        isScanning  ( function ) = inform if bluetoothctl is scanning right now
*/
module.exports = {

    exec: exec,

    isRunning: () => running,
    isScanning: () => scanning

};

/**
    Main function that execute choosed function
        @param command  ( string )                  = name of command
        @param attrs    ( object | undefined )      = attributes for command function
        @param resolve  ( function )                = function will be executed if successfuly get expected data
        @param reject   ( function )                = function will be executed if command process will fail
*/
function exec(command, attrs, resolve, reject) {

    if (
        typeof command === "string" &&
        commands.hasOwnProperty(command) &&
        typeof resolve !== "undefined" &&
        typeof reject !== "undefined"
    ) {

        if (running) {

            if (command === "end") end(attrs, resolve, reject);
            else if (command === "scanon") scanon(attrs, resolve, reject);
            else if (command === "scanoff") scanoff(attrs, resolve, reject);
            else commands[command](attrs, resolve, reject);

        } else {

            if (command === "begin") begin(attrs, resolve, reject);
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

/**
    Override for begin command, it sets the running flag if bluetoothctl program will run succesfully
        @param attrs    ( object | undefined )  = attributes for command function
        @param resolve  ( function )
        @param reject   ( function )
*/
function begin(attrs, resolve, reject) {
    beginning = true;
    commands["begin"](attrs, data => {
        running = data.success;
        beginning = false;
        resolve(data);
    }, reject);
}

/**
    Override for end command, it sets the running flag if bluetoothctl program will exit succesfully
        @param attrs    ( object | undefined )  = attributes for command function
        @param resolve  ( function )
        @param reject   ( function )
*/
function end(attrs, resolve, reject) {
    ending = true;
    commands["end"](attrs, data => {
        running = !data.success;
        ending = false;
        resolve(data);
    }, reject);
}

/**
    Override for scanon command, it sets the scanning flag if its succesfully turned on
        @param attrs    ( object | undefined )  = attributes for command function
        @param resolve  ( function )
        @param reject   ( function )
*/
function scanon(attrs, resolve, reject) {
    if (!scanning) {
        commands["scanon"](attrs, data => {
            scanning = data.success;
            resolve(data);
        }, reject);
    } else {
        reject({
            success: false,
            reason: "Scanning is already turned on"
        });
    }
}

/**
    Override for scanoff command, it sets the scanning flag if its succesfully turned off
        @param attrs    ( object | undefined )  = attributes for command function
        @param resolve  ( function )
        @param reject   ( function )
*/
function scanoff(attrs, resolve, reject) {
    if (scanning) {
        commands["scanoff"](attrs, data => {
            scanning = !data.success;
            resolve(data);
        }, reject);
    } else {
        reject({
            success: false,
            reason: "Scanning is already turned off"
        });
    }
}

/**
    This function process:
        1. Check if scanning is on
        2. Turn on scanning if its not running and wait @attrs.seconds seconds
        3. Check if it's first run of function
        4. Get devices or paired devices if @attrs.only_paired = true
        5. Get infos of devices
        6. Return devices array
        
    @param attrs    ( object )
    @param resolve  ( function )
    @param reject   ( function )
    @param index    ( integer )
    @param array    ( array )
    @param first    ( boolean )
*/
function devicesWithInfo(attrs, resolve, reject, index = 0, array = [], first = true) {

    if (scanning) {

        if (first) {

            if (attrs.hasOwnProperty("only_paired") && attrs.only_paired) {
                commands.paireddevices({},
                    data => {
                        array = data.devices;
                        if ( !array.length ) 
                            scanoff(
                                {},
                                () => resolve({
                                    success: true,
                                    devices: array,
                                    msg: "No devices has been found"
                                }),
                                err => reject(err)                                
                            );
                        else devicesWithInfo(attrs, resolve, reject, 0, array, false);
                    },
                    err => reject(err)
                );
            } else {
                commands.devices({},
                    data => {
                        array = data.devices;
                        if ( !array.length ) 
                            scanoff(
                                {},
                                () => resolve({
                                    success: true,
                                    devices: array,
                                    msg: "No devices has been found"
                                }),
                                err => reject(err)                                
                            );
                        else devicesWithInfo(attrs, resolve, reject, 0, array, false);
                    },
                    err => reject(err)
                );
            }

        } else {

            if (typeof array[index] !== "undefined") {

                if (typeof array[index].mac !== "undefined") {

                    commands.info({
                            mac: array[index].mac
                        },
                        data => {
                            array[index] = data.device;
                            setTimeout(() => devicesWithInfo(attrs, resolve, reject, index + 1, array, false), 100);
                        },
                        err => reject(err)
                    );

                } else reject({
                    success: false,
                    reason: "No mac given"
                });

            } else {

                scanoff({},
                    () => resolve({
                        success: true,
                        devices: array
                    }),
                    err => reject(err)
                );

            }
        }

    } else {

        scanon({},
            data => {
                setTimeout(
                    () => {
                        devicesWithInfo(attrs, resolve, reject, index, array, first)
                    },
                    (attrs.seconds || 5) * 1000
                );

            },
            err => reject(err)
        );

    }
}
