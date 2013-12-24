#!/bin/bash

. $(dirname $0)/../bin/i2cSetup.sh

while :
do      clear
        date
        i2cset -y $BUS $CHIP $MCP23017_OLATA 0x03 # turn on both LED
        #i2cdump -y $BUS $CHIP 
        #i2cdump -y -r $MCP23017_GPIOA-$MCP23017_GPIOB $BUS $CHIP b # show input values, using 'byte' data mode
        i2cget -y $BUS $CHIP $MCP23017_GPIOA w
        i2cset -y $BUS $CHIP $MCP23017_OLATA 0x00 # turn on both LED
        sleep 1
done
