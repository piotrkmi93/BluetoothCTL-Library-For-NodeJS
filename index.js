let bluetoothctl = require("./bluetoothctl_lib/bluetoothctl");

console.log( 3, bluetoothctl.isRunning() );

bluetoothctl.exec(
    "begin",
    {},
    data => {
        console.log( "URUCHOMIONO", data );
        
        console.log( 11, bluetoothctl.isRunning() );
        
        
        bluetoothctl.exec(
            "devicesWithInfo", 
            {seconds: 5}, 
            data => console.log(data),
            err  => console.log(err)
        );
        
        /*bluetoothctl.exec(
            "scanon",
            {},
            data => console.log(data),
            err  => console.log(err )
        );
        
        setTimeout(() => {
            
            bluetoothctl.exec(
                "devices",
                {},
                data => {
                    console.log(data.devices);
                
                    if(data.devices.length){
                        
                        bluetoothctl.exec(
                            "info",
                            {mac: data.devices[0].mac},
                            data => console.log(data),
                            err  => console.log(err )
                        );
                        
                    }
                    
                },
                err     => console.log(err)
            );
            
        }, 5000);*/
        
        
        
//        bluetoothctl.exec(
//            "end",
//            undefined,
//            data => {
//                console.log( "WYLACZONO", data );
//                
//                console.log( 19, bluetoothctl.isRunning() );
//            },
//            data => console.log( "NIE WYLACZONO", data ),
//        );
    },
    data => console.log( "NIE URUCHOMIONO", data ),
);



