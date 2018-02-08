# BluetoothCTL-Library-For-NodeJS

Library for NodeJS using for connect with xterm on Linux OS to bluetoothctl program.

## Getting started

Just download it to your computer, type npm install and make magic with your bluetooth controller using NodeJS.

## Example

```
bluetoothctl.exec(
        < COMMAND_NAME >, {
            < PARAMS, ... >
        },
        < RESOLVE FUNCTION >,
        < REJECT FUNCTION >
    );
```

Standard use:
```
let bluetoothctl = require("./bluetoothctl_lib/bluetoothctl");

bluetoothctl.exec(
    "begin", 
    undefined,
    data => {
        console.log( "BEGIN SUCCESS", data );
        console.log( "IS RUNNING?", bluetoothctl.isRunning() );

        bluetoothctl.exec(
            "devicesWithInfo", {
                seconds: 10
            },
            data => console.log( "DEVICES WITH INFO", data.devices ),
            err  => console.log( "ERROR", err )
        );

    },
    err => console.log( "BEGIN FAILED", err )
);
```

## Available methods

- exec        ( function ) = runs command
- isRunning   ( function ) = inform if bluetoothctl program is turned on right now
- isScanning  ( function ) = inform if bluetoothctl is scanning right now

## Available commands

- begin           ( function ) = turn on the bluetoothctl program
- end             ( function ) = turn off the bluetoothctl program
- scanon          ( function ) = turn on scanning
- scanoff         ( function ) = turn off scanning
- devices         ( function ) = shows list of found devices
- info            ( function ) = gets details of device by his mac address
                  @param mac ( string )
- pair            ( function ) = pairs with device by his mac address
                  @param mac ( string )
- remove          ( function ) = remove paired device by his mac address
                  @param mac ( string )
- paireddevices   ( function ) = shows list of paired devices
- devicesWithInfo ( function ) = turns scannning on, waits n secons, gets list of devices or paired devices, gets details of them and turns off scanning
                  @param seconds      ( integer )
                  @param only_paired  ( boolean )

## TODO

- handling pin passcode
