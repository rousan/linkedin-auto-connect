const axios = require('axios');

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
    if (partPair.length < 2) { continue; }
    cookieInfo[partPair[0].trim()] = partPair[1].trim();
  }
  return cookieInfo;
}

function stringifyCookies(cookiePairs) {
  return Object.keys(cookiePairs).map(cookieName => `${cookieName}=${cookiePairs[cookieName]}`).join('; ');
}

function fetchCookies(url, method, config) {
  const reqConfig = { url, method, ...config };

  return axios.request(reqConfig)
    .then(response => parseToCookieKeyValuePairs(response.headers['set-cookie']));
}

function trim(str, chr) {
  const regex = new RegExp(`(?:^${escapeRegExp(chr)}+)|(?:${escapeRegExp(chr)}+$)`, 'g');
  return str.replace(regex, '');
}

function escapeRegExp(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

function print(msg) {
  if (global.verbose) {
    process.stdout.write(msg);
  }
}

function* idMaker() {
  let index = 1;
  while (true) { yield index++; }
}

module.exports = {
  fetchCookies,
  parseToCookieKeyValuePairs,
  stringifyCookies,
  trim,
  print,
  idMaker,
};
