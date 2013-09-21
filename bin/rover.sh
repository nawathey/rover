#!/bin/sh
### BEGIN INIT INFO
# Provides:          rover
# Required-Start:    $remote_fs
# Required-Stop:     $remote_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start rover server
### END INIT INFO

USER=samlu
SERVER_JSDIR=/home/$USER/rover
SERVER_START=$SERVER_JSDIR/bin/start.sh
OUT=/tmp/$$.rover.log

case "$1" in

start)
	echo "starting rover: $SERVER_START"
	sudo -u $USER $SERVER_START >$OUT 2>&1 &
	;;

stop)
	killall node
	killall raspistill
	killall mjpg_streamer
	;;

*)
	echo "usage: $0 (start|stop)"
esac

exit 0
