const readline = require('readline');
const axios = require('axios');
const colors = require('colors/safe');
const utils = require('./utils');
const constants = require('./constants');

const invitationStatus = {
  success: 0,
  failed: 0,
};
let cursorInitialPos;
let isFirstTime = true;

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
      invitationStatus.success++;
      printInvite(invitee, true, invitationStatus.success, invitationStatus.failed);
    })
    .catch((err) => {
      invitationStatus.failed++;
      printInvite(invitee, false, invitationStatus.success, invitationStatus.failed);

      const statusCode = err.response.status;
      if (statusCode === 429) {
        console.error(`${colors.red('error')}:   too many requests`);
        process.exit();
      }
    });
}

function printInvite(invitee, isSuccess, successCount, failedCount) {
  if (!global.verbose) { return; }
  const isFirstCard = isFirstTime;

  if (isFirstCard) {
    isFirstTime = false;
    utils.print('\n');
    cursorInitialPos = utils.currentCursorPosition();
    printInviteCard(invitee, isSuccess, successCount, failedCount);
  } else {
    readline.cursorTo(utils.currentPrintStream, cursorInitialPos.col - 1, cursorInitialPos.row - 1);
    readline.clearScreenDown(utils.currentPrintStream);
    printInviteCard(invitee, isSuccess, successCount, failedCount);
  }
}

function printInviteCard(invitee, isSuccess, successCount, failedCount) {
  // const invTitle = colors.cyan(inviteeName(invitee));
  const invTitle = inviteeName(invitee);  
  const wrapTextWidth = utils.currentPrintStream.columns - 10;
  const invOccupation = colors.grey(utils.wrapText(utils.resolveNewLines(invitee.occupation), { width: wrapTextWidth, indent: '    ' }));
  const statusChar = isSuccess ? colors.green('✓') : colors.red('⨯');
  const successCountMsg = `${colors.grey('Success:')} ${colors.green(`${successCount}`)}`;
  const failedCountMsg = `${colors.grey('Failed:')} ${colors.red(`${failedCount}`)}`;
  const elapsedTimeMsg = `${colors.grey('Elapsed:')} ${colors.cyan(utils.endTimer())}`;

  utils.print(`  ${statusChar} `);
  utils.print(invTitle);
  utils.print('\n');
  utils.print(invOccupation);
  utils.print('\n\n\n');
  utils.print('  ');
  utils.print(`${successCountMsg}`);
  utils.print('  ');
  utils.print(`${failedCountMsg}`);
  utils.print('  ');
  utils.print(elapsedTimeMsg);
  utils.print('\n\n  ');
}

function inviteeName(invitee) {
  return `${invitee.firstName.trim()} ${invitee.lastName.trim()}`;
}

module.exports = {
  invite,
};
