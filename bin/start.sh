# start the rover server side
#
# setup RAMTMP and TMPFS_SIZE by:
# sudo vi /etc/default/tmpfs
#

[[ "$1" ]] && w="$1" || w=480
[[ "$2" ]] && h="$2" || h=320

# enable LED output port
gpio export 17 out

# run node
if 	\ps -ef | grep -v grep | grep node >/dev/null 2>&1
then	echo node already running
else	cd ~/rover
	nohup /opt/node/bin/node rover.js &
fi

# view this with http://rpi:8080/?action=stream
export LD_LIBRARY_PATH=./ 

if	[[ "$1" = "exp" ]] 	# experimental, does not work
then	echo start experimental MJPG streamer without file system support
	cd ~/app/mjpg-streamer-raspi/mjpg-streamer-experimental
	nohup ./mjpg_streamer -i "input_raspicam.so -d 100" -o "output_http.so -w ./www" &

else	TMPDIR=/tmp/stream
	mkdir -p $TMPDIR 
	if 	\ps -ef | grep -v grep | grep raspistill >/dev/null 2>&1
	then	echo raspitill already running
	else	nohup raspistill -w $w -h $h -q 5 -o $TMPDIR/image.jpg -tl 100 -t 99999999 -n -th 0:0:0 &
	fi

	if 	\ps -ef | grep -v grep | grep mjpg_streamer >/dev/null 2>&1
	then	echo MJPG already running
	else	echo start MJPG streamer using $TMPDIR
		cd ~/app/mjpg-streamer/mjpg-streamer
		nohup ./mjpg_streamer -i "input_file.so -f $TMPDIR -n image.jpg" -o "output_http.so -w ./www" &
	fi
fi
