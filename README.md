Rover Pi
========

A [Raspberry Pi](http://www.raspberrypi.org) home monitoring experiment.

It runs in one of the following modes:
+ Mobile platform controlled by [Handy Board](http://www.handyboard.com/) with the camera on top
+ Standalone surveillance camera with motion capture and recording

There is a [web interface](#web-interface) powered by [Node.js](http://nodejs.org) that controls everything.

# Hardware

[To be described later]

# Software Installation

Needless to say you need to first get a Raspberry Pi with the latest Raspbian OS.

Install [Node.js](http://nodejs.org).

Install [MJPG-Streamer for Raspberry Pi](https://github.com/jacksonliam/mjpg-streamer.git).

Login to the Raspberry Pi and clone the forked version of 'node-login' files from GitHub:

    git clone git@github.com:s8mlu/node-login.git
    cd node-login
    npm install

Put in your own email ID and password to enable password recovery:

    cd app/server/modules
    cp email-settings.js email-settings-mine.js
    vi email-settings-mine.js   # put in your own info here and save
    cd ../../..

Clone the 'rover' files from GitHub:

    cd ..
    git clone git@github.com:s8mlu/rover.git
    cd rover
    npm install

The last bit is to just pick an ID and password to secure the socket between Node.js and mjpg-streamer:

    cp idPwd.json idPwd-mine.json
    vi idPwd-mine.json   # be careful to leave the format EXACTLY as is

# Rover setup

To avoid wear out the SSD, setup /tmp as tmpfs:

    sudo vi /etc/default/tmpfs

Add this to crontab to monitor and restart the WiFi link if necessary:

    0,5,10,15,20,25,30,35,40,45,50,55 * * * * /home/samlu/rover/bin/checkWlan.sh >> /tmp/checkWlan.log 2>&1

Reboot:

# Motion detection setup

Instead of live streaming, we can detect motion and record it on disk. Note that only a single process can access the camera at a time so 'motion' can't be run while 'mjpg-streamer' is running.

Follow the instruction to install [motion](https://github.com/dozencrows/motion/tree/mmal-test):

    cd /tmp
    wget https://www.dropbox.com/s/xdfcxm5hu71s97d/motion-mmal.tar.gz
    tar xzf motion-mmal.tar.gz motion
    sudo mv motion /usr/bin
    sudo apt-get install libjpeg62

Once 'motion' is running, the raw output files are stored in public/log. You can use 'Live' and 'Motion' on the [web interface](#web-interface) menu to view the live or captured files respectively.

Add this to crontab, which will delete old motion capture files periodically when space is running low on disk:

    0,5,10,15,20,25,30,35,40,45,50,55 * * * * /home/samlu/rover/bin/checkSpace.sh >> /tmp/checkSpace.log 2>&1

## Optional email setup

You may want to receive an email when motion is detected. To do so, we need to setup email from command line:

    sudo apt-get install ssmpt
    sudo apt-get install mailutils

Then add your account info to the mail config:

    sudo cat <<EOF >>/etc/ssmtp/ssmtp.conf
    AuthUser=youremail@gmail.com
    AuthPass=yourpassword
    FromLineOverride=YES
    mailhub=smtp.gmail.com:587
    UseSTARTTLS=YES
    EOF

And finally config motion to send an email when a new motion capture file is saved:

    vi etc/motion.conf  # change "on_picture_save echo motion detected %v | mail -s "motion detected" sam.w.lu@gmail.com"

# Automatic startup on reboot

To enable everything to start automatically upon reboot:

    sudo cp -pr etc /etc
    sudo update-rc.d motion defaults
    sudo update-rc.d rover.sh defaults

By default, if USB serial port is connected, rover start.sh will run 'mjpg-streamer'. In that case, motion capture is automatically disabled, because '/etc/default/motion' checks if port is already in use.

To enable motion capture even with USB serial port connected, you'd have to manually kill streamer and start motion:

    killall mjpg_streamer
    sudo /etc/init.d/motion start

If you wish to use the surveillance motion capture mode permanently, you can disable rover streaming mode:

    sudo update-rc.d rover.sh disable

# Web interface

Once everything is setup and running, point a browser at 'http://<hostname>:8088' to view the main web interface. You can create an account to access it.

Note that in order to play back the mpeg-4 files captured by motion, you'll need to use Safari or IE, not Chrome.

If you wish to view this outside of the local area network, you should enable port-forwarding on your router of these 2 ports: 8088 (the main web interface) and 8089 (for live mjpg-streamer).

If you're running motion detection, there is also port 8080 and 8081 to view the admin console and live capture respectively. Don't open these outside of your local area network since they cannot be secured. This also means that the Live screen on the menu won't work outside of your LAN.


# Update and clean up

Periodically, it's good to update the Raspbian OS:

    sudo rpi-update     # update firmware
    sudo apt-get update # sync package index
    sudo apt-get upgrade # get latest packages

After installation is all done, you may want to remove left-over files from 'apt-get' to conserve space:

    sudo apt-get clean

# Dev setup

I following [these instructions](http://stackoverflow.com/questions/473478/vim-jslint/5893447#5893447) to enable Jshint to Vim integration using Syntastic plugin.

# Open issues

* The motion captured videos are encoded in msmpeg4 format. Safari on Mac OS and any browser on Windows can play them, but not an iOS device.
* Motion capture performance is poor due to Raspberry Pi lack of CPU power, only 2 frames per second maximum.
* The files under '/log' are not secured, because QuickTime plug-in does not pass cookies when making the request for the avi files. That said, the filenames are obscure enought that it'll be hard for anyone to guess and download the images.
* Should create an installation script so that 'samlu' doesn't have to be hard coded in places.
