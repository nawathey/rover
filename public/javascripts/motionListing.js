/*jslint browser: true, white: true*/
/*global  $, console */

(function () {
  "use strict";
  var dir = "/secure/log";
  $.ajaxSetup ({ cache: false });
  $("#files").load(dir + " #files", null, function () {
    // files is a UL with LI items under it
    var flist = {},
      flistOrder = [],
      p = $("#pics"),
      ulElement = this.childNodes[0],
      liElements = $(ulElement).children(),
      prevDt;

    // we can't assume the jpg and avi files are in order,
    // so first get the jpg and avi files
    $(liElements).each(function (index) {
      var fName = $(this).text(),
        a = fName.split(/[\-\.]/),
        n, d, e;
      //console.log("working on " + a);
      if (a.length >= 3) {
        n=a[0]; d=a[1]; e=a[a.length-1];
        if (e === "avi") { flist[n] = flist[n] || {}; flist[n].avi = fName; }
        else if (e === "jpg") {
          flist[n] = flist[n] || {};
          flist[n].jpg = fName;
          flist[n].dt = d;
          flistOrder.push(n);
        }
      }
    });
    console.log("flist=" + JSON.stringify(flist));
    // order the files
    flistOrder.sort(function (a,b) { return a-b; });
    // then show the static images corresponding to the video files
    for (var i = 0; i < flistOrder.length; i++) {
      var n = flistOrder[i],
        fName = flist[n].jpg,
        d = flist[n].dt;
      if (! flist[n].avi) {
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
      $(p).append("<a href='" + dir + "/" + flist[n].avi + "' " +
        "xfn='" + n + "'>" +
        "<img class='motionSnapshot' src='" + dir + "/" + fName + "'" +
        "Title='" + t + "' /></a>");
      $(p).append("<img class='closeSign' src='/images/closeSign.png'" + fName + "'/>");
    }

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
        success: function () { console.log('deleteLog success'); location.reload(); },
      });
    });
  });
}());
