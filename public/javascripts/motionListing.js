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
    prevDt;

  function applyLi(func) {
    $(liElements).each(function (index) {
      var fName = $(this).text(),
        a = fName.split(/[\-\.]/);
      //console.log("working on " + a);
      if (a.length >= 3) {
        func(fName, a[0], a[1], a[a.length-1]);
      }
    });
  }
  // we can't assume the jpg and avi files are in order, so double loop
  // first get the video files
  applyLi(function (fName, n, d, e) { if (e === "avi") { flist[n] = {}; flist[n].avi = fName; } });
  // then show the static images corresponding to the video files
  //console.log("flist=" + JSON.stringify(flist));
  applyLi(function (fName, n, d, e) {
    if (e === "jpg") {
      if (! flist[n]) {
        console.log("no corresponding avi file for " + fName);
        return;
      }
      var t = d, dt;
      if (d.length === 14) {
        dt = d.substring(4,6) + "/" + d.substring(6,8) + "/" + d.substring(0,4);
        t = d.substring(8,10) + ":" + d.substring(10,12) + ":" + d.substring(12,14);
      }
      if (dt !== prevDt) {
        $(p).append("<h4>" + dt + "</h4>");
        prevDt = dt;
      }
      flist[n].jpg = fName;
      $(p).append("<a href='" + dir + "/" + flist[n].avi + "' " +
        "xfn='" + n + "'>" +
        "<img class='motionSnapshot' src='" + dir + "/" + fName + "'" +
        "Title='" + t + "' /></a>");
      $(p).append("<img class='closeSign' src='/images/closeSign.png'" + fName + "'/>");
    }
  });

  $(".motionSnapshot").hover(
    function() { $(this).toggleClass("selected"); },
    function() { $(this).toggleClass("selected"); }
  );

  $(".closeSign").hover(
    function() { $(this).attr("src", "/images/closeSignActive.png"); },
    function() { if (!$(this).prev().hasClass("deleted")) { $(this).attr("src", "/images/closeSign.png"); } }
  );
  $(".closeSign").on("click", function() {
    $(this).prev().toggleClass("deleted");
    $("#deleteButton").css("display", $(".deleted").length > 0 ? "inline" : "none");
  });

  $("#deleteButton").on("click", function() {
    var files = [];
    $(".deleted").each(function (index) {
      var n = $(this).attr("xfn");
      files.push(flist[n].jpg, flist[n].avi);
    });
    $.ajax({
      type: "POST",
      url: "/secure/api/deleteLog",
      data: { "files" : files },
      success: function () { console.log('deleteLog success'); location.reload() },
    });
  });
});