const axios = require('axios');
const utils = require('./utils');
const constants = require('./constants');

function fetch(sessionCookies) {
  return makeReqPYMKGET(sessionCookies)
    .then(data => data);
}

function makeReqPYMKGET(cookies) {
  const csrfToken = utils.trim(cookies.JSESSIONID, '"');

  const query = {
    count: 10,
    includeInsights: true,
    start: 0,
    usageContext: 'd_flagship3_people',
  };

  const headers = {
    ...constants.headers.peopleYouMayKnowGET,
    cookie: utils.stringifyCookies(cookies),
    'csrf-token': csrfToken,
  };

  const reqConfig = {
    headers,
    params: query,
    responseType: 'json',
  };

  return axios.get(constants.urls.peopleYouMayKnow, reqConfig)
    .then(response => response.data);
}

module.exports = {
  fetch,
};
