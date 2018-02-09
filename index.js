let bluetoothctl = require("./bluetoothctl_lib/bluetoothctl");

let counter = 0;

bluetoothctl.exec(
    "begin", 
    undefined,
    data => {
        console.log( "BEGIN SUCCESS", data );

        resolve();

    },
    err => console.log( "BEGIN FAILED", err )
);


function resolve(data) {
    data && console.log(++counter, "DATA", data);

    bluetoothctl.exec(
        "devicesWithInfo", {
            seconds: 10
        },
        resolve,
        reject
    );

}

function reject(err) {
    err && console.log("ERR", err);
}
