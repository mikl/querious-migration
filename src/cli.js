// Command-line app for Querious Migration.
//
// Imported and launched by the bin file.
'use strict';

var Querious = require('querious');
var async = require('async');
var config_loader = require('./config_loader');
var migration_filter = require('./migration_filter');
var migration_finder = require('./migration_finder');
var migration_runner = require('./migration_runner');
var path = require('path');
var pg = require('pg');

/**
 * Main CLI application.
 *
 * @param object argv
 *   Parsed command-line arguments.
 */
module.exports = function (argv) {
  let selfMigrationPath = 'migrations';
  let selfSQLPath = path.resolve(__dirname, '..', 'sql');

  async.auto({

    config: function (callback) {
      config_loader(argv.config, callback);
    },

    db_client: ['config', function (callback, results) {
      let dbClient = new pg.Client(results.config.database);

      dbClient.connect(function (err) {

        dbClient.on('error', function (err) {
          console.error('Querious migration error', err);
        });

        return callback(err, dbClient);
      });
    }],

    self_querious: ['db_client', function (callback, results) {
      callback(null, new Querious({
        client: results.db_client,
        dialect: results.config.database.type,
        sql_folder: selfSQLPath,
      }));
    }],

    self_migrations: ['config', function (callback, results) {
      migration_finder(path.join(selfSQLPath, selfMigrationPath), results.config, callback);
    }],

    filter_self_migrations: ['self_querious', 'self_migrations', function (callback, results) {
      migration_filter({
        migrations: results.self_migrations,
        module: 'querious-migrations',
        querious: results.self_querious,
        selfMigration: true,
      }, callback);
    }],

    run_self_migrations: ['filter_self_migrations', function (callback, results) {
      migration_runner({
        migrationPath: selfMigrationPath,
        migrationVersion: results.filter_self_migrations.current_version,
        migrations: results.filter_self_migrations.filter_migrations,
        module: 'querious-migrations',
        querious: results.self_querious,
        selfQuerious: results.self_querious,
      }, callback);
    }],

    querious: ['db_client', function (callback, results) {
      callback(null, new Querious({
        client: results.db_client,
        dialect: results.config.database.type,
        sql_folder: argv['migration-path'],
      }));
    }],

    migrations: ['config', function (callback, results) {
      migration_finder(argv['migration-path'], results.config, callback);
    }],

    filter_migrations: ['querious', 'run_self_migrations', function (callback, results) {
      migration_filter({
        migrations: results.migrations,
        module: argv.module,
        // This one needs self_querious to find the status check query.
        querious: results.self_querious,
      }, callback);
    }],

    run_migrations: ['filter_migrations', function (callback, results) {
      migration_runner({
        migrationVersion: results.filter_migrations.current_version,
        migrations: results.filter_migrations.filter_migrations,
        module: argv.module,
        querious: results.querious,
        selfQuerious: results.self_querious,
      }, callback);
    }],

  }, function (err, results) {
    results.db_client.end();

    if (err) {
      throw err;
    }

    let migrationCount = results.filter_migrations.filter_migrations.length;
    let selfMigrationCount = results.filter_self_migrations.filter_migrations.length;

    console.info('Querious migration successfully ran', migrationCount, 'migrations,', selfMigrationCount, 'self-migrations.');
  });
};
