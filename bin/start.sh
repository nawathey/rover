#!/bin/bash
#
# start the rover server side
#
# setup RAMTMP and TMPFS_SIZE by:
# sudo vi /etc/default/tmpfs
#

exp=1
[[ "$1" = "file" ]] && exp=0 && shift
[[ "$1" ]] && w="$1" || w=640
[[ "$2" ]] && h="$2" || h=480

# enable LED output port
gpio export 17 out

TMP=/tmp/$$

# run node
if 	\ps -ef | grep -v grep | grep node >/dev/null 2>&1
then	echo node already running
else	cd ~/rover
	nohup /opt/node/bin/node rover.js >$TMP.node.out &
fi

# view this with http://rpi:8080/?action=stream
export LD_LIBRARY_PATH=./ 

if	(( exp == 1 )) 	# experimental, does not work
then	if 	\ps -ef | grep -v grep | grep mjpg_streamer >/dev/null 2>&1
	then	echo experimental MJPG streamer already running
	else	echo start experimental MJPG streamer without file system support
		cd ~/app/mjpg-streamer-raspi/mjpg-streamer-experimental
		nohup nice -n 15 ./mjpg_streamer -i "input_raspicam.so -fps 5 --width $w --height $h" -o "output_http.so -w ./www" >$TMP.mjpgexp.out &
	fi
else	TMPDIR=/tmp/stream
	mkdir -p $TMPDIR 
	if 	\ps -ef | grep -v grep | grep raspistill >/dev/null 2>&1
	then	echo raspitill already running
	else	cd /tmp/stream
		nohup raspistill -w $w -h $h -q 5 -o $TMPDIR/image.jpg -tl 100 -t 99999999 -n -th 0:0:0 >$TMP.raspistill.out &
	fi

	if 	\ps -ef | grep -v grep | grep mjpg_streamer >/dev/null 2>&1
	then	echo MJPG already running
	else	echo start MJPG streamer using $TMPDIR
		cd ~/app/mjpg-streamer/mjpg-streamer
		nohup nice -n 15 ./mjpg_streamer -i "input_file.so -f $TMPDIR -d 0" -o "output_http.so -w ./www" >$TMP.mjpg.out &
	fi
fi
