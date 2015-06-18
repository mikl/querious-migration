// Command-line app for Querious Migration.
//
// Imported and launched by the bin file.
'use strict';

var async = require('async');
var config_loader = require('./config_loader');
var migration_finder = require('./migration_finder');

/**
 * Main CLI application.
 *
 * @param object argv
 *   Parsed command-line arguments.
 */
module.exports = function (argv) {
  async.auto({

    config: function (callback) {
      config_loader(argv.config, callback);
    },

    migrations: ['config', function (callback, results) {
      migration_finder(argv['migration-folder'], results.config, callback);
    }],

  }, function (err, results) {
    if (err) {
      throw err;
    }
  });
}
