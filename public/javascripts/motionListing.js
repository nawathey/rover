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
  applyLi(function (fName, n, d, e) {
    if (e === "avi") {
      flist[n] = fName;
    }
  });

  console.log('flist=' + flist);
  applyLi(function (fName, n, d, e) {
    if (e === "jpg") {
      $(p).append("<a href='" + dir + "/" + flist[n] + "'>" +
        "<img class='motionSnapshot' " +
        "src='" + dir + "/" + fName + "' alt='" + d + "' /></a>");
    }
  });
});
