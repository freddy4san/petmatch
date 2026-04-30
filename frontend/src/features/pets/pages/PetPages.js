import { useState } from 'react';
import { ArrowLeft, ImagePlus, Trash2 } from 'lucide-react';

const PET_TYPE_OPTIONS = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Reptile', 'Raccoon', 'Other'];
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
const PET_GENDER_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'MALE', label: 'Male' },
  { value: 'UNKNOWN', label: 'Unknown' }
];
const PET_SIZE_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'SMALL', label: 'Small' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LARGE', label: 'Large' },
  { value: 'EXTRA_LARGE', label: 'Extra large' }
];
const TEMPERAMENT_OPTIONS = [
  'Friendly',
  'Playful',
  'Calm',
  'Gentle',
  'Energetic',
  'Curious',
  'Social',
  'Independent',
  'Affectionate',
  'Patient'
];

export function PetSetupPage({ app, onNavigate }) {
  const {
    editingPet,
    isSavingPet,
    petFormError,
    saveEditingPet,
    skipPetSetup,
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
          <button
            type="button"
            onClick={skipPetSetup}
            disabled={isSavingPet}
            className="mt-3 w-full rounded-full border border-gray-200 bg-white py-4 font-semibold text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-50 disabled:opacity-70"
          >
            Add pet later
          </button>
          <p className="mt-3 text-center text-xs text-gray-500">
            You can add your pet anytime from your profile.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage({ app }) {
  const [petPendingDelete, setPetPendingDelete] = useState(null);
  const [isEditingProfileDetails, setIsEditingProfileDetails] = useState(false);
  const [profileDetailsDraft, setProfileDetailsDraft] = useState({
    bio: '',
    city: '',
    fullName: ''
  });
  const [profileLocationDraft, setProfileLocationDraft] = useState('');
  const {
    authSession,
    clearProfileDetailsError = () => {},
    likedPets,
    matches,
    isPetsLoading,
    isSavingProfileDetails,
    isSavingProfileLocation,
    petsError,
    profileDetailsError,
    profileLocationError,
    removePet,
    saveProfileDetails = async () => false,
    saveProfileLocation,
    setCurrentScreen,
    startEditingPet,
    userPets,
    addPet
  } = app;
  const displayName = getDisplayName(authSession);
  const firstName = getFirstName(displayName);
  const profileLocation = getProfileLocation(authSession, userPets);
  const profileBio = getProfileBio(authSession, firstName, userPets);
  const hasOwnerLocation = Boolean(getOwnerLocation(authSession));
  const suggestedLocation = getSuggestedProfileLocation(authSession, userPets);
  const closeDeleteModal = () => setPetPendingDelete(null);
  const confirmDeletePet = async () => {
    if (!petPendingDelete) {
      return;
    }

    await removePet(petPendingDelete);
    setPetPendingDelete(null);
  };
  const openProfileDetailsEditor = () => {
    clearProfileDetailsError();
    setProfileDetailsDraft({
      bio: authSession?.user?.bio || profileBio,
      city: getOwnerLocation(authSession) || suggestedLocation,
      fullName: authSession?.user?.fullName || displayName
    });
    setIsEditingProfileDetails(true);
  };
  const closeProfileDetailsEditor = () => setIsEditingProfileDetails(false);
  const updateProfileDetailsDraft = (field, value) => {
    clearProfileDetailsError();
    setProfileDetailsDraft((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const submitProfileDetails = async (event) => {
    event.preventDefault();

    const saved = await saveProfileDetails(profileDetailsDraft);

    if (saved) {
      setIsEditingProfileDetails(false);
    }
  };
  const submitProfileLocation = async (event) => {
    event.preventDefault();

    const saved = await saveProfileLocation(profileLocationDraft || suggestedLocation);

    if (saved) {
      setProfileLocationDraft('');
    }
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
            <p className="text-sm opacity-90">{profileLocation}</p>
            <div className="flex gap-6 mt-2">
              <div><span className="font-bold text-lg">{matches.length}</span> <span className="text-xs opacity-90">Matches</span></div>
              <div><span className="font-bold text-lg">{likedPets.length}</span> <span className="text-xs opacity-90">Likes</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {!hasOwnerLocation ? (
          <form onSubmit={submitProfileLocation} className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="font-bold text-gray-900">Set your location</h3>
            <p className="mt-1 text-sm leading-5 text-gray-500">
              This becomes the default location for your pets and helps nearby matches make sense.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="profile-location">
                City or area
              </label>
              <input
                id="profile-location"
                type="text"
                value={profileLocationDraft}
                onChange={(event) => setProfileLocationDraft(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={suggestedLocation || 'Enter your city'}
              />
            </div>
            {profileLocationError ? (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{profileLocationError}</p>
            ) : null}
            <button
              type="submit"
              disabled={isSavingProfileLocation}
              className="mt-4 w-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-70"
            >
              {isSavingProfileLocation ? 'Saving location...' : 'Save location'}
            </button>
          </form>
        ) : null}

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
          <div className="space-y-3">
            {userPets.map((pet) => (
              <div key={pet.id} className="relative pr-2 pt-2">
                <div onClick={() => startEditingPet(pet)} className="flex cursor-pointer gap-4 rounded-2xl bg-gray-100 p-4 pr-8 text-left transition-colors hover:bg-gray-200">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-4xl">
                    {pet.imageUrl ? (
                      <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{pet.emoji}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900">{pet.name}</div>
                    <div className="mt-0.5 text-sm text-gray-500">{pet.breed}</div>
                    <div className="mt-1 text-xs text-gray-500">{getCompactPetDetails(pet, authSession)}</div>
                    {pet.bio ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-600">{pet.bio}</p>
                    ) : null}
                    {pet.temperament?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pet.temperament.slice(0, 3).map((trait) => (
                          <span key={trait} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                            {trait}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <button onClick={() => setPetPendingDelete(pet)} className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs shadow-sm hover:bg-red-600 transition-colors">
                  ×
                </button>
              </div>
            ))}
            <div onClick={addPet} className="cursor-pointer">
              <div className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-100 p-4 text-left transition-colors hover:bg-purple-200">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-4xl text-purple-600">+</div>
                <div>
                  <div className="font-semibold text-purple-600">Add Pet</div>
                  <div className="text-sm text-purple-500">Create another pet profile</div>
                </div>
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
            <button onClick={openProfileDetailsEditor} className="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-200 transition-colors">
              Edit
            </button>
          </div>
          <p className="text-gray-600 leading-relaxed">{profileBio}</p>
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Profile basics</h4>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">{profileLocation}</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{userPets.length} pet{userPets.length === 1 ? '' : 's'}</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{getPetTypeSummary(userPets)}</span>
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

      {isEditingProfileDetails ? (
        <ProfileDetailsModal
          draft={profileDetailsDraft}
          error={profileDetailsError}
          isSaving={isSavingProfileDetails}
          onChange={updateProfileDetailsDraft}
          onClose={closeProfileDetailsEditor}
          onSubmit={submitProfileDetails}
        />
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

function getProfileLocation(authSession, userPets) {
  const city = getOwnerLocation(authSession) || getSuggestedProfileLocation(authSession, userPets);

  return city ? `📍 ${city}` : '📍 Location not set';
}

function getOwnerLocation(authSession) {
  return authSession?.user?.city || authSession?.user?.location || '';
}

function getSuggestedProfileLocation(authSession, userPets) {
  const petWithLocation = userPets.find((pet) => pet.city || pet.location);

  return getOwnerLocation(authSession) || petWithLocation?.city || petWithLocation?.location || '';
}

function getProfileBio(authSession, firstName, userPets) {
  const bio = authSession?.user?.bio?.trim();

  if (bio) {
    return bio;
  }

  if (userPets.length === 0) {
    return `Hi! I'm ${firstName}, a pet lover getting ready to meet compatible friends on PetMatch.`;
  }

  const petNames = userPets.map((pet) => pet.name).filter(Boolean);
  const petList = petNames.length > 0 ? petNames.join(', ') : 'my pets';

  return `Hi! I'm ${firstName}. I use PetMatch to find thoughtful playdates and good matches for ${petList}.`;
}

function getPetTypeSummary(userPets) {
  const petTypes = Array.from(new Set(userPets.map((pet) => pet.type).filter(Boolean)));

  return petTypes.length > 0 ? petTypes.join(' + ') : 'Pet lover';
}

function getCompactPetDetails(pet, authSession) {
  return [formatEnumLabel(pet.gender), formatEnumLabel(pet.size), getEffectivePetLocation(pet, authSession)]
    .filter(Boolean)
    .join(' · ') || pet.type;
}

function getEffectivePetLocation(pet, authSession) {
  return pet.city || pet.location || getOwnerLocation(authSession);
}

function ProfileDetailsModal({ draft, error, isSaving, onChange, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Edit profile</h3>
            <p className="mt-1 text-sm text-gray-500">These details appear on your owner profile.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            aria-label="Close profile editor"
          >
            ×
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="profile-full-name">Name</label>
            <input
              id="profile-full-name"
              type="text"
              value={draft.fullName}
              onChange={(event) => onChange('fullName', event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="profile-city">Location</label>
            <input
              id="profile-city"
              type="text"
              value={draft.city}
              onChange={(event) => onChange('city', event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="City or area"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="profile-bio">About me</label>
            <textarea
              id="profile-bio"
              value={draft.bio}
              onChange={(event) => onChange('bio', event.target.value)}
              rows={5}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Share a little about you and your pets"
            />
            <div className="mt-1 text-right text-xs text-gray-400">{draft.bio.length}/500</div>
          </div>
        </div>
        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
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
        <input type="text" list="pet-breed-options" value={pet.breed} onChange={(event) => updateEditingPet('breed', event.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter breed" />
        <datalist id="pet-breed-options">
          {getBreedOptions(pet.type).map((breed) => (
            <option key={breed} value={breed} />
          ))}
        </datalist>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
        <input type="number" min="0" value={pet.age} onChange={(event) => updateEditingPet('age', event.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter age" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
          <select value={pet.gender} onChange={(event) => updateEditingPet('gender', event.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none">
            {PET_GENDER_OPTIONS.map((option) => (
              <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
          <select value={pet.size} onChange={(event) => updateEditingPet('size', event.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none">
            {PET_SIZE_OPTIONS.map((option) => (
              <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
        <textarea value={pet.bio} onChange={(event) => updateEditingPet('bio', event.target.value)} rows={4} maxLength={500} className="w-full resize-none px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Share what makes your pet a good match" />
        <div className="mt-1 flex items-center justify-between gap-3 text-xs text-gray-400">
          <span>{pet.isBioCustomized ? 'Custom bio' : 'Auto-generated until you edit it'}</span>
          <span>{pet.bio.length}/500</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Temperament</label>
        <div className="flex flex-wrap gap-2">
          {TEMPERAMENT_OPTIONS.map((trait) => {
            const isSelected = pet.temperament.includes(trait);

            return (
              <button
                key={trait}
                type="button"
                onClick={() => updateEditingPet('temperament', trait)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${isSelected ? 'border-purple-500 bg-purple-100 text-purple-700' : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50'}`}
              >
                {trait}
              </button>
            );
          })}
        </div>
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
    case 'Reptile':
      return '🦎';
    default:
      return '🐾';
  }
}

function getBreedOptions(type) {
  return BREED_OPTIONS_BY_TYPE[type] || ALL_BREED_OPTIONS;
}

function formatEnumLabel(value) {
  if (!value) {
    return '';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
