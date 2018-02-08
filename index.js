let bluetoothctl = require("./bluetoothctl_lib/bluetoothctl");

console.log( 3, bluetoothctl.isRunning() );

bluetoothctl.exec(
    "begin",
    {},
    data => {
        console.log( "URUCHOMIONO", data );
        console.log( 11, bluetoothctl.isRunning() );
        resolve();
    },
    err => console.log( "NIE URUCHOMIONO", err )
);


function resolve(data){
    data && console.log("DATA", data);
    
    bluetoothctl.exec(
        "devicesWithInfo",
        {seconds: 1},
        resolve,
        reject
    );
    
}

function reject(err){
    err && console.log("ERR", err);
}