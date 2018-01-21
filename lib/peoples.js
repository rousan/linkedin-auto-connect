const axios = require('axios');
const utils = require('./utils');
const constants = require('./constants');

function fetch(sessionCookies, count) {
  return makeReqPYMKGET(sessionCookies, count)
    .then(data => normalize(data));
}

function makeReqPYMKGET(cookies, count) {
  const csrfToken = utils.trim(cookies.JSESSIONID, '"');

  const query = {
    count,
    includeInsights: false,
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

function normalize(data) {
  return data.included.reduce((peoples, datum) => {
    if (datum.$type === constants.peopleProfileType) {
      peoples.push({
        firstName: datum.firstName,
        lastName: datum.lastName,
        occupation: datum.occupation,
        profileId: extractProfileId(datum.entityUrn),
        publicIdentifier: datum.publicIdentifier,
        trackingId: datum.trackingId,
      });
    }
    return peoples;
  }, []);
}

function extractProfileId(entityUrn) {
  return entityUrn.substr(entityUrn.lastIndexOf(':') + 1, entityUrn.length);
}

module.exports = {
  fetch,
};
