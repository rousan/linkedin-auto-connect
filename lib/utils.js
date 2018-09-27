'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var axios = require('axios');
var wordWrap = require('word-wrap');
var moment = require('moment');

function parseToCookieKeyValuePairs(cookieHeaders) {
  return cookieHeaders.reduce(function (keyValuePairs, cookie) {
    var cookieInfo = parseSingleCookie(cookie);
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
  var cookieInfo = {};
  var parts = cookieStr.split(/; */);

  var pair = parts[0].trim();
  var eqIdx = pair.indexOf('=');
  cookieInfo.key = pair.substr(0, eqIdx).trim();
  cookieInfo.value = pair.substr(eqIdx + 1, pair.length).trim();

  for (var i = 1; i < parts.length; ++i) {
    var partPair = parts[i].trim().split('=');
    if (partPair.length < 2) {
      continue;
    }
    cookieInfo[partPair[0].trim()] = partPair[1].trim();
  }
  return cookieInfo;
}

function stringifyCookies(cookiePairs) {
  return Object.keys(cookiePairs).map(function (cookieName) {
    return cookieName + '=' + cookiePairs[cookieName];
  }).join('; ');
}

function fetchCookies(url, method, config) {
  var reqConfig = _extends({ url: url, method: method }, config);

  return axios.request(reqConfig).then(function (response) {
    return parseToCookieKeyValuePairs(response.headers['set-cookie']);
  });
}

function trim(str, chr) {
  var regex = new RegExp('(?:^' + escapeRegExp(chr) + '+)|(?:' + escapeRegExp(chr) + '+$)', 'g');
  return str.replace(regex, '');
}

function escapeRegExp(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

var currentPrintStream = process.stderr;

function print(msg) {
  if (global.verbose) {
    currentPrintStream.write(msg);
  }
}

function resolveNewLines(text) {
  text = text || '';
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
  return moment().diff(global.startMoment, 'second', true) + 'sec';
}

module.exports = {
  fetchCookies: fetchCookies,
  parseToCookieKeyValuePairs: parseToCookieKeyValuePairs,
  stringifyCookies: stringifyCookies,
  trim: trim,
  print: print,
  resolveNewLines: resolveNewLines,
  wrapText: wrapText,
  currentPrintStream: currentPrintStream,
  startTimer: startTimer,
  endTimer: endTimer
};