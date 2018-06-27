'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const axios = require('axios');
const wordWrap = require('word-wrap');
const moment = require('moment');

function parseToCookieKeyValuePairs(cookieHeaders) {
  return cookieHeaders.reduce((keyValuePairs, cookie) => {
    const cookieInfo = parseSingleCookie(cookie);
    if (!isDeletedCookie(cookieInfo)) {
      keyValuePairs[cookieInfo.key] = cookieInfo.value;
    }
    return keyValuePairs;
  }, {});
}

function isDeletedCookie(cookieInfo) {
  return cookieInfo.value.indexOf('delete') !== -1;
}

function parseSingleCookie(cookieStr) {
  const cookieInfo = {};
  const parts = cookieStr.split(/; */);

  const pair = parts[0].trim();
  const eqIdx = pair.indexOf('=');
  cookieInfo.key = pair.substr(0, eqIdx).trim();
  cookieInfo.value = pair.substr(eqIdx + 1, pair.length).trim();

  for (let i = 1; i < parts.length; ++i) {
    const partPair = parts[i].trim().split('=');
    if (partPair.length < 2) {
      continue;
    }
    cookieInfo[partPair[0].trim()] = partPair[1].trim();
  }
  return cookieInfo;
}

function stringifyCookies(cookiePairs) {
  return Object.keys(cookiePairs).map(cookieName => `${cookieName}=${cookiePairs[cookieName]}`).join('; ');
}

function fetchCookies(url, method, config) {
  var reqConfig = _extends({ url: url, method: method }, config);

  return axios.request(reqConfig).then(function (response) {
    return parseToCookieKeyValuePairs(response.headers['set-cookie']);
  });
}

function trim(str, chr) {
  const regex = new RegExp(`(?:^${escapeRegExp(chr)}+)|(?:${escapeRegExp(chr)}+$)`, 'g');
  return str.replace(regex, '');
}

function escapeRegExp(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

const currentPrintStream = process.stderr;

function print(msg) {
  if (global.verbose) {
    currentPrintStream.write(msg);
  }
}

function resolveNewLines(text) {
  return text.replace(/[\n\r]+/g, ' ').trim();
}

function wrapText(text, option) {
  option = _extends({
    trim: false
  }, option);

  return wordWrap(text, option);
}

function startTimer() {
  global.startMoment = moment();
}

function endTimer() {
  return `${moment().diff(global.startMoment, 'second', true)}sec`;
}

function makeReqPYMKGET(cookies, {url, query = null}, header, responseType = 'json') {
  const csrfToken = trim(cookies.JSESSIONID, '"');

  const headers = _extends({}, header, {
    cookie: stringifyCookies(cookies),
    'csrf-token': csrfToken
  });

  const reqConfig = {
    headers,
    responseType: responseType,
  };
  if (query) reqConfig.params = query;
  return axios.get(url, reqConfig)
   .then(response => response.data)
}

module.exports = {
  fetchCookies,
  parseToCookieKeyValuePairs,
  stringifyCookies,
  trim,
  print,
  resolveNewLines,
  wrapText,
  currentPrintStream,
  makeReqPYMKGET,
  startTimer,
  endTimer,
};
