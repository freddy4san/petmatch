let messageBroadcaster = null;
let matchBroadcaster = null;

function setMessageBroadcaster(broadcaster) {
  messageBroadcaster = typeof broadcaster === "function" ? broadcaster : null;
}

function setMatchBroadcaster(broadcaster) {
  matchBroadcaster = typeof broadcaster === "function" ? broadcaster : null;
}

function emitMessageCreated(payload) {
  if (!messageBroadcaster) {
    return;
  }

  messageBroadcaster(payload);
}

function emitMatchCreated(payload) {
  if (!matchBroadcaster) {
    return;
  }

  matchBroadcaster(payload);
}

module.exports = {
  emitMatchCreated,
  emitMessageCreated,
  setMatchBroadcaster,
  setMessageBroadcaster,
};
