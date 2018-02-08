let bluetoothctl = require("./bluetoothctl_lib/bluetoothctl");

console.log(3, bluetoothctl.isRunning());

bluetoothctl.exec(
    "begin", {},
    data => {
        console.log("URUCHOMIONO", data);
        console.log(10, bluetoothctl.isRunning());

        resolve()

        //        bluetoothctl.exec(
        //            "scanon",
        //            {},
        //            data => {
        //                console.log( "SKANUJE", data);
        //                
        //                
        //                bluetoothctl.exec(
        //                    "devices",
        //                    {},
        //                    data => {
        //                        console.log( "DEVICES", data );
        //                    },
        //                    err  => console.log( "DEVICES FALSE", err)
        //                )
        //                
        //            },
        //            err  => console.log( "NIE SKANUJE", err)
        //        );

    },
    err => console.log("NIE URUCHOMIONO", err)
);


function resolve(data) {
    data && console.log("DATA", data);

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
