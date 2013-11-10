Rover Pi
========

A [Raspberry Pi](http://www.raspberrypi.org) home monitoring experiment.

It runs in one of the following modes:
+ Mobile platform controlled by [Handy Board](http://www.handyboard.com/) with the camera on top
+ Standalone surveillance camera with motion capture and recording

# Hardware

[TODO]

# Software Installation

Needless to say you need to first get a Raspberry Pi with the latest Raspbian OS.

Install [Node.js](http://nodejs.org). 

Install [MJPG-Streamer for Raspberry Pi](https://github.com/jacksonliam/mjpg-streamer.git).

Login to the Raspberry Pi and clone the files from GitHub:

    git clone git@github.com:s8mlu/node-login.git
    cd node-login; npm install
    cd app/server/modules; 
    cp email-settings.js email-settings-mine.js
    vi email-settings-mine.js   # put in your own info here

    cd ..
    git clone git@github.com:s8mlu/rover.git
    cd rover; npm install
    cp idPwd.json idPwd-mine.json
    vi idPwd-mine.json   # pick your own id/pwd, be careful to leave the format EXACTLY as is

# Rover setup

To avoid wear out the SSD, setup /tmp as tmpfs

    sudo vi /etc/default/tmpfs
    
To enable auto start on reboot, add to init.d:

    sudo cp etc/init.d/rover.sh /etc/init.d
    sudo update-rc.d rover.sh defaults

Add this to crontab to monitor and restart the WiFi link if necessary

    0,5,10,15,20,25,30,35,40,45,50,55 * * * * /home/samlu/rover/bin/checkWlan.sh >> /tmp/checkWlan.log 2>&1

# Motion detection setup

Instead of live streaming, we can detect motion and record it on disk. Note that only a single process can access the camera at a time so 'motion' can't be run while 'mjpg-streamer' is running.

Follow the instruction to install [motion](https://github.com/dozencrows/motion/tree/mmal-test)

    cd /tmp
    wget https://www.dropbox.com/s/xdfcxm5hu71s97d/motion-mmal.tar.gz
    tar xzf motion-mmal.tar.gz motion
    sudo mv motion /usr/bin
    sudo apt-get install libjpeg62

Once 'motion' is running, the output files are stored in public/log. 

Add this to crontab to ensure we don't run out of space on disk

    0,5,10,15,20,25,30,35,40,45,50,55 * * * * /home/samlu/rover/bin/checkSpace.sh >> /tmp/checkSpace.log 2>&1

# Automatic startup on reboot

    sudo cp -pr etc /etc
    sudo update-rc.d motion defaults
    sudo update-rc.d rover.sh defaults

Disable rover streaming if you wish to use the surveillance motion capture mode:
    sudo update-rc.d rover.sh disable   

# Clean up

    sudo apt-get clean

# Dev setup

I following [these instructions](http://stackoverflow.com/questions/473478/vim-jslint/5893447#5893447) to enable Jshint to Vim integration using Syntastic plugin.

# Open issues

* The videos are encoded in msmpeg4 format, which enables Safari on Mac OS and any browser on Windows to play them, but won't play on iOS devices
* The files under '/log' are not secured, because QuickTime plug-in does not pass cookies when making the request for the avi files. That said, the filenames are obscure enought that it'll be hard for anyone to guess and download the images.
