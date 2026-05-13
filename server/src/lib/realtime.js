let messageBroadcaster = null;

function setMessageBroadcaster(broadcaster) {
  messageBroadcaster = typeof broadcaster === "function" ? broadcaster : null;
}

function emitMessageCreated(payload) {
  if (!messageBroadcaster) {
    return;
  }

  messageBroadcaster(payload);
}

module.exports = {
  emitMessageCreated,
  setMessageBroadcaster,
};
