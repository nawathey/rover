export MCP23017_BUS=1 \
        MCP23017_CHIP=0x20 \
        MCP23017_IODIRA=0x00 \
        MCP23017_IPOLA=0x02 \
        MCP23017_GPINTENA=0x04 \
        MCP23017_DEFVALA=0x06 \
        MCP23017_INTCONA=0x08 \
        MCP23017_IOCONA=0x0A \
        MCP23017_GPPUA=0x0C \
        MCP23017_INTFA=0x0E \
        MCP23017_INTCAPA=0x10 \
        MCP23017_GPIOA=0x12 \
        MCP23017_OLATA=0x14 \
        MCP23017_IODIRB=0x01 \
        MCP23017_IPOLB=0x03 \
        MCP23017_GPINTENB=0x05 \
        MCP23017_DEFVALB=0x07 \
        MCP23017_INTCONB=0x09 \
        MCP23017_IOCONB=0x0B \
        MCP23017_GPPUB=0x0D \
        MCP23017_INTFB=0x0F \
        MCP23017_INTCAPB=0x11 \
        MCP23017_GPIOB=0x13 

i2cset -y $BUS $CHIP $MCP23017_IODIRA 0xFE # setup 6 input and 1 output
i2cset -y $BUS $CHIP $MCP23017_IODIRB 0xFF # setup 8 input
i2cset -y $BUS $CHIP $MCP23017_GPPUA 0xFE # enable weak pull-up resistors
i2cset -y $BUS $CHIP $MCP23017_GPPUB 0xFF # enable weak pull-up resistors
