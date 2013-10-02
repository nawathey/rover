#!/bin/bash

# use servoBlaster to pulse the LED

if      ! \ps -ef | grep -v grep | grep servod >/dev/null 2>&1
then    sudo ~/app/PiBits/ServoBlaster/user/servod --min=0 --max=2000 --p1pins=11
        trap "sudo killall servod" EXIT
fi

while   :
do      for i in 0 $(seq 0 1000 2000) $(seq 2000 -400 0) 0
        do      echo 0=$i >/dev/servoblaster
                sleep .1
        done
        sleep .5
done
