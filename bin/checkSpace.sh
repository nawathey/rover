#!/bin/bash

DIR=~samlu/log

while :
do     freeSpace=$(df / | awk '/dev/ { print $4; }')
       (( freeSpace > 5000 ))  && break 
       f=$DIR/$(ls -t $DIR | head -1)
       echo $(date) deleted $f >> $DIR/delete.log
       rm -f "$f"
done
