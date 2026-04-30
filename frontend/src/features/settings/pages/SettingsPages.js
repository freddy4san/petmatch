import { ArrowLeft, Bell, Settings, X } from 'lucide-react';

export function PreferencesPage({ app }) {
  const {
    applyDiscoveryFilters = () => {},
    discoveryFilterDraft = DEFAULT_DISCOVERY_FILTERS,
    discoveryFilters = DEFAULT_DISCOVERY_FILTERS,
    maxDistance,
    resetDiscoveryFilters = () => {},
    setCurrentScreen,
    setMaxDistance,
    updateDiscoveryFilter = () => {}
  } = app;
  const activeFilterCount = getActiveDiscoveryFilterCount(discoveryFilters);
  const draftFilterCount = getActiveDiscoveryFilterCount(discoveryFilterDraft);
  const hasUnappliedChanges = !areDiscoveryFiltersEqual(discoveryFilterDraft, discoveryFilters);
  const breedOptions = getBreedOptions(discoveryFilterDraft.type);

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('settings')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
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
                <input
                  type="number"
                  min="0"
                  value={discoveryFilterDraft.minAge}
                  onChange={(event) => updateDiscoveryFilter('minAge', event.target.value)}
                  placeholder="Any"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-600">to</span>
                <input
                  type="number"
                  min="0"
                  value={discoveryFilterDraft.maxAge}
                  onChange={(event) => updateDiscoveryFilter('maxAge', event.target.value)}
                  placeholder="Any"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">years</span>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="font-semibold text-sm mb-3">Pet Type</div>
              <select
                value={discoveryFilterDraft.type}
                onChange={(event) => updateDiscoveryFilter('type', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Any type</option>
                {PET_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="px-5 py-4">
              <div className="font-semibold text-sm mb-3">Breed</div>
              <input
                type="text"
                list="discovery-breed-options"
                value={discoveryFilterDraft.breed}
                onChange={(event) => updateDiscoveryFilter('breed', event.target.value)}
                placeholder="Any breed"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
              <datalist id="discovery-breed-options">
                {breedOptions.map((breed) => (
                  <option key={breed} value={breed} />
                ))}
              </datalist>
            </div>
            <div className="px-5 py-4">
              <div className="font-semibold text-sm mb-3">Size</div>
              <select
                value={discoveryFilterDraft.size}
                onChange={(event) => updateDiscoveryFilter('size', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Any size</option>
                {PET_SIZE_OPTIONS.map((size) => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Only Pets With Photos</div>
                <div className="text-xs text-gray-600">Hide profiles without images</div>
              </div>
              <input
                type="checkbox"
                checked={discoveryFilterDraft.withPhotos}
                onChange={(event) => updateDiscoveryFilter('withPhotos', event.target.checked)}
                className="rounded w-5 h-5"
              />
            </div>
            <div className="px-5 py-4">
              <div className="mb-3 text-xs font-semibold text-gray-500">
                {activeFilterCount} applied · {draftFilterCount} selected
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={resetDiscoveryFilters}
                  disabled={activeFilterCount === 0 && draftFilterCount === 0}
                  className="rounded-full border border-gray-200 px-4 py-3 text-sm font-bold text-purple-600 disabled:text-gray-300"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={applyDiscoveryFilters}
                  disabled={!hasUnappliedChanges}
                  className="rounded-full bg-purple-600 px-4 py-3 text-sm font-bold text-white disabled:bg-gray-300"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PET_TYPE_OPTIONS = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Reptile'];
const BREED_OPTIONS_BY_TYPE = {
  Bird: [
    'African Grey',
    'Budgerigar',
    'Canary',
    'Cockatiel',
    'Conure',
    'Lovebird',
    'Macaw',
    'Parrot',
    'Parrotlet'
  ],
  Cat: [
    'Abyssinian',
    'Bengal',
    'British Shorthair',
    'Domestic Longhair',
    'Domestic Shorthair',
    'Maine Coon',
    'Persian',
    'Ragdoll',
    'Russian Blue',
    'Scottish Fold',
    'Siamese',
    'Sphynx'
  ],
  Dog: [
    'Australian Shepherd',
    'Beagle',
    'Border Collie',
    'Boxer',
    'Bulldog',
    'Cavalier King Charles Spaniel',
    'Chihuahua',
    'Cocker Spaniel',
    'Corgi',
    'Dachshund',
    'French Bulldog',
    'German Shepherd',
    'Golden Retriever',
    'Labrador Retriever',
    'Maltese',
    'Poodle',
    'Pomeranian',
    'Shih Tzu',
    'Staffordshire Bull Terrier',
    'Whippet'
  ],
  Rabbit: [
    'Angora',
    'Dutch',
    'Flemish Giant',
    'Holland Lop',
    'Lionhead',
    'Mini Lop',
    'Mini Rex',
    'Netherland Dwarf',
    'Rex'
  ],
  Reptile: [
    'Ball Python',
    'Bearded Dragon',
    'Blue-Tongued Skink',
    'Boa Constrictor',
    'Corn Snake',
    'Crested Gecko',
    'Greek Tortoise',
    'Green Iguana',
    'Hermann Tortoise',
    'Leopard Gecko',
    'Red-Eared Slider',
    'Russian Tortoise',
    'Sulcata Tortoise'
  ]
};
const ALL_BREED_OPTIONS = Array.from(new Set(Object.values(BREED_OPTIONS_BY_TYPE).flat())).sort();
const PET_SIZE_OPTIONS = [
  { value: 'SMALL', label: 'Small' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LARGE', label: 'Large' },
  { value: 'EXTRA_LARGE', label: 'Extra large' }
];
const DEFAULT_DISCOVERY_FILTERS = {
  breed: '',
  maxAge: '',
  minAge: '',
  size: '',
  type: '',
  withPhotos: false
};

function getActiveDiscoveryFilterCount(filters = {}) {
  return [
    filters.type,
    filters.breed?.trim(),
    filters.minAge,
    filters.maxAge,
    filters.size,
    filters.withPhotos
  ].filter(Boolean).length;
}

function getBreedOptions(type) {
  return BREED_OPTIONS_BY_TYPE[type] || ALL_BREED_OPTIONS;
}

function areDiscoveryFiltersEqual(left = {}, right = {}) {
  return left.type === right.type
    && left.breed === right.breed
    && left.minAge === right.minAge
    && left.maxAge === right.maxAge
    && left.size === right.size
    && Boolean(left.withPhotos) === Boolean(right.withPhotos);
}

export function NotificationSettingsPage({ app }) {
  const { notificationsEnabled, setCurrentScreen, setNotificationsEnabled } = app;

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('settings')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
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
        <button onClick={() => setCurrentScreen('settings')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
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
  const { handleLogout, notificationsEnabled, setCurrentScreen, setNotificationsEnabled, theme } = app;

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">ACCOUNT SETTINGS</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <div onClick={() => setCurrentScreen('preferences')} className="flex items-center gap-4 p-4 cursor-pointer active:bg-gray-50">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Settings size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">Preferences</div>
                <div className="text-xs text-gray-500">Discovery and matching settings</div>
              </div>
              <span className="text-gray-300 flex-shrink-0">›</span>
            </div>
            <div className="border-t border-gray-100"></div>
            <div onClick={() => setCurrentScreen('notificationSettings')} className="flex items-center gap-4 p-4 cursor-pointer active:bg-gray-50">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell size={20} className="text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">Notifications</div>
                <div className="text-xs text-gray-500">Push notifications and alerts</div>
              </div>
              <div onClick={(event) => { event.stopPropagation(); setNotificationsEnabled(!notificationsEnabled); }} className={`w-11 h-6 ${notificationsEnabled ? 'bg-purple-600' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors flex-shrink-0`}>
                <div className={`absolute ${notificationsEnabled ? 'right-0.5' : 'left-0.5'} top-0.5 w-5 h-5 bg-white rounded-full transition-all`}></div>
              </div>
            </div>
            <div className="border-t border-gray-100"></div>
            <div onClick={() => setCurrentScreen('privacy')} className="flex items-center gap-4 p-4 cursor-pointer active:bg-gray-50">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="text-red-600 text-xl">🔒</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">Privacy & Safety</div>
                <div className="text-xs text-gray-500">Control who can see your profile</div>
              </div>
              <span className="text-gray-300 flex-shrink-0">›</span>
            </div>
            <div className="border-t border-gray-100"></div>
            <div onClick={() => setCurrentScreen('premium')} className="flex items-center gap-4 p-4 cursor-pointer active:bg-gray-50">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="text-yellow-600 text-xl">⭐</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">Go Premium</div>
                <div className="text-xs text-gray-500">Unlock unlimited features</div>
              </div>
              <span className="text-gray-300 flex-shrink-0">›</span>
            </div>
            <div className="border-t border-gray-100"></div>
            <div onClick={() => setCurrentScreen('verification')} className="flex items-center gap-4 p-4 cursor-pointer active:bg-gray-50">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="text-green-600 text-xl font-bold">✓</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">Account Verification</div>
                <div className="text-xs text-gray-500">Verify your identity</div>
              </div>
              <div className="bg-green-500 px-3 py-1 rounded-full text-xs font-bold text-white flex-shrink-0">Active</div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">APP SETTINGS</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <div onClick={() => setCurrentScreen('help')} className="flex items-center gap-4 p-4 cursor-pointer active:bg-gray-50">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="text-purple-600 text-xl">❓</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">Help & Support</div>
                <div className="text-xs text-gray-500">Get help or contact support</div>
              </div>
              <span className="text-gray-300 flex-shrink-0">›</span>
            </div>
            <div className="border-t border-gray-100"></div>
            <div onClick={() => setCurrentScreen('about')} className="flex items-center gap-4 p-4 cursor-pointer active:bg-gray-50">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="text-blue-600 text-xl">ℹ️</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">About PetMatch</div>
                <div className="text-xs text-gray-500">App version and information</div>
              </div>
              <span className="text-gray-300 flex-shrink-0">›</span>
            </div>
            <div className="border-t border-gray-100"></div>
            <div onClick={() => setCurrentScreen('language')} className="flex items-center gap-4 p-4 cursor-pointer active:bg-gray-50">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="text-green-600 text-xl">🌐</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">Language</div>
                <div className="text-xs text-gray-500">Choose your language</div>
              </div>
              <span className="text-gray-300 flex-shrink-0">English ›</span>
            </div>
            <div className="border-t border-gray-100"></div>
            <div onClick={() => setCurrentScreen('themeScreen')} className="flex items-center gap-4 p-4 cursor-pointer active:bg-gray-50">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="text-indigo-600 text-xl">🎨</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">Theme</div>
                <div className="text-xs text-gray-500">Light or Dark mode</div>
              </div>
              <span className="text-gray-300 flex-shrink-0">{theme === 'light' ? 'Light' : 'Dark'} ›</span>
            </div>
          </div>
        </div>

        <div className="mt-6 mb-6">
          <button onClick={handleLogout} className="w-full bg-white rounded-2xl p-4 flex items-center justify-center gap-2 shadow-sm active:bg-gray-50 border border-gray-100">
            <div className="text-red-600 font-semibold">Log Out</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function PremiumPage({ onNavigate }) {
  return (
    <div className="h-full bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 flex flex-col">
      <div className="p-6 flex items-center justify-between text-white">
        <button onClick={() => onNavigate('settings')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
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
          <button onClick={() => onNavigate('settings')} className="w-full text-white text-center py-3 font-semibold hover:opacity-80">
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
        <button onClick={() => onNavigate('settings')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
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
            <p className="text-gray-600">Go to Settings {'>'} Preferences to adjust discovery settings like distance and pet types.</p>
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
        <button onClick={() => onNavigate('settings')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
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
            <p>© 2026 PetMatch Inc.</p>
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
        <button onClick={() => onNavigate('settings')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
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
        <button onClick={() => setCurrentScreen('settings')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
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
