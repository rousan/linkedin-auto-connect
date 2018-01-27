'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var querystring = require('querystring');
var constants = require('./constants');
var utils = require('./utils');

function sessionCookies(email, password) {
  return makeReqLoginGET().then(function (cookies) {
    return makeReqLoginPOST(email, password, cookies);
  });
}

function makeReqLoginGET() {
  var reqConfig = {
    headers: _extends({}, constants.headers.loginGET),
    responseType: 'text'
  };
  return utils.fetchCookies(constants.urls.login, 'get', reqConfig);
}

function makeReqLoginPOST(email, password, cookies) {
  var csrfParam = utils.trim(cookies.bcookie, '"').split('&')[1];

  var auth = querystring.stringify({
    'session_key': email,
    'session_password': password,
    'isJsEnabled': 'false',
    'loginCsrfParam': csrfParam
  });

  var headers = _extends({}, constants.headers.loginSubmitPOST, {
    cookie: utils.stringifyCookies(cookies)
  });

  var reqConfig = {
    headers: headers,
    maxRedirects: 0,
    validateStatus: validateStatusForURLRedirection,
    data: auth,
    responseType: 'text'
  };

  return utils.fetchCookies(constants.urls.loginSubmit, 'post', reqConfig).then(function (cookieUpdates) {
    return _extends({}, cookies, cookieUpdates);
  });
}

function validateStatusForURLRedirection(status) {
  return status >= 200 && (status < 300 || status === 302);
}

module.exports = {
  sessionCookies: sessionCookies
};