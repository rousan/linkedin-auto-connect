'use strict';

var colors = require('colors/safe');
var constants = require('./constants');
var login = require('./login');
var peoples = require('./peoples');
var inviter = require('./inviter');
var utils = require('./utils');

var credentials = void 0;

function start(email, password) {
  storeCredentials(email, password);
  startScraping();
}

function startScraping() {
  utils.print('\n  ' + colors.grey('Connecting to the LinkedIn server..'));
  login.sessionCookies(credentials.email, credentials.password).then(function (sessionCookies) {
    utils.print('\n  ' + colors.green('Connected.'));
    utils.print('\n  ');
    utils.startTimer();
    fetchNextPeoples(sessionCookies);
  }).catch(function (err) {
    onError(err);
  });
}

function fetchNextPeoples(sessionCookies) {
  peoples.fetch(sessionCookies, constants.fetchingPeoplesCount).then(function (peoples) {
    inviter.invite(sessionCookies, peoples).then(function () {
      setTimeout(function () {
        fetchNextPeoples(sessionCookies);
      }, constants.requestInterval);
    });
  }).catch(function (err) {
    onError(err);
  });
}

function storeCredentials(email, password) {
  credentials = { email: email, password: password };
}

function onError(err) {
  var errMsg = void 0;
  if (err.response) {
    var statusCode = err.response.status;
    if (statusCode === 401 || statusCode === 403) {
      errMsg = 'incorrect authentication';
    } else {
      errMsg = err.message;
    }
  } else if (err.request) {
    errMsg = 'couldn\'t connect to the LinkedIn server';
  } else {
    errMsg = err.message;
  }
  console.error('\n  ' + colors.red('error') + ':   ' + errMsg);
}

module.exports = { start: start };