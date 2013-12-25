/*jslint node: true, indent: 2*/
"use strict";

(function () {
  var
    fs = require("fs"),
    dataFiles = {
      stat : { name: "data/status.json", saveChanges: true },
      depTree : { name: "data/depTree.json" },
      layoutGrid : { name: "data/layoutGrid.json" }
    };

  function use() {
    var key;
    /*jslint stupid: true */ // suppress unexpected Sync method
    for (key in dataFiles) {
      if (dataFiles.hasOwnProperty(key)) {
        try {
          dataFiles[key].data = JSON.parse(fs.readFileSync(dataFiles[key].name));
        } catch (e) {
          console.log("  error - reading " + key + " data file " + dataFiles[key].name);
          dataFiles[key].data = {};
        }
      }
    }
    /*jslint stupid: false */

    if (!dataFiles.stat.data.msgSeqNo) { dataFiles.stat.data.msgSeqNo = 0; }
    if (!dataFiles.stat.data.objectVersion) { dataFiles.stat.data.objectVersion = 1; }
    dataFiles.stat.data.Unknown = { name: "Unknown", appid: "metamon", hasDep: false };
    dataFiles.depTree.data.Unknown = [];
    dataFiles.layoutGrid.data.Unknown = [[]];

    // rewrite the layout grid to know which item has dependencies
    (function () {
      var key, item;
      for (key in dataFiles.stat.data) {
        if (dataFiles.stat.data.hasOwnProperty(key)) {
          item = dataFiles.stat.data[key];
          item.hasDep = dataFiles.depTree.data[key] &&
                        dataFiles.depTree.data[key].length > 0 ? true : false;
        }
      }
    }());
    console.log("  info - initialized status: " + JSON.stringify(dataFiles.stat.data));
    console.log("  info - initialized dependent tree: " + JSON.stringify(dataFiles.depTree.data));
    console.log("  info - initialized layout grid: " + JSON.stringify(dataFiles.layoutGrid.data));
  }

  function doErr(err) { if (err) { throw err; } }

  function saveChanges() {
    var key;
    for (key in dataFiles) {
      if (dataFiles.hasOwnProperty(key)) {
        if (dataFiles.saveChanges && (dataFiles[key].lastWritten !== dataFiles[key].data.lastUpdate)) {
          dataFiles[key].lastWritten = dataFiles[key].data.lastUpdate;
          fs.writeFile(dataFiles[key].name, JSON.stringify(dataFiles[key].data), doErr);
          console.log("  info - written " + key + " to " + dataFiles[key].name);
        }
      }
    }
  }
  setInterval(saveChanges, 10000);

  /* returns the more severe of the 2 passed in severity */
  function severity(sev1, sev2) {
    return (sev2 &&
        ((sev1 === "up" && sev2 !== "up") ||
         (sev1 === "warning" && sev2 === "down"))) ? sev2 : sev1;
  }

  function updateAllStatus(newStatus) {
    var key, deps, sev, i, d, s, changedData = [];
    if (!newStatus.name || !newStatus.appid || !newStatus.updown) {
      console.log("  warn - updateAllStatus without name/appid/updown ignored: " + JSON.stringify(newStatus));
      return;
    }
    console.log("  info - updateAllStatus new status = " + JSON.stringify(newStatus));

    if (!dataFiles.stat.data[newStatus.name]) { // a new previously unknown item
      dataFiles.stat.data.Unknown.hasDep = true;
      dataFiles.depTree.data.Unknown.push(newStatus.name);
      dataFiles.depTree.data.lastUpdate = new Date();
      dataFiles.layoutGrid.data.Unknown[0].push(newStatus.name);
      dataFiles.layoutGrid.data.lastUpdate = new Date();
    }
    dataFiles.stat.data.msgSeqNo += 1;
    dataFiles.stat.data.lastUpdate = new Date();
    dataFiles.stat.data[newStatus.name] = newStatus;

    // look thru dependency tree to update parent
    for (key in dataFiles.depTree.data) {
      if (dataFiles.depTree.data.hasOwnProperty(key)) {
        deps = dataFiles.depTree.data[key];
        if (deps instanceof Array && (deps.indexOf(newStatus.name) >= 0)) {
          console.log("  debug - key " + key + " with dependents " + JSON.stringify(deps) +
                    " contains " + newStatus.name);
          sev = "up";
          for (i = 0; i < deps.length; i += 1) {
            d = deps[i];
            s = dataFiles.stat.data[d];
            if (s) { sev = severity(sev, dataFiles.stat.data[d].updown); }
          }
          if (dataFiles.stat.data[key]) {
            dataFiles.stat.data[key].updown = sev; /* set parent severity to the most severe of children */
            updateAllStatus(dataFiles.stat.data[key]); /* recurse in case necessary */
          }
        }
      }
    }
    //console.log("  info - updateAllStatus, status = " + JSON.stringify(dataFiles.stat.data));
    return dataFiles.stat.data;
  }

  function updateNewStatus(newStatus) {
    newStatus.name = newStatus.name.trim();
    newStatus.appid = newStatus.appid.trim();
    newStatus.updown = newStatus.updown.trim().toLowerCase();
    if (newStatus.comment) { newStatus.comment = newStatus.comment.trim(); }
    return updateAllStatus(newStatus);
  }

  function deleteItem(item) {
    var key, deps, i;
    if (!item.name || !item.appid) {
      console.log("  warn - deleteItem without name/appid ignored: " + JSON.stringify(item));
      return;
    }
    console.log("  info - deleted item " + item.name);
    delete dataFiles.stat.data[item.name];
    for (key in dataFiles.depTree.data) {
      if (dataFiles.depTree.data.hasOwnProperty(key)) {
        deps = dataFiles.depTree.data[key];
        if (deps instanceof Array) {
          i = deps.indexOf(item.name);
          if (i >= 0) {
            console.log("  info - deleted item " + item.name + " from dependent " + key);
            deps.splice(i, 1);
          }
        }
      }
    }
  }

  exports.use = use;
  exports.updateNewStatus = updateNewStatus;
  exports.deleteItem = deleteItem;
  exports.currentStatus = function () { return dataFiles.stat.data; };
  exports.layoutGrid = function (name) { return dataFiles.layoutGrid.data[name]; };
}());
