rover
=====

Runs on the Raspberry Pi with a Camera Module mounted on top of a mobile platform controlled by Handy Board.

# Installation

    git clone git@github.com:s8mlu/rover.git
    cd rover; npm install
    git clone git@github.com:s8mlu/node-login.git
    cd node-login; npm install
   
Modify the email id/passwords in 
    node-login/app/server/modules/email-settings-mine.js


# Usage

To avoid wear out SSD, setup /tmp as tmpfs

    sudo vi /etc/default/tmpfs

Install nodejs. Copy the files onto Raspberry Pi, run:

    node rover.js
    
To enable auto start on reboot, do these as root:

    cp bin/rover.sh /etc/init.d
    update-rc.d rover.sh defaults

Add this to crontab

    0,5,10,15,20,25,30,35,40,45,50,55 * * * * /home/samlu/rover/bin/checkWlan.sh >> /tmp/checkWlan.log 2>&1
