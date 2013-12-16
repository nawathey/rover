/*jslint browser: true, indent: 2*/
/*global  $, console, alert */

(function () {
  "use strict";
  var dir = "/secure/log", i;

  $.ajaxSetup({ cache: false });
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
        n,
        d,
        e;
      //console.log("working on " + a);
      if (a.length >= 3) {
        n = a[0];
        d = a[1];
        e = a[a.length - 1];
        if (e === "avi") {
          flist[n] = flist[n] || {};
          flist[n].avi = fName;
        } else if (e === "jpg") {
          flist[n] = flist[n] || {};
          flist[n].jpg = fName;
          flist[n].dt = d;
          flistOrder.push(n);
        }
      }
    });

    // sort the files in reverse chronological order
    flistOrder.sort(function (a, b) { return b - a; });

    // add the key frame with link to video
    function addClip(n) {
      var d, t, dt, v;
      if (flist[n].jpg && flist[n].avi) {
        d = flist[n].dt;
        if (d.length === 14) {
          dt = d.substring(4, 6) + "/" + d.substring(6, 8) + "/" + d.substring(0, 4);
          t = d.substring(8, 10) + ":" + d.substring(10, 12) + ":" + d.substring(12, 14);
        } else {
          t = d; // just in case file name is not properly formatted
        }
        if (dt !== prevDt) {
          $(p).append("<div>" + // inline block prevents X from wrapping to next line
            "<h4 style='display:inline-block'>" + dt + "</h4>" +
            "<img class='deleteDate' src='/images/closeSign.png'/>" +
            "</div>");
          prevDt = dt;
        }
        $(p).append("<span style='display:inline-block'>" + // inline block prevents X from wrapping to next line
            "<img class='motionSnapshot' src='" + dir + "/" + flist[n].jpg + "'" +
            " dt='" + dt + "'" +
            " title='" + t + "'" +
            " xfn='" + n + "'/>" +
            "<img class='closeSign' src='/images/closeSign.png'/>" +
            "</span>");
      }
    }

    // then show the static images corresponding to the video files
    for (i = 0; i < flistOrder.length; i += 1) {
      addClip(flistOrder[i]);
    }

    $(".motionSnapshot").hover(
      function () { $(this).toggleClass("selected"); },
      function () { $(this).toggleClass("selected"); }
    );
    $(".motionSnapshot").on("click", function () {
      if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
        alert("Chrome browser cannot play motion captured videos in mpeg4 format. Use Safari or IE instead.");
        return false;
      }
      var n = $(this).attr("xfn");
      window.open(dir + "/" + flist[n].avi, "_blank", "fullscreen=yes");
    });
  /*
    $(".closeSign, .deleteDate").hover(
      function () { $(this).attr("src", "/images/closeSignActive.png"); },
      function () {
        if (!$(this).prev().hasClass("deleted")) {
          $(this).attr("src", "/images/closeSign.png");
        }
      }
    );
  */
    $(".closeSign").on("click", function () {
      $(this).prev().toggleClass("deleted");
      $("#deleteButton").css("display", $(".deleted").length > 0 ? "inline" : "none");
    });
    $(".deleteDate").on("click", function () {
      var dt = $(this).prev().html();
      $(this).prev().toggleClass("deleted");
      $(".motionSnapshot").each(function (index) {
        if (dt === $(this).attr("dt")) {
          $(this).toggleClass("deleted");
        }
      });
      $("#deleteButton").css("display", $(".deleted").length > 0 ? "inline" : "none");
    });

    $("#deleteButton").on("click", function () {
      var files = [];
      $(".motionSnapshot.deleted").each(function (index) {
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
