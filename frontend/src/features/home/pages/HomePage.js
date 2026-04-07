import { Bell, Settings } from 'lucide-react';

export default function HomePage({ app }) {
  const { authSession, chatMessages, likedPets, matches, openChat, setCurrentScreen } = app;
  const displayName = getDisplayName(authSession);

  return (
    <div className="bg-gray-50 flex flex-col pb-4">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 pb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm opacity-90">Good Morning</p>
            <h1 className="text-2xl font-bold">{displayName}</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCurrentScreen('notifications')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all relative">
              <Bell size={20} />
              {matches.length > 0 ? <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div> : null}
            </button>
            <button onClick={() => setCurrentScreen('settings')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
              <Settings size={20} />
            </button>
          </div>
        </div>
        <div className="flex gap-4 bg-white bg-opacity-15 rounded-2xl p-4">
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold">{matches.length}</div>
            <div className="text-xs opacity-90">Matches</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold">{likedPets.length}</div>
            <div className="text-xs opacity-90">Likes</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold">{matches.length * 2}</div>
            <div className="text-xs opacity-90">Messages</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button onClick={() => setCurrentScreen('discovery')} className="bg-white rounded-2xl p-4 text-center border-2 border-gray-100 hover:border-purple-500 transition-all">
            <span className="text-3xl mb-2 block">🐾</span>
            <span className="text-xs font-semibold">Discover Pets</span>
          </button>
          <button onClick={() => setCurrentScreen('matches')} className="bg-white rounded-2xl p-4 text-center border-2 border-gray-100 hover:border-purple-500 transition-all">
            <span className="text-3xl mb-2 block">💬</span>
            <span className="text-xs font-semibold">Messages</span>
          </button>
          <button onClick={() => setCurrentScreen('profile')} className="bg-white rounded-2xl p-4 text-center border-2 border-gray-100 hover:border-purple-500 transition-all">
            <span className="text-3xl mb-2 block">👤</span>
            <span className="text-xs font-semibold">My Profile</span>
          </button>
          <button onClick={() => alert('Pet Services - Find vets, groomers, and pet stores near you!')} className="bg-white rounded-2xl p-4 text-center border-2 border-gray-100 hover:border-purple-500 transition-all">
            <span className="text-3xl mb-2 block">🏥</span>
            <span className="text-xs font-semibold">Pet Services</span>
          </button>
          <button onClick={() => alert('Pet Events - Join local pet meetups and adoption events!')} className="bg-white rounded-2xl p-4 text-center border-2 border-gray-100 hover:border-purple-500 transition-all">
            <span className="text-3xl mb-2 block">🎉</span>
            <span className="text-xs font-semibold">Pet Events</span>
          </button>
          <button onClick={() => alert('Weather Check - Perfect day for a walk! 22°C, Sunny')} className="bg-white rounded-2xl p-4 text-center border-2 border-gray-100 hover:border-purple-500 transition-all">
            <span className="text-3xl mb-2 block">☀️</span>
            <span className="text-xs font-semibold">Weather</span>
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Pet Care Tips</h2>
          <span className="text-sm text-purple-600 font-semibold cursor-pointer hover:underline">See All</span>
        </div>
        <div className="space-y-3 mb-8">
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Daily Exercise</h3>
            <p className="text-sm text-gray-600">Aim for at least 30 minutes of exercise daily to keep your pet healthy and happy!</p>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Fresh Water</h3>
            <p className="text-sm text-gray-600">Always provide fresh, clean water. Change it daily to ensure your pet stays hydrated.</p>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Regular Vet Visits</h3>
            <p className="text-sm text-gray-600">Schedule annual check-ups and vaccinations to maintain your pet's health.</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Recent Matches</h2>
          <span onClick={() => setCurrentScreen('matches')} className="text-sm text-purple-600 font-semibold cursor-pointer hover:underline">See All</span>
        </div>
        {matches.length > 0 ? (
          <div className="space-y-3">
            {matches.slice(0, 3).map((match) => (
              <div key={match.id} onClick={() => openChat(match)} className="bg-white rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl flex-shrink-0">{match.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{match.name} & Owner</div>
                  <div className="text-xs text-gray-600 truncate">
                    {chatMessages[match.id]?.length > 0
                      ? chatMessages[match.id][chatMessages[match.id].length - 1].text
                      : "Great! Let's arrange a playdate soon"}
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">Just now</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🐾</div>
            <p className="text-gray-600 text-sm">No matches yet. Start discovering!</p>
            <button onClick={() => setCurrentScreen('discovery')} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-purple-700">Discover Pets</button>
          </div>
        )}
      </div>
    </div>
  );
}

function getDisplayName(authSession) {
  const fullName = authSession?.user?.fullName?.trim();

  if (fullName) {
    return fullName;
  }

  const email = authSession?.user?.email?.trim();

  if (email) {
    return email.split('@')[0];
  }

  return 'Pet Lover';
}
