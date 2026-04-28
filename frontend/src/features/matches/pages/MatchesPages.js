import { ArrowLeft, ChevronLeft, RefreshCw, Send } from 'lucide-react';

export function MatchesPage({ app }) {
  const {
    isMatchesLoading,
    matches,
    matchesError,
    matchesFilter = 'all',
    openChat,
    refreshMatches = () => {},
    setCurrentScreen,
    setMatchesFilter = () => {},
    unreadMatchCount = 0
  } = app;
  const visibleMatches = matchesFilter === 'unread'
    ? matches.filter((match) => match.hasUnread)
    : matches;

  return (
    <div className="bg-gray-50 flex flex-col pb-4">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Messages</h1>
        <button onClick={refreshMatches} disabled={isMatchesLoading} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 disabled:opacity-50">
          <RefreshCw size={18} />
        </button>
      </div>
      <div className="flex border-b border-gray-200 bg-white">
        <button onClick={() => setMatchesFilter('all')} className={`flex-1 py-4 text-center font-semibold ${matchesFilter === 'all' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}>All</button>
        <button onClick={() => setMatchesFilter('matches')} className={`flex-1 py-4 text-center font-semibold ${matchesFilter === 'matches' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}>Matches</button>
        <button onClick={() => setMatchesFilter('unread')} className={`flex-1 py-4 text-center font-semibold ${matchesFilter === 'unread' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}>
          Unread{unreadMatchCount ? ` (${unreadMatchCount})` : ''}
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {matchesError ? (
          <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{matchesError}</p>
        ) : null}
        {isMatchesLoading && matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
            Loading matches...
          </div>
        ) : null}
        {visibleMatches.length > 0 ? visibleMatches.map((match) => (
          <div key={match.id} onClick={() => openChat(match)} className="bg-white rounded-2xl p-4 mb-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all">
            <div className="relative flex-shrink-0">
              {match.image ? (
                <img src={match.image} alt={match.name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl">{match.emoji}</div>
              )}
              {match.hasUnread ? (
                <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-red-500"></div>
              ) : (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{match.name} & Owner</div>
              <div className="text-sm text-gray-600 truncate">
                {getMatchPreview(match)}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-gray-400 mb-1">{formatConversationTime(match.lastMessage?.createdAt || match.updatedAt)}</div>
            </div>
          </div>
        )) : null}
        {!isMatchesLoading && matches.length === 0 && !matchesError ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-600 font-semibold mb-2">No matches yet</p>
            <p className="text-gray-500 text-sm mb-4">Start swiping to find your pet's perfect match!</p>
            <button onClick={() => setCurrentScreen('discovery')} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg">Start Discovering</button>
          </div>
        ) : null}
        {!isMatchesLoading && matches.length > 0 && visibleMatches.length === 0 && !matchesError ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
            No unread conversations.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getMatchPreview(match) {
  if (match.lastMessage?.body) {
    return match.lastMessage.body;
  }

  const petDetails = match.breed || match.type;

  return petDetails ? `${petDetails} is ready to chat` : 'Ready to chat';
}

function formatConversationTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function ChatPage({ app }) {
  const {
    chatMessages,
    currentChatPet,
    handleSendMessage,
    isMessagesLoading,
    isSendingMessage,
    messagesError,
    newMessage,
    refreshMessages = () => {},
    setCurrentScreen,
    setNewMessage
  } = app;
  const messages = currentChatPet ? chatMessages[currentChatPet.id] || [] : [];
  const canSend = Boolean(newMessage.trim()) && !isSendingMessage && Boolean(currentChatPet);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => setCurrentScreen('matches')} className="w-10 h-10 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center flex-shrink-0 hover:bg-opacity-30">
          <ChevronLeft size={20} />
        </button>
        {currentChatPet?.image ? (
          <img src={currentChatPet.image} alt={currentChatPet.name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-11 h-11 bg-white bg-opacity-30 rounded-full flex items-center justify-center text-xl flex-shrink-0">{currentChatPet?.emoji || '🐕'}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">{currentChatPet?.name || 'Pet'} & Owner</div>
          <div className="text-xs opacity-90">{currentChatPet ? 'Matched conversation' : 'Start a match first'}</div>
        </div>
        <button onClick={refreshMessages} disabled={!currentChatPet || isMessagesLoading} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-opacity-30 disabled:opacity-50">
          <RefreshCw size={18} />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-center text-xs text-gray-400 mb-4">Today</div>
        {messagesError ? (
          <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{messagesError}</p>
        ) : null}
        {isMessagesLoading && messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
            Loading messages...
          </div>
        ) : null}
        {!isMessagesLoading && messages.length === 0 && !messagesError ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">💬</div>
            <p className="font-semibold text-gray-700">No messages yet</p>
            <p className="mt-1 max-w-64 text-sm text-gray-500">Send the first message to start the conversation.</p>
          </div>
        ) : null}
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.sent ? 'text-right' : ''}`}>
            <div className={`inline-block ${message.sent ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl rounded-br-sm' : 'bg-white rounded-2xl rounded-bl-sm'} p-3 shadow-sm max-w-xs`}>
              <p className="text-sm">{message.text}</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">{message.time}</p>
          </div>
        ))}
      </div>
      <form
        className="bg-white border-t border-gray-200 p-4 flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          handleSendMessage();
        }}
      >
        <button type="button" className="text-purple-600 text-xl flex-shrink-0">📎</button>
        <input type="text" placeholder="Type a message..." value={newMessage} onChange={(event) => setNewMessage(event.target.value)} disabled={!currentChatPet || isSendingMessage} className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-60" />
        <button type="submit" disabled={!canSend} className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:shadow-lg disabled:opacity-50">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
