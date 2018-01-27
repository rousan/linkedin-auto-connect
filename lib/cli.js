#!/usr/bin/env node
'use strict';

var program = require('commander');
var prompt = require('prompt');
var pkg = require('../package.json');
var scraper = require('./scraper');

program.version(pkg.version, '-v, --version').usage('[options] [-u email] [-p password]').option('-u, --email <linkedin_handle>', 'provide your LinkedIn handle i.e. email or phone number').option('-p, --password <linkedin_password>', 'provide your LinkedIn password').option('--no-verbose', 'keep your console clean').parse(process.argv);

var email = program.email,
    password = program.password;


global.verbose = program.verbose;

var schema = {
  properties: {
    email: {
      description: 'Enter LinkedIn email',
      message: 'empty email',
      type: 'string',
      required: true,
      ask: function ask() {
        return !email;
      }
    },
    password: {
      description: 'Enter LinkedIn password',
      message: 'empty password',
      type: 'string',
      required: true,
      hidden: true,
      ask: function ask() {
        return !password;
      }
    }
  }
};

prompt.message = '';
prompt.start();

prompt.get(schema, function (err, result) {
  if (err) {
    console.error('canceled');
    process.exit(0);
    return;
  }

  email = result.email || email;
  password = result.password || password;
  scraper.start(email, password);
});