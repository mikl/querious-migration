// Migration finder.
//
// Scans folders to find migrations.
'use strict';

var Glob = require("glob").Glob

module.exports = function (migrationFolder, config, callback) {
  var globber = new Glob('[0123456789]*/up.?(my|pg)sql', {
    cwd: migrationFolder,
    nonull: false,
  }, callback);
};
