// Config file loader.
'use strict';

var async = require('async');
var fs = require('fs');
var path = require('path');
var toml = require('toml');

module.exports = function (configFilePath, callback) {
  async.auto({

    // Resolve the given path, and check it points to a file.
    resolvedPath: function (callback) {
      var resolvedPath = path.resolve(configFilePath);

      fs.stat(resolvedPath, function (err, stats) {
        if (err) {
          callback(err);
        }
        else if (stats.isFile()) {
          callback(null, resolvedPath);
        }
        else {
          callback(resolvedPath + ' is not a file.');
        }
      });
    },

    fileContents: ['resolvedPath', function (callback, results) {
      fs.readFile(results.resolvedPath, { encoding: 'utf-8' }, callback);
    }],

    config: ['fileContents', function (callback, results) {
      try {
        var config = toml.parse(results.fileContents);
      }
      catch (e) {
        callback("Error parsing '" + results.resolvedPath + "', line " + e.line + ", column " + e.column + ": " + e.message);
      }

      callback(null, config);
    }],

  }, function (err, results) {
    callback(err, results.config.querious);
  });
}
