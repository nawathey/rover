rover
=====

Runs on the Raspberry Pi with a Camera Module mounted on top of a mobile platform controlled by Handy Board.

# Installation

Install nodejs. 

Copy the files onto Raspberry Pi:

    git clone git@github.com:s8mlu/rover.git
    cd rover; npm install
    git clone git@github.com:s8mlu/node-login.git
    cd node-login; npm install
    cd app/server/modules; 
    cp email-settings.js email-settings-mine.js
    vi email-settings-mine.js # put in your own info here

# Usage

To run:

    node rover.js

To avoid wear out SSD, setup /tmp as tmpfs

    sudo vi /etc/default/tmpfs
    
To enable auto start on reboot, add to init.d:

    sudo cp bin/rover.sh /etc/init.d
    sudo update-rc.d rover.sh defaults

Add this to crontab to monitor and restart the WiFi link if necessary

    0,5,10,15,20,25,30,35,40,45,50,55 * * * * /home/samlu/rover/bin/checkWlan.sh >> /tmp/checkWlan.log 2>&1
