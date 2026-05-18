import { Bell, Settings } from 'lucide-react';

import { VerifiedBadge } from '../../auth/components/EmailVerification';

export default function HomePage({ app }) {
  const {
    authSession,
    likedPets,
    matchNotificationCount = 0,
    matches,
    setCurrentScreen,
    unreadMatchCount = 0
  } = app;
  const displayName = getDisplayName(authSession);

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-50">
      <div className="sticky top-0 z-20 shrink-0 bg-gradient-to-r from-purple-500 to-indigo-600 px-6 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))] text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm opacity-90">Good Morning</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <VerifiedBadge isVerified={authSession?.user?.isVerified} className="bg-white/20 text-white ring-1 ring-white/30" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCurrentScreen('notifications')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all relative">
              <Bell size={20} />
              {matchNotificationCount > 0 ? <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div> : null}
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
            <div className="text-2xl font-bold">{unreadMatchCount}</div>
            <div className="text-xs opacity-90">Unread</div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6 pb-8">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
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
