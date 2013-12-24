#!/bin/bash

. $(dirname $0)/../bin/i2cSetup.sh

while :
do      clear
        date
        i2cset -y $MCP23017_BUS $MCP23017_CHIP $MCP23017_OLATA 0x03 # turn on both LED
        #i2cdump -y $MCP23017_BUS $MCP23017_CHIP 
        #i2cdump -y -r $MCP23017_GPIOA-$MCP23017_GPIOB $MCP23017_BUS $MCP23017_CHIP b # show input using 'byte' data mode
        i2cget -y $MCP23017_BUS $MCP23017_CHIP $MCP23017_GPIOA b
        i2cget -y $MCP23017_BUS $MCP23017_CHIP $MCP23017_GPIOB b
        i2cset -y $MCP23017_BUS $MCP23017_CHIP $MCP23017_OLATA 0x00 # turn on both LED
        sleep 1
done
