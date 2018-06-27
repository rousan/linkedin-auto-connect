'use strict';

const colors = require('colors/safe');
const constants = require('./constants');
const login = require('./login');
const peoples = require('./peoples');
const inviter = require('./inviter');
const utils = require('./utils');

let credentials, keyword;

function start(email, password, skeyword) {
  keyword = skeyword.toLowerCase();
  storeCredentials(email, password);
  startScraping();
}

function startScraping() {
  utils.print(`\n  ${colors.grey('Connecting to the LinkedIn server..')}`);
  login.sessionCookies(credentials.email, credentials.password)
   .then((sessionCookies) => {
     // console.log(sessionCookies)
     utils.print(`\n  ${colors.green('Connected.')}`);
     utils.print('\n  ');
     utils.startTimer();

     let requestData, pages = false;
     if (keyword === 'all') {
       requestData = {
         url: constants.urls.peopleYouMayKnow,
         query: {
           count: constants.fetchingPeoplesCount,
           includeInsights: false,
           start: 0,
           usageContext: 'd_flagship3_people',
         }
       };
     }
     else {
       requestData = {
         url: constants.urls.peoplesearch,
         query: {
           count: 10,
           guides: "List(v->PEOPLE,facetNetwork->S|O)",
           keywords: keyword,
           origin: 'FACETED_SEARCH',
           q: 'guided',
           start: 0
         }
       };
       pages = true;
     }
     getConnectionsCount(sessionCookies)
      .then((data) => {
        if (data) {
          getUserData(sessionCookies, data.id)
           .then((profileData) => {
             if (profileData) {
               utils.print(`Welcome ${colors.yellow(profileData.firstName, profileData.lastName)}\n  `);
               utils.print(`Total Connections: ${colors.yellow(data.connections)}\n  `);
               utils.print(`Username: ${colors.yellow(profileData.publicIdentifier)}\n  `);

               getDashboardData(sessionCookies, profileData.publicIdentifier)
                .then((dashboardData) => {
                  utils.print(`Profile Views: ${colors.yellow(dashboardData.numProfileViews)}\n  `);
                  utils.print(`Search Appearances: ${colors.yellow(dashboardData.numSearchAppearances)}\n  `);
                  utils.print(`Posts Views: ${colors.yellow(dashboardData.numLastUpdateViews)}\n  `);
                  utils.print('\n  ');

                  fetchNextPeoples(sessionCookies, requestData, pages)
                })
                .catch((err) => {
                  onError(err);
                });
             }
           })
           .catch((err) => {
             onError(err);
           });
        }
      })
      .catch((err) => {
        onError(err);
      });
   })
   .catch((err) => {
     onError(err);
   });
}

function getConnectionsCount(sessionCookies) {
  let requestData = {
    url: constants.urls.connectionsSummary,
    query: null
  };
  return utils.makeReqPYMKGET(sessionCookies, requestData, constants.headers.peopleYouMayKnowGET)
   .then((response) => {
     if (response && response.data && response.data.numConnections) return {
       connections: response.data.numConnections,
       id: response.data.entityUrn.replace('urn:li:fs_relConnectionsSummary:', '')
     };
     else return null;
   });
  ;
}

function getUserData(sessionCookies, id) {
  let requestData = {
    url: constants.urls.profileDatas,
    query: {keyVersion: 'LEGACY_INBOX'}
  };
  return utils.makeReqPYMKGET(sessionCookies, requestData, constants.headers.peopleYouMayKnowGET)
   .then((response) => {
     // console.log(response.included, id);
     let profileData;
     for (let profile of response.included) {
       if (profile.firstName && profile.entityUrn === 'urn:li:fs_miniProfile:' + id) {
         profileData = profile;
       }
     }
     return profileData;
   });
  ;
}

function getDashboardData(sessionCookies, username) {
  let requestData = {
    url: constants.urls.dashboard.replace('{username}', username),
    query: null
  };

  return utils.makeReqPYMKGET(sessionCookies, requestData, constants.headers.peopleYouMayKnowGET)
   .then((response) => response.data);
  ;
}

function fetchNextPeoples(sessionCookies, requestData, pages) {
  peoples.fetch(sessionCookies, requestData)
   .then((peoples) => {
     // console.log(peoples);
     if (peoples.length == 0) {
       utils.print(`\n  ${colors.red(`No profiles found. Page '${requestData.query.start}`)}`);
       process.exit(0);
     }
     if (pages === true) requestData.query.start += 10;
     inviter.invite(sessionCookies, peoples)
      .then(() => {
        setTimeout(() => {
          fetchNextPeoples(sessionCookies, requestData, pages);
        }, constants.requestInterval);
      });
   })
   .catch((err) => {
     onError(err);
   });
}

function storeCredentials(email, password) {
  credentials = {email, password};
}

function onError(err) {
  let errMsg = void 0;
  if (err.response) {
    const statusCode = err.response.status;
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
  console.error(`\n  ${colors.red('error')}:   ${errMsg}`);
}

module.exports = {start};
