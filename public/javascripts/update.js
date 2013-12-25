/*jslint browser: true, indent: 2 */
/*global $, console */

$(function () {
  "use strict";

  $("#name").keyup(function () {
    var e = $("#submit");
    if (this.value.length > 0) { e.removeAttr("disabled"); } else { e.attr("disabled", true); }
  });

  // e.g. http://localhost:9001/api/status/update?name=Web3&appid=eon234&updown=up&comment=helloworld
  $("#submit").click(function () {
    var url = "/api/status/update";
    url += "?name=" + encodeURIComponent($("#name").val());
    url += "&appid=updateform";
    url += "&updown=" + encodeURIComponent($("#updown").val());
    url += "&comment=" + encodeURIComponent($("#comment").val());
    $.getJSON(url, function (data) { $("#result").html(JSON.stringify(data)); });
    return false;
  });
});
