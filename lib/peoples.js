'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var axios = require('axios');
var utils = require('./utils');
var constants = require('./constants');

function fetch(sessionCookies, count) {
  return makeReqPYMKGET(sessionCookies, count).then(function (data) {
    return normalize(data);
  });
}

function makeReqPYMKGET(cookies, count) {
  var csrfToken = utils.trim(cookies.JSESSIONID, '"');

  var query = {
    count: count,
    includeInsights: false,
    start: 0,
    usageContext: 'd_flagship3_people'
  };

  var headers = _extends({}, constants.headers.peopleYouMayKnowGET, {
    cookie: utils.stringifyCookies(cookies),
    'csrf-token': csrfToken
  });

  var reqConfig = {
    headers: headers,
    params: query,
    responseType: 'json'
  };

  return axios.get(constants.urls.peopleYouMayKnow, reqConfig).then(function (response) {
    return response.data;
  });
}

function normalize(data) {
  return data.included.reduce(function (peoples, datum) {
    if (datum.$type === constants.peopleProfileType) {
      peoples.push({
        firstName: datum.firstName,
        lastName: datum.lastName,
        occupation: datum.occupation,
        profileId: extractProfileId(datum.entityUrn),
        publicIdentifier: datum.publicIdentifier,
        trackingId: datum.trackingId
      });
    }
    return peoples;
  }, []);
}

function extractProfileId(entityUrn) {
  return entityUrn.substr(entityUrn.lastIndexOf(':') + 1, entityUrn.length);
}

module.exports = {
  fetch: fetch
};