#!/bin/bash
PATH=/sbin:/usr/local/bin:$PATH
if	ifconfig wlan0 2>&1 | grep -i 'Device not found' >/dev/null
then	exit 0
fi

TMP=/tmp/$(basename $0).$$
gpio mode 0 output
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
gpio write 0 0
rm -f $TMP
