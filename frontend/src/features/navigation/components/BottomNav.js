export default function BottomNav({ active, matchCount, onNavigate }) {
  return (
    <div
      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 border-t border-purple-300 flex justify-around items-center px-1 pt-2 pb-3 md:rounded-t-2xl"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <button onClick={() => onNavigate('home')} className="flex flex-col items-center gap-1">
        <div className={`rounded-xl p-1.5 ${active === 'home' ? 'bg-white' : ''}`}>
          <span className="text-xl">🏠</span>
        </div>
        <span className={`text-xs font-semibold ${active === 'home' ? 'text-white' : 'text-white opacity-70'}`}>Home</span>
      </button>
      <button onClick={() => onNavigate('discovery')} className="flex flex-col items-center gap-1">
        <div className={`rounded-xl p-1.5 ${active === 'discovery' ? 'bg-white' : ''}`}>
          <span className="text-xl">🐾</span>
        </div>
        <span className={`text-xs font-semibold ${active === 'discovery' ? 'text-white' : 'text-white opacity-70'}`}>Discover</span>
      </button>
      <button onClick={() => onNavigate('matches')} className="flex flex-col items-center gap-1 relative">
        <div className={`rounded-xl p-1.5 ${active === 'matches' ? 'bg-white' : ''}`}>
          <span className="text-xl">💬</span>
          {matchCount > 0 ? (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {matchCount}
            </div>
          ) : null}
        </div>
        <span className={`text-xs font-semibold ${active === 'matches' ? 'text-white' : 'text-white opacity-70'}`}>Chats</span>
      </button>
      <button onClick={() => onNavigate('profile')} className="flex flex-col items-center gap-1">
        <div className={`rounded-xl p-1.5 ${active === 'profile' ? 'bg-white' : ''}`}>
          <span className="text-xl">👤</span>
        </div>
        <span className={`text-xs font-semibold ${active === 'profile' ? 'text-white' : 'text-white opacity-70'}`}>Profile</span>
      </button>
    </div>
  );
}
