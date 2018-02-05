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
            data => {
                console.log("paired-devices", data.devices);
                
                for(let device of data.devices){
                    
                    if("00:80:25:34:D8:10" == device.mac){
                        
                        bluetoothctl.exec(
                            "pair",
                            {mac: device.mac},
                            data => {
                                console.log(data);

                                bluetoothctl.exec(
                                    "devicesWithInfo",
                                    {seconds: 5, only_paired: true},
                                    data => console.log("paired-devices", data.devices),
                                    err  => console.log(err)
                                );    
                            },
                            err  => console.log(err)
                        );
                        
                    }
                    
                }
            },
            err  => console.log(err)
        );
        
    },
    data => console.log( "NIE URUCHOMIONO", data ),
);



