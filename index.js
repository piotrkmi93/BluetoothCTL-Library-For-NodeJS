let bluetoothctl = require("./bluetoothctl_lib/bluetoothctl");

console.log( 3, bluetoothctl.isRunning() );

bluetoothctl.exec(
    "begin",
    {},
    data => {
        console.log( "URUCHOMIONO", data );
        
        console.log( 11, bluetoothctl.isRunning() );
        
        
        // TEST 1
        /*bluetoothctl.exec(
            "info",
            //{mac: "00:80:25:34:D8:10"},
            {mac: "E0:AA:96:49:53:6D"},
            data => console.log("SUKCES", data),
            err => console.log("BLAD", err)
        );*/
        
        
        
        
        
        
        
        
        
        
        
        
        
        // TEST 2
        /*bluetoothctl.exec(
            "scanon",
            {},
            data => {
                
                setTimeout(
                    () => {
                      
                        bluetoothctl.exec(
                            "devices",
                            {},
                            data => {
                                
                                console.log("devices", data.devices);
                                
                                if(data.devices.length){
                                    
                                    for(let device of data.devices){
                                        
                                        if(device.mac === "00:80:25:34:D8:10"){
                                            
                                            bluetoothctl.exec(
                                                "info",
                                                {mac: device.mac},
                                                data => console.log("SUKCES", data),
                                                err => console.log("BLAD", err)
                                            );
                                            
                                        }
                                        
                                    }
                                    
                                    
                                    
                                }
                                
                            },
                            err => console.log("BLAD", err)
                        )
                        
                    },
                    5000
                )
                
            },
            err => console.log("BLAD", err)
        );*/
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        // TEST 3
        bluetoothctl.exec(
            "devicesWithInfo",
            {seconds: 5},
            data => {
                console.log("devices", data.devices);
                
                for(let device of data.devices){
                    
                    // TEST 4
                    /*if("00:80:25:34:D8:10" == device.mac){
                        
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
                        
                    }*/
                    
                }
            },
            err  => console.log(err)
        );
        
    },
    data => console.log( "NIE URUCHOMIONO", data )
);



