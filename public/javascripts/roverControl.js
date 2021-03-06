/*jslint browser: true, indent: 2, vars: true*/
/*global  $, io*/

$(function () {
  "use strict";
  var KeyEvent = { DOM_VK_CANCEL: 3, DOM_VK_HELP: 6, DOM_VK_BACK_SPACE: 8, DOM_VK_TAB: 9, DOM_VK_CLEAR: 12, DOM_VK_RETURN: 13, DOM_VK_ENTER: 14, DOM_VK_SHIFT: 16, DOM_VK_CONTROL: 17, DOM_VK_ALT: 18, DOM_VK_PAUSE: 19, DOM_VK_CAPS_LOCK: 20, DOM_VK_ESCAPE: 27, DOM_VK_SPACE: 32, DOM_VK_PAGE_UP: 33, DOM_VK_PAGE_DOWN: 34, DOM_VK_END: 35, DOM_VK_HOME: 36, DOM_VK_LEFT: 37, DOM_VK_UP: 38, DOM_VK_RIGHT: 39, DOM_VK_DOWN: 40, DOM_VK_PRINTSCREEN: 44, DOM_VK_INSERT: 45, DOM_VK_DELETE: 46, DOM_VK_0: 48, DOM_VK_1: 49, DOM_VK_2: 50, DOM_VK_3: 51, DOM_VK_4: 52, DOM_VK_5: 53, DOM_VK_6: 54, DOM_VK_7: 55, DOM_VK_8: 56, DOM_VK_9: 57, DOM_VK_SEMICOLON: 59, DOM_VK_EQUALS: 61, DOM_VK_A: 65, DOM_VK_B: 66, DOM_VK_C: 67, DOM_VK_D: 68, DOM_VK_E: 69, DOM_VK_F: 70, DOM_VK_G: 71, DOM_VK_H: 72, DOM_VK_I: 73, DOM_VK_J: 74, DOM_VK_K: 75, DOM_VK_L: 76, DOM_VK_M: 77, DOM_VK_N: 78, DOM_VK_O: 79, DOM_VK_P: 80, DOM_VK_Q: 81, DOM_VK_R: 82, DOM_VK_S: 83, DOM_VK_T: 84, DOM_VK_U: 85, DOM_VK_V: 86, DOM_VK_W: 87, DOM_VK_X: 88, DOM_VK_Y: 89, DOM_VK_Z: 90, DOM_VK_CONTEXT_MENU: 93, DOM_VK_NUMPAD0: 96, DOM_VK_NUMPAD1: 97, DOM_VK_NUMPAD2: 98, DOM_VK_NUMPAD3: 99, DOM_VK_NUMPAD4: 100, DOM_VK_NUMPAD5: 101, DOM_VK_NUMPAD6: 102, DOM_VK_NUMPAD7: 103, DOM_VK_NUMPAD8: 104, DOM_VK_NUMPAD9: 105, DOM_VK_MULTIPLY: 106, DOM_VK_ADD: 107, DOM_VK_SEPARATOR: 108, DOM_VK_SUBTRACT: 109, DOM_VK_DECIMAL: 110, DOM_VK_DIVIDE: 111, DOM_VK_F1: 112, DOM_VK_F2: 113, DOM_VK_F3: 114, DOM_VK_F4: 115, DOM_VK_F5: 116, DOM_VK_F6: 117, DOM_VK_F7: 118, DOM_VK_F8: 119, DOM_VK_F9: 120, DOM_VK_F10: 121, DOM_VK_F11: 122, DOM_VK_F12: 123, DOM_VK_F13: 124, DOM_VK_F14: 125, DOM_VK_F15: 126, DOM_VK_F16: 127, DOM_VK_F17: 128, DOM_VK_F18: 129, DOM_VK_F19: 130, DOM_VK_F20: 131, DOM_VK_F21: 132, DOM_VK_F22: 133, DOM_VK_F23: 134, DOM_VK_F24: 135, DOM_VK_NUM_LOCK: 144, DOM_VK_SCROLL_LOCK: 145, DOM_VK_COMMA: 188, DOM_VK_PERIOD: 190, DOM_VK_SLASH: 191, DOM_VK_BACK_QUOTE: 192, DOM_VK_OPEN_BRACKET: 219, DOM_VK_BACK_SLASH: 220, DOM_VK_CLOSE_BRACKET: 221, DOM_VK_QUOTE: 222, DOM_VK_META: 224
      },
    socket = io.connect(),
    isDown = [],
    lastMotionTime,
    i;

  for (i = 0; i < 255; i += 1) { isDown[i] = false; }

  socket.on('status', function (data) {
    //console.log('received status ' + JSON.stringify(data));
    $('#volts').text(data.battery);
  });

  function kDown(k, lbl) {
    if (isDown[k]) { return; }
    isDown[k] = true;
    socket.emit('keydown', lbl);
    $('.' + lbl).addClass('active');
  }

  function kUp(k, lbl) {
    if (!isDown[k]) { return; }
    isDown[k] = false;
    socket.emit('keyup', lbl);
    $('.' + lbl).removeClass('active');
  }

  function getLabel(k) {
    var lbl;
    switch (k) {
    case KeyEvent.DOM_VK_F:
      lbl = 'up';
      break;
    case KeyEvent.DOM_VK_B:
      lbl = 'down';
      break;
    case KeyEvent.DOM_VK_L:
      lbl = 'left';
      break;
    case KeyEvent.DOM_VK_R:
      lbl = 'right';
      break;
    case KeyEvent.DOM_VK_PERIOD:
      lbl = 'panMid';
      break;
    case KeyEvent.DOM_VK_LEFT:
      lbl = 'panLeft';
      break;
    case KeyEvent.DOM_VK_RIGHT:
      lbl = 'panRight';
      break;
    case KeyEvent.DOM_VK_UP:
      lbl = 'tiltUp';
      break;
    case KeyEvent.DOM_VK_DOWN:
      lbl = 'tiltDown';
      break;
    }
    return lbl;
  }

  function isControlOn() { return $('#controlPanel').css('display') !== 'none'; }
  function isDebugOn() { return $('#debugMsg').css('display') !== 'none'; }

  function keyPressed(k) {
    var lbl = getLabel(k);
    if (lbl !== undefined) { kDown(k, lbl); }
  }
  $(document).keydown(function (e) { if (isControlOn()) { keyPressed(e.which); } });

  function keyReleased(k) {
    var lbl = getLabel(k);
    if (lbl !== undefined) { kUp(k, lbl); }
  }
  $(document).keyup(function (e) { if (isControlOn()) { keyReleased(e.which); } });

  function simulateClick(k) { keyPressed(k); setTimeout(function () { keyReleased(k); }, 200); }

  function onDeviceMotion(event) {
    var accel = event.accelerationIncludingGravity,
      m,
      t;
    if (isDebugOn()) { $('#debugMsg').text("x: " + accel.x + ", y: " + accel.y + ", z: " + accel.z); }
    // landscape: x = -8, y = 0, z = -5
    // portrait: x = 0, y = -8, z = -5
    if (accel.z < -6) {
      m = KeyEvent.DOM_VK_F;
    } else if (accel.z > 2) {
      m = KeyEvent.DOM_VK_B;
    } else if (accel.x < -7) { // landscape orientation
      if (accel.y > 3) { m = KeyEvent.DOM_VK_L; } else if (accel.y < -3) { m = KeyEvent.DOM_VK_R; }
    } else if (accel.x > 7) {
      if (accel.y > 3) { m = KeyEvent.DOM_VK_R; } else if (accel.y < -3) { m = KeyEvent.DOM_VK_L; }
    } else if (accel.y < -7) { // portrait orientation
      if (accel.x > 3) { m = KeyEvent.DOM_VK_R; } else if (accel.x < -3) { m = KeyEvent.DOM_VK_L; }
    } else if (accel.y > 7) {
      if (accel.x > 3) { m = KeyEvent.DOM_VK_L; } else if (accel.x < -3) { m = KeyEvent.DOM_VK_R; }
    }
    if (m !== undefined) {
      t = new Date().getTime();
      if (lastMotionTime === undefined || (t - lastMotionTime) > 100) { // prevent firing too often
        lastMotionTime = t;
        simulateClick(m);
      }
    }
  }

  // this is obviously not secure, but gives better performance
  var auth = $('#stream').attr('xuid') + ":" + $('#stream').attr('xpwd');
  $('#stream').attr('src', window.location.protocol + "//" +
    auth + "@" + window.location.hostname + $('#stream').attr('xsrc'));
  // this is very secure using node as proxy, but performance is not great
  // $('#stream').attr('src', 'still/stream');

  // once document is ready, hook up all callbacks
  $('.up').click(function () { simulateClick(KeyEvent.DOM_VK_F); });
  $('.down').click(function () { simulateClick(KeyEvent.DOM_VK_B); });
  $('.left').click(function () { simulateClick(KeyEvent.DOM_VK_L); });
  $('.right').click(function () { simulateClick(KeyEvent.DOM_VK_R); });
  $('.panLeft').click(function () { simulateClick(KeyEvent.DOM_VK_LEFT); });
  $('.panRight').click(function () { simulateClick(KeyEvent.DOM_VK_RIGHT); });

  $('#batteryIcon').click(function () { $('#debugMsg').fadeToggle(); });
  $('#onoffSwitch').click(function () {
    // the tested condition in the next 2 lines may seem flipped but ...
    // it's because the state of isControlOn will be toggled immediately afterwards
    $('#onoffSwitch').attr('src', isControlOn() ? '/images/onoffWhite.png' : '/images/onoffGreen.png');
    if (isControlOn()) {
      window.removeEventListener("devicemotion", onDeviceMotion, false);
    } else {
      window.addEventListener("devicemotion", onDeviceMotion, false);
    }
    $('#controlPanel').fadeToggle();
  });
});
