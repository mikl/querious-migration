// Migration runner, runs each migration in sequence.
'use strict';

let async = require('async');
let path = require('path');
let version_extractor = require('./version_extractor');

let extensionMatcher = /\.[a-z]*sql$/;
let extensionStripper = function (fileName) {
  return fileName.replace(extensionMatcher, '');
};

module.exports = function (options, callback) {
  async.eachSeries(options.migrations, function (fileName, callback) {
    let queryPath;

    if (options.migrationPath) {
      queryPath = path.join(options.migrationPath, extensionStripper(fileName));
    }
    else {
      queryPath = extensionStripper(fileName);
    }

    options.querious.query(queryPath, [], function (err, result) {
      if (!err) {
        let newVersion = version_extractor(fileName);
        console.info('Ran', fileName, 'for module', options.module, '- updated to version', newVersion, 'successfully.');

        if (options.migrationVersion === -1) {
          options.selfQuerious.query('migration_status/insert', [options.module, newVersion], callback);
        }
        else {
          options.selfQuerious.query('migration_status/update', [options.module, newVersion], callback);
        }
      }
      else {
        callback(err);
      }
    });
  }, callback);
};
