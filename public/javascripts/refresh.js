/*jslint browser: true, indent: 2 */
/*global  $, console, io, MM:true */

var MM = MM || {};

$(function () {
  "use strict";

  var socket = io.connect("/");

  function processItem(itemName, allStatus) {
    var item, el;
    item = allStatus[itemName];
    el = $("[id='" + itemName + "']");
    el.html(itemName);
    el.removeClass("up").removeClass("down").removeClass("warning");
    el.addClass(item.updown);
    if (item.hasDep) {
      el.addClass("hasDep");
      el.click(function (event) { window.location.href = "?pg=" + itemName; });
    } else {
      el.removeClass("hasDep");
    }
  }

  MM.lastMsgNum = 0;
  function renderItemState(data) {
    var itemName, msg, act, el,
      newStatus = data.update,
      allStatus = data.all;
    for (itemName in allStatus) {
      if (allStatus.hasOwnProperty(itemName)) {
        processItem(itemName, allStatus);
      }
    }
    $("#heartIcon").css("opacity", "1");
    MM.lastMsgNum += 1;
    $("#lastMsgNum").html(MM.lastMsgNum);
    MM.lastMsgTime = new Date();
    $("#lastMsgTime").html(MM.lastMsgTime);
    if (!newStatus) { newStatus = { "name" : "start" }; }
    msg = "[" + MM.lastMsgNum + "] " + MM.lastMsgTime + " : " + newStatus.name;
    if (newStatus.updown) { msg += ", " + newStatus.updown; }
    if (newStatus.comment) { msg += ", " + newStatus.comment; }
    act = $("#activityLog");
    // act.prepend(msg + "\n"); // for textarea
    // act.html(msg + "<br/>" + act.html()); // for div
    el = $("<div>" + msg + "<div/>")
       .addClass("logMsg")
       .addClass("logMsgFor" + newStatus.name); // for div
    if (newStatus.updown) { el.addClass(newStatus.updown); }
    act.prepend(el);
  }

  // initially populate the items
  $.getJSON("/api/status/get", function (data) { renderItemState({ "update": null, "all" : data }); });

  // get pushed updates from socket.io
  socket.on("update", function (data) { renderItemState(data); });
});
