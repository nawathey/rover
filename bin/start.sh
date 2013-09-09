# sudo mount -t tmpfs -o size=10m tmpfs /tmp/stream

# view this with http://rpi:8080/?action=stream

export LD_LIBRARY_PATH=./ 

TMPDIR=/tmp/stream
mkdir -p $TMPDIR

if 	\ps -ef | grep -v grep | grep raspistill >/dev/null 2>&1
then	echo raspitill already running
else	nohup raspistill -w 640 -h 480 -q 5 -o $TMPDIR/image.jpg -tl 100 -t 99999999 -n &
fi

if	[[ "$1" = "exp" ]]
then	echo start experimental MJPG streamer without file system support
	cd ~/app/mjpg-streamer-raspi/mjpg-streamer-experimental
	nohup ./mjpg_streamer -i "input_raspicam.so -d 100" -o "output_http.so -w ./www" &
else	echo start MJPG streamer using $TMPDIR
	cd ~/app/mjpg-streamer/mjpg-streamer
	nohup ./mjpg_streamer -i "input_file.so -f $TMPDIR -n image.jpg" -o "output_http.so -w ./www" &
fi
