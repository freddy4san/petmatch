import { ArrowLeft, ChevronLeft, Send } from 'lucide-react';

export function MatchesPage({ app }) {
  const { chatMessages, matches, openChat, setCurrentScreen } = app;

  return (
    <div className="bg-gray-50 flex flex-col pb-4">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Messages</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex border-b border-gray-200 bg-white">
        {['All', 'Matches', 'Unread'].map((tab, index) => (
          <div key={tab} className={`flex-1 py-4 text-center font-semibold ${index === 0 ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}>{tab}</div>
        ))}
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {matches.length > 0 ? matches.map((match) => (
          <div key={match.id} onClick={() => openChat(match)} className="bg-white rounded-2xl p-4 mb-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl">{match.emoji}</div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{match.name} & Owner</div>
              <div className="text-sm text-gray-600 truncate">
                {chatMessages[match.id]?.length > 0
                  ? chatMessages[match.id][chatMessages[match.id].length - 1].text
                  : `Let's meet up at ${match.location}`}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-gray-400 mb-1">Just now</div>
              {!chatMessages[match.id] || chatMessages[match.id].length <= 1 ? (
                <div onClick={() => alert('Marked as read!')} className="bg-green-500 text-white rounded-full px-2 py-0.5 text-xs font-bold cursor-pointer">New</div>
              ) : null}
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-600 font-semibold mb-2">No matches yet</p>
            <p className="text-gray-500 text-sm mb-4">Start swiping to find your pet's perfect match!</p>
            <button onClick={() => setCurrentScreen('discovery')} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg">Start Discovering</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatPage({ app }) {
  const { chatMessages, currentChatPet, handleSendMessage, matches, newMessage, setCurrentScreen, setNewMessage } = app;
  const messages = currentChatPet ? chatMessages[currentChatPet.id] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => setCurrentScreen('matches')} className="w-10 h-10 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center flex-shrink-0 hover:bg-opacity-30">
          <ChevronLeft size={20} />
        </button>
        <div className="w-11 h-11 bg-white bg-opacity-30 rounded-full flex items-center justify-center text-xl flex-shrink-0">{currentChatPet?.emoji || '🐕'}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">{currentChatPet?.name || 'Pet'} & Owner</div>
          <div className="text-xs opacity-90">{matches.length > 0 ? 'Active now' : 'Start a match first'}</div>
        </div>
        <button className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl flex-shrink-0 hover:bg-opacity-30">📞</button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-center text-xs text-gray-400 mb-4">Today</div>
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.sent ? 'text-right' : ''}`}>
            <div className={`inline-block ${message.sent ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl rounded-br-sm' : 'bg-white rounded-2xl rounded-bl-sm'} p-3 shadow-sm max-w-xs`}>
              <p className="text-sm">{message.text}</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">{message.time}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border-t border-gray-200 p-4 flex items-center gap-2">
        <button className="text-purple-600 text-xl flex-shrink-0">📎</button>
        <input type="text" placeholder="Type a message..." value={newMessage} onChange={(event) => setNewMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { handleSendMessage(); } }} className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:ring-2 focus:ring-purple-500 outline-none" />
        <button onClick={handleSendMessage} className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:shadow-lg">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
