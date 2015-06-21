// Migration filter, filters out migrations that have already run.
'use strict';

var async = require('async');
let version_extractor = require('./version_extractor');

module.exports = function (options, callback) {
  async.auto({

    current_version: function (callback) {
      options.querious.query('migration_status/get_by_module', [options.module], function (err, results) {

        // For the first round of self-migration, the versions table
        // will not exist. So we set the version to -1 and let the
        // migration process contiune.
        if (err && options.selfMigration && err.message === 'relation "querious_migration_versions" does not exist') {
          return callback(null, -1);
        }
        else if (err) {
          callback(err);
        }
        // If this module hasn't run migrations before, no version row
        // will be found. In this case, we also set version to -1 and
        // continue, so all migrations will be run.
        else if (results && results.rowCount === 0) {
          return callback(null, -1);
        }
        else if (results.rows && results.rows[0]) {
          return callback(null, results.rows[0].version);
        }
        else {
          // This should never happen. Please file a bug if it does.
          callback('Unknown error when resolving current_version');
        }
      });
    },

    filter_migrations: ['current_version', function (callback, results) {
      let filteredMigrations = options.migrations.filter(function (fileName) {
        let versionNumber = version_extractor(fileName);

        return versionNumber > results.current_version;
      });

      callback(null, filteredMigrations);
    }],

  }, function (err, results) {
    callback(err, results);
  });
};
