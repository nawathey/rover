/*jslint browser: true, white: true*/
/*global  $ */
"use strict";

var dir = "/secure/log";
$.ajaxSetup ({ cache: false });
$("#files").load(dir + " #files", null, function () {
  // files is a UL with LI items under it
  var flist = {},
    p = $("#pics"),
    ulElement = this.childNodes[0],
    liElements = $(ulElement).children(),
    applyLi = function (func) {
      $(liElements).each(function (index) {
        var fName = $(this).text(),
          a = fName.split(/[-\.]/);
        //console.log("working on " + a);
        if (a.length >= 3) {
          func(fName, a[0], a[1], a[a.length-1]);
        }
      });
    };

  // we can't assume the jpg and avi files are in order, so double loop
  // first get the video files
  applyLi(function (fName, n, d, e) {
    if (e === "avi") {
      flist[n] = fName;
    }
  });
  // then show the static images corresponding to the video files
  //console.log('flist=' + flist);
  var prevDt;
  applyLi(function (fName, n, d, e) {
    if (e === "jpg") {
      var t = d, dt;
      if (d.length === 14) {
        dt = d.substring(4,6) + "/" + d.substring(6,8) + "/" + d.substring(0,4);
        t = d.substring(8,10) + ":" + d.substring(10,12) + ":" + d.substring(12,14);
      };
      if (dt !== prevDt) {
        $(p).append("<h4>" + dt + "</h4>");
        prevDt = dt;
      };
      $(p).append("<a href='" + dir + "/" + flist[n] + "'>" +
        "<img class='motionSnapshot' src='" + dir + "/" + fName + "' Title='" + t + "' /></a>");
    }
  });

  // add hover highlighting
  $('.motionSnapshot').hover(
    function() {
      $(this).css('border', "solid 2px blue");
    }, function() {
      $(this).css('border', "none");
    }
  );
});

/*
$(document).ready(function () {
  $('.closeSign').on('click', function() {
    $(this).parent().hide();
    // or any other stuff as you want
  });
});
*/
