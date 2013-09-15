#!/bin/bash

# test of ServoBlaster PWM


if	! ps | grep -v grep | grep servod 
then	sudo ~/app/PiBits/ServoBlaster/user/servod --p1pins=11 --min=0 --max=2000
	trap 'sudo killall servod' EXIT
fi

while true
do	for i in $(seq 0 200 2000) $(seq 2000 -200 0)
	do echo 0=$i >/dev/servoblaster; sleep .1
	done; 
done
