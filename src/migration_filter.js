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

        // TODO: Handle database result.

        callback(err);
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
    callback(err, results.filter_migrations);
  });
};
