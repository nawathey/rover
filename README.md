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

# Rover Usage

To run:

    node rover.js

To avoid wear out SSD, setup /tmp as tmpfs

    sudo vi /etc/default/tmpfs
    
To enable auto start on reboot, add to init.d:

    sudo cp etc/init.d/rover.sh /etc/init.d
    sudo update-rc.d rover.sh defaults

Add this to crontab to monitor and restart the WiFi link if necessary

    0,5,10,15,20,25,30,35,40,45,50,55 * * * * /home/samlu/rover/bin/checkWlan.sh >> /tmp/checkWlan.log 2>&1

# optional motion detection setup

    Read the page https://github.com/dozencrows/motion/tree/mmal-test

    cd /tmp
    wget https://www.dropbox.com/s/xdfcxm5hu71s97d/motion-mmal.tar.gz
    tar xzf motion-mmal.tar.gz motion
    sudo mv motion /usr/bin
    sudo apt-get install libjpeg62
    sudo cp etc/motion.conf /etc
    sudo cp etc/default/motion /etc/default

    Once 'motion' is running, the output files are stored in ~/log. Note that only a single process can access the camera at a time so 'motion' can't be run while mjpg_streamer is running.

# clean up

    sudo apt-get clean
