#!/usr/bin/env node
'use strict';

var argv = require('yargs')
  .usage('Usage: $0 -c config.toml -m sql/migrations')
  .alias('c', 'config')
  .describe('c', 'Configuration file to load for database settings, etc.')
  .alias('m', 'module')
  .describe('m', 'Module name to register the migrations under.')
  .alias('p', 'migration-path')
  .describe('p', 'Path to the migration files.')
  .demand(['c', 'm'])
  .argv;

var cli = require('../src/cli');

cli(argv);
