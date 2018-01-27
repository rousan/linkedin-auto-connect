#!/usr/bin/env node

const program = require('commander');
const prompt = require('prompt');
const pkg = require('../package.json');
const scraper = require('./scraper');

program
  .version(pkg.version, '-v, --version')
  .usage('[options] [-u email] [-p password]')
  .option('-u, --email <linkedin_handle>', 'provide your LinkedIn handle i.e. email or phone number')
  .option('-p, --password <linkedin_password>', 'provide your LinkedIn password')
  .option('--no-verbose', 'keep your console clean')
  .parse(process.argv);

let { email, password } = program;

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
  scraper.start(email, password);
});
