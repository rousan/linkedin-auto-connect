#!/usr/bin/env node

const program = require('commander');
const prompt = require('prompt');
const pkg = require('../package.json');

program
  .version(pkg.version, '-v, --version')
  .usage('[-u email] [-p password]')
  .option('-u, --email <linkedin_handle>', 'provide your LinkedIn handle i.e. email or phone number')
  .option('-p, --password <linkedin_password>', 'provide your LinkedIn password')
  .parse(process.argv);

let { email, password } = program;

const schema = {
  properties: {
    email: {
      description: 'Your LinkedIn email or phone number',
      message: 'Invalid email',
      type: 'string',
      required: true,
      ask() {
        return !email;
      },
    },
    password: {
      description: 'Your LinkedIn password',
      message: 'Invalid password',
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

  console.log(email, password);
});
