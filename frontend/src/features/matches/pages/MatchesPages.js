import { ArrowLeft, ChevronLeft, Inbox, MessageCircle, Paperclip, RefreshCw, Search, Send } from 'lucide-react';

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
        <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30" aria-label="Back to home">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Messages</h1>
        <button onClick={refreshMatches} disabled={isMatchesLoading} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 disabled:opacity-50" aria-label="Refresh conversations">
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
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{matchesError}</p>
        ) : null}
        {isMatchesLoading && matches.length === 0 ? (
          <ConversationListSkeleton />
        ) : null}
        {visibleMatches.length > 0 ? visibleMatches.map((match) => (
          <ConversationCard key={match.id} match={match} onOpen={() => openChat(match)} />
        )) : null}
        {!isMatchesLoading && matches.length === 0 && !matchesError ? (
          <EmptyConversationState onStart={() => setCurrentScreen('discovery')} />
        ) : null}
        {!isMatchesLoading && matches.length > 0 && visibleMatches.length === 0 && !matchesError ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-8 text-center">
            <Inbox className="mx-auto mb-3 text-gray-300" size={32} />
            <p className="font-semibold text-gray-700">You are all caught up</p>
            <p className="mt-1 text-sm text-gray-500">No unread conversations right now.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ConversationCard({ match, onOpen }) {
  const unreadCount = Number(match.unreadCount) || 0;
  const hasUnread = Boolean(match.hasUnread || unreadCount > 0);
  const petDetails = [match.breed, match.type].filter(Boolean).join(' • ');

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`mb-3 flex w-full items-center gap-3 rounded-lg border bg-white p-4 text-left transition-all hover:border-purple-200 hover:shadow-md ${hasUnread ? 'border-purple-200 shadow-sm' : 'border-gray-100'}`}
    >
      <div className="relative flex-shrink-0">
        {match.image ? (
          <img src={match.image} alt={match.name} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-2xl text-white">{match.emoji}</div>
        )}
        {hasUnread ? (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-xs font-bold leading-4 text-white">
            {unreadCount > 9 ? '9+' : Math.max(unreadCount, 1)}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className={`min-w-0 flex-1 truncate ${hasUnread ? 'font-bold text-gray-950' : 'font-semibold text-gray-800'}`}>
            {match.name} & Owner
          </div>
          <div className={`flex-shrink-0 text-xs ${hasUnread ? 'font-semibold text-purple-600' : 'text-gray-400'}`}>
            {formatConversationTime(match.lastActivityAt || match.lastMessage?.createdAt || match.updatedAt)}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className={`min-w-0 flex-1 truncate text-sm ${hasUnread ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
            {getMatchPreview(match)}
          </p>
        </div>
        {petDetails ? (
          <p className="mt-1 truncate text-xs text-gray-400">{petDetails}</p>
        ) : null}
      </div>
    </button>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading conversations">
      <span className="sr-only">Loading conversations...</span>
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4">
          <div className="h-14 w-14 flex-shrink-0 rounded-full bg-gray-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-3 w-4/5 rounded bg-gray-100" />
            <div className="h-3 w-1/3 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyConversationState({ onStart }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
      <Search className="mb-4 text-purple-300" size={40} />
      <p className="font-semibold text-gray-700">No matches yet</p>
      <p className="mt-1 max-w-64 text-sm text-gray-500">Start discovering pets to open your first conversation.</p>
      <button onClick={onStart} className="mt-5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3 font-semibold text-white hover:shadow-lg">
        Start Discovering
      </button>
    </div>
  );
}

function getMatchPreview(match) {
  const preview = match.lastMessagePreview || match.lastMessage?.body;

  if (preview) {
    return match.lastMessageSentByCurrentUser ? `You: ${preview}` : preview;
  }

  return 'You matched. Say hello.';
}

function formatConversationTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();

  if (isSameDay(date, now)) {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' })
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
  const messageGroups = groupMessagesByDay(messages);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => setCurrentScreen('matches')} className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-opacity-30" aria-label="Back to messages">
          <ChevronLeft size={20} />
        </button>
        {currentChatPet?.image ? (
          <img src={currentChatPet.image} alt={currentChatPet.name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-11 h-11 bg-white bg-opacity-30 rounded-full flex items-center justify-center text-xl flex-shrink-0">{currentChatPet?.emoji || '🐕'}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">{currentChatPet?.name || 'Pet'} & Owner</div>
          <div className="text-xs opacity-90">{currentChatPet ? getChatSubtitle(currentChatPet) : 'Start a match first'}</div>
        </div>
        <button onClick={refreshMessages} disabled={!currentChatPet || isMessagesLoading} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-opacity-30 disabled:opacity-50" aria-label="Refresh messages">
          <RefreshCw size={18} />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messagesError ? (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{messagesError}</p>
        ) : null}
        {isMessagesLoading && messages.length === 0 ? (
          <MessageListSkeleton />
        ) : null}
        {!isMessagesLoading && messages.length === 0 && !messagesError ? (
          <EmptyChatState currentChatPet={currentChatPet} />
        ) : null}
        {messageGroups.map((group) => (
          <div key={group.label}>
            <div className="mb-4 text-center">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-400 shadow-sm">{group.label}</span>
            </div>
            {group.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
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
        <button type="button" className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-purple-600 hover:bg-purple-50" aria-label="Attach file">
          <Paperclip size={19} />
        </button>
        <input type="text" placeholder="Type a message..." value={newMessage} onChange={(event) => setNewMessage(event.target.value)} disabled={!currentChatPet || isSendingMessage} className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-60" />
        <button type="submit" disabled={!canSend} className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:shadow-lg disabled:opacity-50">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message }) {
  return (
    <div className={`mb-4 flex ${message.sent ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] ${message.sent ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block break-words px-4 py-3 text-sm shadow-sm ${message.sent ? 'rounded-2xl rounded-br bg-gradient-to-r from-purple-500 to-indigo-600 text-white' : 'rounded-2xl rounded-bl border border-gray-100 bg-white text-gray-800'}`}>
          {message.text}
        </div>
        <p className="mt-1 px-1 text-xs text-gray-400">{message.time}</p>
      </div>
    </div>
  );
}

function MessageListSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading messages">
      <span className="sr-only">Loading messages...</span>
      <div className="ml-auto h-12 w-2/3 rounded-2xl rounded-br bg-purple-100" />
      <div className="h-12 w-3/5 rounded-2xl rounded-bl bg-white shadow-sm" />
      <div className="ml-auto h-16 w-4/5 rounded-2xl rounded-br bg-purple-100" />
    </div>
  );
}

function EmptyChatState({ currentChatPet }) {
  const petName = currentChatPet?.name || 'this match';

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-purple-500">
        <MessageCircle size={30} />
      </div>
      <p className="font-semibold text-gray-700">No messages yet</p>
      <p className="mt-1 max-w-64 text-sm text-gray-500">Send a hello to {petName} and get the conversation started.</p>
    </div>
  );
}

function getChatSubtitle(match) {
  const petDetails = [match.breed, match.type].filter(Boolean).join(' • ');

  return petDetails || 'Matched conversation';
}

function groupMessagesByDay(messages) {
  return messages.reduce((groups, message) => {
    const label = formatMessageDay(message.createdAt);
    const groupLabel = label || 'Messages';
    const currentGroup = groups[groups.length - 1];

    if (currentGroup?.label === groupLabel) {
      currentGroup.messages.push(message);
      return groups;
    }

    groups.push({
      label: groupLabel,
      messages: [message]
    });

    return groups;
  }, []);
}

function formatMessageDay(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();

  if (isSameDay(date, now)) {
    return 'Today';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' })
  }).format(date);
}

function isSameDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}
