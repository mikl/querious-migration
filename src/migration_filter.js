// Migration filter, filters out migrations that have already run.
'use strict';

var async = require('async');
var pg = require('pg');
var Querious = require('querious');

var versionMatcher = /^0*(\d+)/;

/**
 * Extract version number from file name.
 *
 * @param fileName Filename to extract version from.
 *
 * @return Number|Boolean Matched number, or boolean false if not found.
 */
var versionExtractor = function (fileName) {
  var matches = fileName.match(versionMatcher);

  if (matches) {
    return parseInt(matches[1], 10);
  }

  return false;
};

module.exports = function (options, callback) {
  var dbClient = new pg.Client(options.config.database);

  var querious = new Querious({
    client: dbClient,
    dialect: options.config.database.type,
    sql_folder: options.migrationFolder
  });

  async.auto({

    db_connection: function (callback) {
      dbClient.connect(function (err) {

        dbClient.on('error', function (err) {
          console.error('Querious error', err);
        });
        
        callback(err);
      });
    },

    current_version: ['db_connection', function (callback) {
      querious.query('migration_status/get_by_module', [options.module], function (err, result) {

        // For the first round of self-migration, the versions table
        // will not exist. So we set the version to -1 and let the
        // migration process contiune.
        if (err && options.selfMigration && err.message === 'relation "querious_migration_versions" does not exist') {
          return callback(null, -1);
        }

        // TODO: Handle database result.

        callback(err);
      });
    }],

    filter_migrations: ['current_version', function (callback, results) {
      let filteredMigrations = options.migrations.filter(function (fileName) {
        let versionNumber = versionExtractor(fileName);

        return versionNumber > results.current_version;
      });
      
      callback(null, filteredMigrations);
    }],

  }, function (err, results) {
    callback(err, results.filter_migrations);
  });
}
