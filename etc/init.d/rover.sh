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

case "$1" in
start)
	echo "\nStarting rover..."
        /home/$USER/rover/bin/cron.sh >>/tmp/cron.$$.log 2>&1
	sudo -u $USER /home/$USER/rover/bin/start.sh >>/tmp/rover.$$.log 2>&1 &
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
