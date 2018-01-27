'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var readline = require('readline');
var axios = require('axios');
var colors = require('colors/safe');
var utils = require('./utils');
var constants = require('./constants');

var invitationStatus = {
  success: 0,
  failed: 0
};
var cursorRelYPos = void 0;
var isFirstTime = true;

function invite(sessionCookies, invitees) {
  var idx = 0;
  return new Promise(function (resolve) {
    (function func() {
      if (idx < invitees.length) {
        makeReqInvitationsPOST(sessionCookies, invitees[idx]).then(function () {
          func();
        });
        idx++;
      } else {
        resolve();
      }
    })();
  });
}

function makeReqInvitationsPOST(cookies, invitee) {
  var csrfToken = utils.trim(cookies.JSESSIONID, '"');

  var invitationsData = JSON.stringify({
    excludeInvitations: [],
    invitations: [],
    trackingId: invitee.trackingId,
    invitee: {
      'com.linkedin.voyager.growth.invitation.InviteeProfile': {
        profileId: invitee.profileId
      }
    }
  });

  var headers = _extends({}, constants.headers.normInvitationsPOST, {
    cookie: utils.stringifyCookies(cookies),
    'csrf-token': csrfToken
  });

  var reqConfig = {
    headers: headers,
    responseType: 'text'
  };

  return axios.post(constants.urls.normInvitations, invitationsData, reqConfig).then(function () {
    invitationStatus.success++;
    printInvite(invitee, true, invitationStatus.success, invitationStatus.failed);
  }).catch(function (err) {
    invitationStatus.failed++;
    printInvite(invitee, false, invitationStatus.success, invitationStatus.failed);

    var statusCode = err.response.status;
    if (statusCode === 429) {
      console.error(colors.red('error') + ':   too many requests');
      process.exit();
    }
  });
}

function printInvite(invitee, isSuccess, successCount, failedCount) {
  if (!global.verbose) {
    return;
  }
  var isFirstCard = isFirstTime;

  if (isFirstCard) {
    isFirstTime = false;
    utils.print('\n');
    cursorRelYPos = printInviteCard(invitee, isSuccess, successCount, failedCount);
  } else {
    readline.cursorTo(utils.currentPrintStream, 0);
    readline.moveCursor(utils.currentPrintStream, 0, -cursorRelYPos);
    readline.clearScreenDown(utils.currentPrintStream);
    cursorRelYPos = printInviteCard(invitee, isSuccess, successCount, failedCount);
  }
}

function printInviteCard(invitee, isSuccess, successCount, failedCount) {
  var totNewLines = 0;
  var wrapTextWidth = utils.currentPrintStream.columns - 10;
  var wrapOption = { width: wrapTextWidth, indent: '    ' };

  var wrappedInvName = utils.wrapText(inviteeName(invitee), wrapOption);
  var wrappedInvOccupation = utils.wrapText(utils.resolveNewLines(invitee.occupation), wrapOption);

  totNewLines += wrappedInvName.split('\n').length - 1;
  totNewLines += wrappedInvOccupation.split('\n').length - 1;

  var invTitle = wrappedInvName.trim();
  var invOccupation = colors.grey(wrappedInvOccupation);
  var statusChar = isSuccess ? colors.green('✓') : colors.red('⨯');
  var successCountMsg = colors.grey('Success:') + ' ' + colors.green('' + successCount);
  var failedCountMsg = colors.grey('Failed:') + ' ' + colors.red('' + failedCount);
  var elapsedTimeMsg = colors.grey('Elapsed:') + ' ' + colors.cyan(utils.endTimer());

  utils.print('  ' + statusChar + ' ');
  utils.print(invTitle);
  utils.print('\n');
  utils.print(invOccupation);
  utils.print('\n\n\n');
  utils.print('  ');
  utils.print('' + successCountMsg);
  utils.print('  ');
  utils.print('' + failedCountMsg);
  utils.print('  ');
  utils.print(elapsedTimeMsg);
  utils.print('\n\n  ');

  totNewLines += 6;

  return totNewLines;
}

function inviteeName(invitee) {
  return utils.resolveNewLines(invitee.firstName.trim() + ' ' + invitee.lastName.trim());
}

module.exports = {
  invite: invite
};