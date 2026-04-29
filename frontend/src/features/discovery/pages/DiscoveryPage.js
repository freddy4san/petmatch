import { ArrowLeft, Heart, Sparkles, Star, X } from 'lucide-react';

export default function DiscoveryPage({ app }) {
  const {
    activeUserPet,
    authSession,
    currentPet,
    discoveryError,
    discoveryPets,
    handleSwipe,
    interactionError,
    isDiscoveryLoading,
    isInteracting,
    matchCelebration,
    isPetsLoading,
    matches,
    selectActiveUserPet,
    setCurrentScreen,
    dismissMatchCelebration,
    viewCelebratedMatch,
    userPets = []
  } = app;

  return (
    <div className="bg-gray-50 flex flex-col pb-16">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Discover Pets</h1>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 p-6">
        {isPetsLoading && !activeUserPet ? (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm text-sm text-gray-500">
            Loading your pets...
          </div>
        ) : null}
        {!isPetsLoading && !activeUserPet ? (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
            <p className="text-gray-600 font-semibold mb-2">Add your pet first</p>
            <p className="text-gray-500 text-sm mb-5">Discovery starts after you create a pet profile.</p>
            <button onClick={() => setCurrentScreen('profile')} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg">
              Go to Profile
            </button>
          </div>
        ) : null}
        {activeUserPet && userPets.length > 1 ? (
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="active-discovery-pet">
              Discovering as
            </label>
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-purple-50 p-3">
              <PetAvatar pet={activeUserPet} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-gray-900">{activeUserPet.name}</div>
                <div className="truncate text-xs text-gray-500">{getPetSelectorDetails(activeUserPet, authSession)}</div>
              </div>
            </div>
            <select
              id="active-discovery-pet"
              value={activeUserPet.id}
              onChange={(event) => selectActiveUserPet(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-purple-500"
            >
              {userPets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} · {pet.breed}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {activeUserPet && isDiscoveryLoading && !currentPet ? (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm text-sm text-gray-500">
            Loading pets...
          </div>
        ) : null}
        {activeUserPet && !isDiscoveryLoading && !currentPet ? (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
            <p className="text-gray-600 font-semibold mb-2">No pets to show</p>
            <p className="text-gray-500 text-sm">Check back after more pets join PetMatch.</p>
          </div>
        ) : null}
        {discoveryError ? (
          <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{discoveryError}</p>
        ) : null}
        {interactionError ? (
          <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{interactionError}</p>
        ) : null}
        {activeUserPet && currentPet ? (
          <>
            <div className="bg-white rounded-3xl h-[32rem] relative shadow-xl overflow-hidden">
              {currentPet.image ? (
                <img src={currentPet.image} alt={currentPet.name} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-7xl">
                  {currentPet.emoji}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl p-6">
                <h2 className="text-2xl font-bold mb-2">{currentPet.name}, {currentPet.age}</h2>
                <p className="text-gray-600 text-sm mb-1">{currentPet.emoji} {getPetHeadline(currentPet)}</p>
                {getEffectivePetLocation(currentPet, authSession) ? (
                  <p className="text-gray-500 text-sm">📍 {getEffectivePetLocation(currentPet, authSession)}</p>
                ) : null}
                {currentPet.bio ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-5 text-gray-600">{currentPet.bio}</p>
                ) : null}
                {currentPet.owner?.fullName ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-purple-600">
                    With {currentPet.owner.fullName}
                  </p>
                ) : null}
                {currentPet.temperament?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {currentPet.temperament.slice(0, 4).map((trait) => (
                      <span key={trait} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                        {trait}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="text-center my-4 text-sm text-gray-600">{discoveryPets.length} pets ready</div>
            <div className="flex justify-center gap-6 mt-8">
              <button disabled={isInteracting} onClick={() => handleSwipe(false)} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-500 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
                <X size={32} />
              </button>
              <button disabled={isInteracting} onClick={() => handleSwipe(true)} className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl text-white hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50">
                <Heart size={36} />
              </button>
              <button disabled={isInteracting} onClick={() => handleSwipe(true)} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-green-500 text-green-500 hover:bg-green-50 transition-all disabled:opacity-50">
                <Star size={32} />
              </button>
            </div>
          </>
        ) : null}
        <div className="mt-6 text-center">
          <button onClick={() => setCurrentScreen('matches')} className="text-purple-600 font-semibold text-sm hover:underline">View Matches ({matches.length})</button>
        </div>
      </div>
      {matchCelebration ? (
        <MatchCelebration
          celebration={matchCelebration}
          onClose={dismissMatchCelebration}
          onViewMatches={viewCelebratedMatch}
        />
      ) : null}
    </div>
  );
}

function PetAvatar({ pet }) {
  return (
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-2xl shadow-sm ring-2 ring-purple-100">
      {pet.imageUrl ? (
        <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" />
      ) : (
        <span>{pet.emoji}</span>
      )}
    </div>
  );
}

function getPetSelectorDetails(pet, authSession) {
  return [pet.breed, pet.type, getEffectivePetLocation(pet, authSession)].filter(Boolean).join(' · ') || 'Pet profile';
}

function getEffectivePetLocation(pet, authSession) {
  return pet.city
    || pet.location
    || pet.owner?.city
    || pet.owner?.location
    || authSession?.user?.city
    || authSession?.user?.location
    || '';
}

function getPetHeadline(pet) {
  return [
    pet.breed,
    pet.type,
    formatEnumLabel(pet.gender),
    formatEnumLabel(pet.size)
  ].filter(Boolean).join(' · ');
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

function MatchCelebration({ celebration, onClose, onViewMatches }) {
  const petName = celebration?.matchedPet?.name || 'your new match';
  const userPetName = celebration?.userPet?.name || 'your pet';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-purple-950/70 p-6 text-white">
      <div className="absolute inset-0 animate-pulse bg-white/20" />
      <div className="absolute left-8 top-16 h-24 w-24 animate-ping rounded-full bg-pink-300/30" />
      <div className="absolute bottom-20 right-10 h-28 w-28 animate-ping rounded-full bg-indigo-300/30 [animation-delay:200ms]" />
      <div className="absolute inset-x-0 top-1/3 mx-auto h-40 w-40 animate-ping rounded-full bg-white/10 [animation-delay:400ms]" />

      <div className="relative w-full max-w-sm rounded-3xl bg-white px-6 py-8 text-center text-gray-900 shadow-2xl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg">
          <Heart className="fill-current" size={38} />
        </div>
        <div className="mb-3 flex items-center justify-center gap-2 text-purple-600">
          <Sparkles size={18} />
          <span className="text-sm font-bold uppercase tracking-wide">It is a match</span>
          <Sparkles size={18} />
        </div>
        <h2 className="text-3xl font-black text-gray-950">You and {petName} connected!</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {userPetName} just found someone special. Start a chat while the moment is fresh.
        </p>
        <div className="mt-7 space-y-3">
          <button
            type="button"
            onClick={onViewMatches}
            className="w-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
          >
            View match
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-gray-200 bg-white py-4 font-semibold text-purple-600 transition-colors hover:bg-purple-50"
          >
            Keep discovering
          </button>
        </div>
      </div>
    </div>
  );
}
