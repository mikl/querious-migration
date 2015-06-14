#!/usr/bin/env node

var argv = require('yargs')
  .usage('Usage: $0 -c config.toml -m sql/migrations')
  .alias('c', 'config')
  .describe('c', 'Configuration file to load for database settings, etc.')
  .alias('m', 'migration-folder')
  .describe('m', 'Folder containing the migration files.')
  .demand(['c', 'm'])
  .argv;
