const baseURL = 'https://www.linkedin.com/voyager/api';
const urls = {
  login: 'https://www.linkedin.com/uas/login',
  loginSubmit: 'https://www.linkedin.com/uas/login-submit',
  connectionsSummary: `${baseURL}/relationships/connectionsSummary`,
  peopleYouMayKnow: `${baseURL}/relationships/peopleYouMayKnow`,
  peoplesearch: `${baseURL}/search/cluster`,
  dashboard: `${baseURL}/identity/profiles/{username}/dashboard`,
  profileDatas: `${baseURL}/messaging/conversations`,
  normInvitations: `${baseURL}/growth/normInvitations`,
};

const headers = {
  loginGET: {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
  },

  loginSubmitPOST: {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'cache-control': 'no-cache',
    'content-type': 'application/x-www-form-urlencoded',
    'origin': 'https://www.linkedin.com',
    'pragma': 'no-cache',
    'referer': 'https://www.linkedin.com/uas/login',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
  },

  peopleYouMayKnowGET: {
    'accept': 'application/vnd.linkedin.normalized+json',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'cache-control': 'no-cache',
    'pragma': 'no-cache',
    'referer': 'https://www.linkedin.com/mynetwork/',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
    'x-li-lang': 'en_US',
    'x-li-track': '{"clientVersion":"1.1.*","osName":"web","timezoneOffset":5.5,"deviceFormFactor":"DESKTOP","mpName":"voyager-web"}',
    'x-requested-with': 'XMLHttpRequest',
    'x-restli-protocol-version': '2.0.0',
  },

  normInvitationsPOST: {
    'accept': 'text/plain, */*; q=0.01',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'cache-control': 'no-cache',
    'content-type': 'application/json; charset=UTF-8',
    'origin': 'https://www.linkedin.com',
    'pragma': 'no-cache',
    'referer': 'https://www.linkedin.com/mynetwork/',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
    'x-li-lang': 'en_US',
    'x-li-track': '{"clientVersion":"1.1.*","osName":"web","timezoneOffset":5.5,"deviceFormFactor":"DESKTOP","mpName":"voyager-web"}',
    'x-requested-with': 'XMLHttpRequest',
    'x-restli-protocol-version': '2.0.0',
  },
};

module.exports = {
  urls,
  headers,
  fetchingPeoplesCount: 50,
  requestInterval: 0,
  peopleProfileType: 'com.linkedin.voyager.identity.shared.MiniProfile',
};
