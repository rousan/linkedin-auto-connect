const querystring = require('querystring');
const constants = require('./constants');
const utils = require('./utils');

function sessionCookies(email, password) {
  return makeReqLoginGET()
   .then(cookies => makeReqLoginPOST(email, password, cookies));
}

function makeReqLoginGET() {
  const reqConfig = {
    headers: {...constants.headers.loginGET},
    responseType: 'text',
  };
  return utils.fetchCookies(constants.urls.login, 'get', reqConfig);
}

function makeReqLoginPOST(email, password, cookies) {
  const csrfParam = utils.trim(cookies.bcookie, '"').split('&')[1];

  const auth = querystring.stringify({
    'session_key': email,
    'session_password': password,
    'isJsEnabled': 'false',
    'loginCsrfParam': csrfParam,
  });

  const headers = {
    ...constants.headers.loginSubmitPOST,
    cookie: utils.stringifyCookies(cookies),
  };

  const reqConfig = {
    headers,
    maxRedirects: 0,
    validateStatus: validateStatusForURLRedirection,
    data: auth,
    responseType: 'text',
  };

  return utils.fetchCookies(constants.urls.loginSubmit, 'post', reqConfig)
   .then(cookieUpdates => ({...cookies, ...cookieUpdates}));
}

function validateStatusForURLRedirection(status) {
  return status >= 200 && (status < 300 || status === 302);
}

module.exports = {
  sessionCookies,
};
