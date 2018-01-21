const axios = require('axios');
const colors = require('colors/safe');
const utils = require('./utils');
const constants = require('./constants');

const ID = utils.idMaker();

function invite(sessionCookies, invitees) {
  let idx = 0;
  return new Promise((resolve) => {
    (function func() {
      if (idx < invitees.length) {
        makeReqInvitationsPOST(sessionCookies, invitees[idx])
          .then(() => {
            func();
          });
        idx++;
      } else {
        resolve();
      }
    }());
  });
}

function makeReqInvitationsPOST(cookies, invitee) {
  const csrfToken = utils.trim(cookies.JSESSIONID, '"');

  const invitationsData = JSON.stringify({
    excludeInvitations: [],
    invitations: [],
    trackingId: invitee.trackingId,
    invitee: {
      'com.linkedin.voyager.growth.invitation.InviteeProfile': {
        profileId: invitee.profileId,
      },
    },
  });

  const headers = {
    ...constants.headers.normInvitationsPOST,
    cookie: utils.stringifyCookies(cookies),
    'csrf-token': csrfToken,
  };

  const reqConfig = {
    headers,
    responseType: 'text',
  };

  return axios.post(constants.urls.normInvitations, invitationsData, reqConfig)
    .then(() => {
      utils.print(`\n ${colors.green('✓')} ${colors.grey(ID.next().value)} ${colors.grey(inviteeName(invitee))}${colors.grey(',')} ${colors.grey.dim(inviteeOccupation(invitee))}`);
    })
    .catch((err) => {
      const statusCode = err.response.status;
      if (statusCode === 429) {
        console.error(`\n\n  ${colors.red('error')}:   too many requests\n`);
        process.exit();
      } else {
        utils.print(`\n  ${colors.red('⨯')} ${colors.grey(inviteeName(invitee))}${colors.grey(',')} ${colors.grey.dim(inviteeOccupation(invitee))}`);
      }
    });
}

function inviteeName(invitee) {
  return `${invitee.firstName} ${invitee.lastName}`;
}

function inviteeOccupation(invitee) {
  return invitee.occupation.trim().replace(/[\n\r]+/g, ' ');
}

module.exports = {
  invite,
};

process.on('SIGINT', () => {
  utils.print(colors.green(`\n\n Congratulations! You have sent ${ID.next().value - 1} connection requests`));
});
