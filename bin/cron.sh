#!/bin/bash

# include jobs here that should be run repeatedly

# expect $0 to be something like /home/pi/bin/cron.sh, we want the 'pi' part of the path
ROVERUSER=$(basename $(dirname $(dirname $0)))
[[ "$ROVERUSER" = . ]] && echo "$0 is not in the format /home/<user>/bin/cron.sh" >&2 && exit 1

PATH=/sbin:/usr/local/bin:$PATH

gpio mode 0 output

# monitor if wiringPi pin 11 (GPIO 7, physical pin 26, see 'gpio readall') is grounded
( 
        gpio mode 11 up
        while :
        do      if      [[ $(gpio read 11) = 0 ]] 
                then    (while :; do gpio write 0 1; sleep .1; gpio write 0 0; sleep .1; done) &
                        halt
                fi
                sleep .5
        done 
) &

# check wireles network
(
        while :
        do      if	ifconfig wlan0 2>&1 | grep -i 'Device not found' >/dev/null
                then	exit 0
                fi
                TMP=/tmp/$(basename $0).$$
                h=$(date +%H)
                h=${h##0}	# strip leading 0
                # (( h > 9 && h < 22 )) && gpio write 0 1
                if	( ifconfig wlan0 2>&1 | grep 'inet addr:192' >$TMP ) && \
                        ( ping -c 1 -q 192.168.1.1 >>$TMP 2>&1 ) 
                then	echo $(date) wlan0 ok
                else	echo $(date) wlan0 failed :
                        cat $TMP
                        sudo ifdown wlan0
                        sudo ifup wlan0
                fi
                rm -f $TMP
                sleep 30
        done
) &

# check disk space
(
        while :
        do      DIR=/home/$ROVERUSER/log
                while :
                do     freeSpace=$(df / | awk '/dev/ { print $4; }')
                       (( freeSpace > 5000 ))  && break 
                       f=$DIR/$(ls -t $DIR | head -1)
                       echo $(date) deleted $f >> $DIR/delete.log
                       rm -f "$f"
                done
                sleep 120
        done
) &
