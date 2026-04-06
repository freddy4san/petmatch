import { ArrowLeft, X } from 'lucide-react';

export function PreferencesPage({ app }) {
  const { maxDistance, setCurrentScreen, setMaxDistance } = app;

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Preferences</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4">
          <div className="bg-gray-50 px-5 py-3 text-xs font-bold text-gray-500 tracking-wider">DISCOVERY SETTINGS</div>
          <div className="divide-y divide-gray-100">
            <div className="px-5 py-4">
              <div className="font-semibold text-sm mb-3">Maximum Distance</div>
              <input type="range" min="1" max="50" value={maxDistance} onChange={(event) => setMaxDistance(event.target.value)} className="w-full" />
              <div className="text-xs text-gray-600 mt-2">Up to {maxDistance} km</div>
            </div>
            <div className="px-5 py-4">
              <div className="font-semibold text-sm mb-3">Age Range</div>
              <div className="flex gap-4 items-center">
                <input type="number" defaultValue="1" className="w-20 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
                <span className="text-gray-600">to</span>
                <input type="number" defaultValue="10" className="w-20 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
                <span className="text-sm text-gray-600">years</span>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="font-semibold text-sm mb-3">Pet Types</div>
              <div className="space-y-2">
                {['Dogs', 'Cats', 'Birds', 'Rabbits', 'Reptiles', 'Fish', 'Small Mammals'].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked={type === 'Dogs' || type === 'Cats'} className="rounded" />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="font-semibold text-sm mb-3">Looking For</div>
              <div className="space-y-2">
                {['Playdates', 'Walking Partners', 'Breeding', 'Adoption', 'Training Partners', 'Grooming Buddies', 'Pet Sitting'].map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked={option === 'Playdates'} className="rounded" />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationSettingsPage({ app }) {
  const { notificationsEnabled, setCurrentScreen, setNotificationsEnabled } = app;

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-5 py-3 text-xs font-bold text-gray-500 tracking-wider">PUSH NOTIFICATIONS</div>
          <div className="divide-y divide-gray-100">
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Enable Notifications</div>
                <div className="text-xs text-gray-600">Receive all notifications</div>
              </div>
              <div onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`w-11 h-6 ${notificationsEnabled ? 'bg-purple-600' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors`}>
                <div className={`absolute ${notificationsEnabled ? 'right-0.5' : 'left-0.5'} top-0.5 w-5 h-5 bg-white rounded-full transition-all`}></div>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="font-semibold text-sm">New Matches</div>
              <input type="checkbox" defaultChecked className="rounded w-5 h-5" />
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="font-semibold text-sm">Messages</div>
              <input type="checkbox" defaultChecked className="rounded w-5 h-5" />
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="font-semibold text-sm">Likes</div>
              <input type="checkbox" defaultChecked className="rounded w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage({ app }) {
  const { setCurrentScreen, setShowDistance, showDistance } = app;

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Privacy & Safety</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-5 py-3 text-xs font-bold text-gray-500 tracking-wider">PRIVACY SETTINGS</div>
          <div className="divide-y divide-gray-100">
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Show in Discovery</div>
                <div className="text-xs text-gray-600">Let others see your profile</div>
              </div>
              <div className="w-11 h-6 bg-purple-600 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Show Distance</div>
                <div className="text-xs text-gray-600">Display on profile</div>
              </div>
              <div onClick={() => setShowDistance(!showDistance)} className={`w-11 h-6 ${showDistance ? 'bg-purple-600' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors`}>
                <div className={`absolute ${showDistance ? 'right-0.5' : 'left-0.5'} top-0.5 w-5 h-5 bg-white rounded-full transition-all`}></div>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Read Receipts</div>
                <div className="text-xs text-gray-600">Show when you read messages</div>
              </div>
              <div className="w-11 h-6 bg-purple-600 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VerificationPage() {
  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <div className="w-10"></div>
        <h1 className="text-2xl font-bold">Verification</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-5xl text-green-600">✓</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Verified</h2>
          <p className="text-gray-600 mb-6">Your account has been successfully verified</p>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-green-600 text-xl">✓</div>
              <div className="text-left">
                <div className="font-semibold text-sm">Email Verified</div>
                <div className="text-xs text-gray-500">bhavana@example.com</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-green-600 text-xl">✓</div>
              <div className="text-left">
                <div className="font-semibold text-sm">Phone Verified</div>
                <div className="text-xs text-gray-500">+61 *** *** 123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsPage({ app }) {
  const { matches, setCurrentScreen } = app;

  return (
    <div className="bg-gray-50 flex flex-col pb-4">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {matches.length > 0 ? (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">💜</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">New Match!</div>
                  <div className="text-sm text-gray-600 mb-2">You matched with {matches[0].name}! Start chatting now.</div>
                  <div className="text-xs text-purple-600">2 minutes ago</div>
                </div>
              </div>
            </div>
          ) : null}
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">💬</div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">New Message</div>
                <div className="text-sm text-gray-600 mb-2">Someone sent you a message</div>
                <div className="text-xs text-gray-400">1 hour ago</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">⭐</div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">Someone liked your pet!</div>
                <div className="text-sm text-gray-600 mb-2">Luna received a like</div>
                <div className="text-xs text-gray-400">3 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage({ app }) {
  const { handleLogout, setCurrentScreen } = app;

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-5 py-3 text-xs font-bold text-gray-500 tracking-wider">GENERAL</div>
          <div className="divide-y divide-gray-100">
            <div onClick={() => setCurrentScreen('preferences')} className="px-5 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between">
              <div className="font-semibold text-sm">Preferences</div>
              <span className="text-gray-400">›</span>
            </div>
            <div onClick={() => setCurrentScreen('notificationSettings')} className="px-5 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between">
              <div className="font-semibold text-sm">Notifications</div>
              <span className="text-gray-400">›</span>
            </div>
            <div onClick={() => setCurrentScreen('privacy')} className="px-5 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between">
              <div className="font-semibold text-sm">Privacy & Safety</div>
              <span className="text-gray-400">›</span>
            </div>
            <div onClick={handleLogout} className="px-5 py-4 cursor-pointer hover:bg-gray-50">
              <div className="font-semibold text-sm text-red-600">Log Out</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PremiumPage({ onNavigate }) {
  return (
    <div className="h-full bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 flex flex-col">
      <div className="p-6 flex items-center justify-between text-white">
        <button onClick={() => onNavigate('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <X size={20} />
        </button>
        <div className="text-2xl">⭐</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center text-white mb-8">
            <div className="text-6xl mb-4">⭐</div>
            <h1 className="text-4xl font-bold mb-4">Go Premium</h1>
            <p className="text-lg opacity-90">Unlock unlimited features for your pet</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
            <div className="space-y-4 mb-6">
              {[
                { title: 'Unlimited Swipes', desc: 'Never run out of potential matches' },
                { title: 'Super Likes', desc: '5 super likes per day to stand out' },
                { title: 'See Who Liked You', desc: 'Match faster by seeing who is interested' },
                { title: 'Priority Support', desc: 'Get help faster from our team' },
                { title: 'Ad-Free Experience', desc: 'Enjoy PetMatch without interruptions' }
              ].map(({ desc, title }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0 text-sm">✓</div>
                  <div>
                    <div className="font-semibold">{title}</div>
                    <div className="text-sm text-gray-600">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">$9.99<span className="text-lg text-gray-600">/month</span></div>
                <div className="text-sm text-gray-600">Cancel anytime</div>
              </div>
              <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all">
                Start Free Trial
              </button>
              <div className="text-center text-xs text-gray-500 mt-3">7 days free, then $9.99/month</div>
            </div>
          </div>
          <button onClick={() => onNavigate('profile')} className="w-full text-white text-center py-3 font-semibold hover:opacity-80">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

export function HelpPage({ onNavigate }) {
  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => onNavigate('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6">
        <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold mb-2">How do I match with pets?</h3>
            <p className="text-gray-600">Swipe right on pets you like in the Discover section to match with them.</p>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold mb-2">How do I start a chat?</h3>
            <p className="text-gray-600">Once you match, go to the Chats tab and click on the match to start messaging.</p>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold mb-2">How do I change my preferences?</h3>
            <p className="text-gray-600">Go to Profile {'>'} Preferences to adjust discovery settings like distance and pet types.</p>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold mb-2">How do I report a problem?</h3>
            <p className="text-gray-600">Contact our support team at support@petmatch.com for assistance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutPage({ onNavigate }) {
  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => onNavigate('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">About PetMatch</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🐾</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PetMatch</h2>
          <p className="text-gray-600 mb-4">Version 1.0.0</p>
          <p className="text-gray-600 leading-relaxed">PetMatch is the ultimate app for finding perfect playmates, breeding partners, and friends for your beloved pets. Connect with pet owners in your area and create lasting bonds between furry friends.</p>
          <div className="mt-6 text-sm text-gray-500">
            <p>© 2024 PetMatch Inc.</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LanguagePage({ onNavigate }) {
  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => onNavigate('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Language</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6">
        <h2 className="text-lg font-bold mb-4">Select Language</h2>
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-lg">🇺🇸</span>
              <span className="font-semibold">English</span>
            </div>
            <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-lg">🇪🇸</span>
              <span className="font-semibold">Español</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-lg">🇫🇷</span>
              <span className="font-semibold">Français</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-lg">🇩🇪</span>
              <span className="font-semibold">Deutsch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThemePage({ app }) {
  const { setCurrentScreen, setTheme, theme } = app;

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Theme</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6">
        <h2 className="text-lg font-bold mb-4">Choose Theme</h2>
        <div className="space-y-3">
          <div onClick={() => setTheme('light')} className={`bg-white rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${theme === 'light' ? 'ring-2 ring-purple-500' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="text-lg">☀️</span>
              <span className="font-semibold">Light Mode</span>
            </div>
            {theme === 'light' ? (
              <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            ) : null}
          </div>
          <div onClick={() => setTheme('dark')} className={`bg-white rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${theme === 'dark' ? 'ring-2 ring-purple-500' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="text-lg">🌙</span>
              <span className="font-semibold">Dark Mode</span>
            </div>
            {theme === 'dark' ? (
              <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
