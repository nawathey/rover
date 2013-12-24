!/opt/node/bin/node
/*jslint node: true, indent: 2*/
"use strict";

// test of i2c package: https://npmjs.org/package/i2c
var I2c = require('i2c'),
  address = 0x20, // first MCP23017 chip
  wire = new I2c(address, {device: '/dev/i2c-1', debug : false}),
  val = 0;

var
  MCP23017_IODIRA = 0x00,
  MCP23017_IPOLA = 0x02,
  MCP23017_GPINTENA = 0x04,
  MCP23017_DEFVALA = 0x06,
  MCP23017_INTCONA = 0x08,
  MCP23017_IOCONA = 0x0A,
  MCP23017_GPPUA = 0x0C,
  MCP23017_INTFA = 0x0E,
  MCP23017_INTCAPA = 0x10,
  MCP23017_GPIOA = 0x12,
  MCP23017_OLATA = 0x14,
  MCP23017_IODIRB = 0x01,
  MCP23017_IPOLB = 0x03,
  MCP23017_GPINTENB = 0x05,
  MCP23017_DEFVALB = 0x07,
  MCP23017_INTCONB = 0x09,
  MCP23017_IOCONB = 0x0B,
  MCP23017_GPPUB = 0x0D,
  MCP23017_INTFB = 0x0F,
  MCP23017_INTCAPB = 0x11,
  MCP23017_GPIOB = 0x13,
  MCP23017_OLATB = 0x15;

function blink() {
  wire.writeBytes(MCP23017_OLATA, [val], function (err) {
    if (err !== null) {
      console.log('error on write ' + err);
    } else {
      val += 1;
      if (val > 3) { val = 0; }
      setTimeout(blink, 500);
    }
  });
}

// setup 6 input and 2 output
wire.writeBytes(MCP23017_IODIRA, [0xFC], function (err) {
  if (err !== undefined && err !== null) {
    console.log('error on setup ' + err);
  } else {
    blink();
  }
});
