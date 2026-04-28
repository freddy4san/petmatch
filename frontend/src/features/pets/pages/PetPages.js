import { useState } from 'react';
import { ArrowLeft, ImagePlus, Trash2 } from 'lucide-react';

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
    <div className="min-h-[100dvh] bg-gray-50 md:flex md:items-center md:justify-center md:p-6">
      <div className="min-h-[100dvh] w-full bg-white md:min-h-0 md:max-w-lg md:rounded-3xl md:shadow-xl">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-8 pb-8 pt-14 text-white relative md:rounded-t-3xl md:p-8">
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
  const [petPendingDelete, setPetPendingDelete] = useState(null);
  const {
    authSession,
    likedPets,
    matches,
    isPetsLoading,
    petsError,
    removePet,
    setCurrentScreen,
    startEditingPet,
    userPets,
    addPet
  } = app;
  const displayName = getDisplayName(authSession);
  const firstName = getFirstName(displayName);
  const closeDeleteModal = () => setPetPendingDelete(null);
  const confirmDeletePet = async () => {
    if (!petPendingDelete) {
      return;
    }

    await removePet(petPendingDelete);
    setPetPendingDelete(null);
  };

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
              <div key={pet.id} className="min-w-28 flex-shrink-0 relative pt-2 pr-2">
                <div onClick={() => startEditingPet(pet)} className="bg-gray-100 rounded-2xl p-4 text-center hover:bg-gray-200 transition-colors cursor-pointer">
                  {pet.imageUrl ? (
                    <img src={pet.imageUrl} alt={pet.name} className="mx-auto mb-2 h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="text-4xl mb-2">{pet.emoji}</div>
                  )}
                  <div className="font-semibold text-sm text-gray-900">{pet.name}</div>
                  <div className="text-xs text-gray-500">{pet.breed}</div>
                </div>
                <button onClick={() => setPetPendingDelete(pet)} className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs shadow-sm hover:bg-red-600 transition-colors">
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">About Me</h3>
            <button onClick={() => alert('Edit profile details coming soon.')} className="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-200 transition-colors">
              Edit
            </button>
          </div>
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

      </div>

      {petPendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
              🐾
            </div>
            <h3 className="text-center text-lg font-bold text-gray-900">Delete {petPendingDelete.name}?</h3>
            <p className="mt-2 text-center text-sm text-gray-600">
              This will remove your pet profile from the app. This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={closeDeleteModal} className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={confirmDeletePet} className="flex-1 rounded-full bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
  const imagePreviewUrl = pet.imagePreviewUrl || pet.imageUrl;
  const imageInputId = `pet-image-${pet.id || 'draft'}`;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Photo</label>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 text-4xl">
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} alt={pet.name || 'Pet preview'} className="h-full w-full object-cover" />
            ) : (
              <span>{getPetEmoji(pet.type)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <input
              id={imageInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  updateEditingPet('imageFile', file);
                }

                event.target.value = '';
              }}
            />
            <div className="flex flex-wrap gap-2">
              <label htmlFor={imageInputId} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-200">
                <ImagePlus size={16} />
                {imagePreviewUrl ? 'Replace' : 'Upload'}
              </label>
              {imagePreviewUrl ? (
                <button type="button" onClick={() => updateEditingPet('removeImage')} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100">
                  <Trash2 size={16} />
                  Remove
                </button>
              ) : null}
            </div>
            {pet.imageFile ? (
              <p className="mt-2 truncate text-xs text-gray-500">{pet.imageFile.name}</p>
            ) : null}
          </div>
        </div>
      </div>
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
