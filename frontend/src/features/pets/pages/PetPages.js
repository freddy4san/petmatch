import { ArrowLeft, Bell, Settings } from 'lucide-react';

const PET_TYPE_OPTIONS = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Raccoon', 'Other'];

export function PetSetupPage({ app, onNavigate }) {
  const {
    editingPet,
    isSavingPet,
    petFormError,
    saveEditingPet,
    updateEditingPet
  } = app;

  return (
    <div className="h-full bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-3xl p-8 text-white relative">
          <button onClick={() => onNavigate('signup')} className="absolute left-4 top-4 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-center">Add Your Pet</h2>
          <p className="text-center text-sm mt-2 opacity-90">Tell us about your furry friend</p>
        </div>
        <div className="p-8">
          <PetFormFields pet={editingPet} updateEditingPet={updateEditingPet} />
          <PetFormErrorMessage message={petFormError} />
          <button onClick={saveEditingPet} disabled={isSavingPet} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-70">
            {isSavingPet ? 'Saving Pet...' : 'Continue to App'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage({ app }) {
  const {
    authSession,
    handleLogout,
    likedPets,
    matches,
    notificationsEnabled,
    isPetsLoading,
    petsError,
    removePet,
    setCurrentScreen,
    setNotificationsEnabled,
    startEditingPet,
    theme,
    userPets,
    addPet
  } = app;
  const displayName = getDisplayName(authSession);
  const firstName = getFirstName(displayName);

  return (
    <div className="bg-gray-50 flex flex-col pb-4">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 pb-8 relative">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">My Profile</h1>
          <div className="bg-green-500 px-3 py-1.5 rounded-full text-xs font-bold">Active</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <img src="https://picsum.photos/150/150" alt={displayName} className="w-16 h-16 bg-white rounded-full overflow-hidden border-2 border-white object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{displayName}</h2>
            <p className="text-sm opacity-90">📍 Melbourne, VIC</p>
            <div className="flex gap-6 mt-2">
              <div><span className="font-bold text-lg">{matches.length}</span> <span className="text-xs opacity-90">Matches</span></div>
              <div><span className="font-bold text-lg">{likedPets.length}</span> <span className="text-xs opacity-90">Likes</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">My pets</h3>
          {petsError ? (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{petsError}</p>
          ) : null}
          {isPetsLoading ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
              Loading your pets...
            </div>
          ) : null}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {userPets.map((pet) => (
              <div key={pet.id} className="min-w-28 flex-shrink-0 relative">
                <div onClick={() => startEditingPet(pet)} className="bg-gray-100 rounded-2xl p-4 text-center hover:bg-gray-200 transition-colors cursor-pointer">
                  <div className="text-4xl mb-2">{pet.emoji}</div>
                  <div className="font-semibold text-sm text-gray-900">{pet.name}</div>
                  <div className="text-xs text-gray-500">{pet.breed}</div>
                </div>
                <button onClick={() => removePet(pet.id)} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors">
                  ×
                </button>
              </div>
            ))}
            <div onClick={addPet} className="min-w-28 flex-shrink-0 cursor-pointer">
              <div className="bg-purple-100 rounded-2xl p-4 text-center hover:bg-purple-200 transition-colors border-2 border-dashed border-purple-300">
                <div className="text-4xl mb-2 text-purple-600">+</div>
                <div className="font-semibold text-sm text-purple-600">Add Pet</div>
                <div className="text-xs text-purple-500">New friend</div>
              </div>
            </div>
          </div>
          {!isPetsLoading && userPets.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No pets added yet. Tap Add Pet to create your first profile.</p>
          ) : null}
        </div>

        <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">About Me</h3>
          <p className="text-gray-600 leading-relaxed">Hi! I'm {firstName}, a passionate pet lover from Melbourne. I have two wonderful pets - Rocky the raccoon and Martin the Maine Coon. I love finding playmates for them and connecting with other pet owners. Let's arrange some fun playdates! 🐾</p>
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">Dog Walking</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Cat Care</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Pet Training</span>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">Playdates</span>
            </div>
          </div>
        </div>

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
            <div className="border-t border-gray-100"></div>
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

function getFirstName(displayName) {
  return displayName.split(' ')[0] || displayName;
}

export function EditPetPage({ app }) {
  const {
    editingPet,
    isEditingExistingPet,
    isSavingPet,
    petFormError,
    saveEditingPet,
    setCurrentScreen,
    updateEditingPet
  } = app;

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{isEditingExistingPet ? 'Edit Pet' : 'Add Pet'}</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6">
        {editingPet ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">{getPetEmoji(editingPet.type)}</div>
              <h2 className="text-xl font-bold">{editingPet.name || 'Your Pet'}</h2>
            </div>
            <PetFormFields pet={editingPet} updateEditingPet={updateEditingPet} />
            <PetFormErrorMessage message={petFormError} />
            <button onClick={saveEditingPet} disabled={isSavingPet} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-70">
              {isSavingPet ? 'Saving Pet...' : 'Save Changes'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PetFormFields({ pet, updateEditingPet }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name</label>
        <input type="text" value={pet.name} onChange={(event) => updateEditingPet('name', event.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter pet name" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Type</label>
        <select value={pet.type} onChange={(event) => updateEditingPet('type', event.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none">
          {PET_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
        <input type="text" value={pet.breed} onChange={(event) => updateEditingPet('breed', event.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter breed" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
        <input type="number" min="0" value={pet.age} onChange={(event) => updateEditingPet('age', event.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter age" />
      </div>
    </div>
  );
}

function PetFormErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{message}</p>;
}

function getPetEmoji(type) {
  switch (type) {
    case 'Bird':
      return '🦜';
    case 'Cat':
      return '🐱';
    case 'Dog':
      return '🐕';
    case 'Rabbit':
      return '🐇';
    case 'Raccoon':
      return '🦝';
    default:
      return '🐾';
  }
}
