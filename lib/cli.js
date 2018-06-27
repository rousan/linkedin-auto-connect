#!/usr/bin/env node
'use strict';

const program = require('commander');
const prompt = require('prompt');
const pkg = require('../package.json');
const scraper = require('./scraper');

program
 .version(pkg.version, '-v, --version')
 .usage('[options] [-u email] [-p password] [-k skeyword]')
 .option('-u, --email <linkedin_handle>', 'provide your LinkedIn handle i.e. email or phone number')
 .option('-p, --password <linkedin_password>', 'provide your LinkedIn password')
 .option('-k, --skeyword <linkedin_handle>', 'provide keyword')
 .option('--no-verbose', 'keep your console clean')
 .parse(process.argv);

let {email, password, skeyword} = program;

global.verbose = program.verbose;

const schema = {
  properties: {
    email: {
      description: 'Enter LinkedIn email',
      message: 'empty email',
      type: 'string',
      required: true,
      ask() {
        return !email;
      },
    },
    password: {
      description: 'Enter LinkedIn password',
      message: 'empty password',
      type: 'string',
      required: true,
      hidden: true,
      ask() {
        return !password;
      },
    },
    skeyword: {
      description: 'Enter search keyword',
      message: 'empty keyword',
      type: 'string',
      required: true,
      ask() {
        return !skeyword;
      },
    },
  },
};

prompt.message = '';
prompt.start();

prompt.get(schema, (err, result) => {
  if (err) {
    console.error('canceled');
    process.exit(0);
    return;
  }

  email = result.email || email;
  password = result.password || password;
  skeyword = result.skeyword || skeyword;

  scraper.start(email, password, skeyword);
});
