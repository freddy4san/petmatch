import { ArrowLeft, Heart, Star, X } from 'lucide-react';

export default function DiscoveryPage({ app }) {
  const {
    activeUserPet,
    currentPet,
    discoveryError,
    discoveryPets,
    handleSwipe,
    interactionError,
    isDiscoveryLoading,
    isInteracting,
    isPetsLoading,
    matches,
    setCurrentScreen
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
            <div className="bg-white rounded-3xl h-96 relative shadow-xl overflow-hidden">
              {currentPet.image ? (
                <img src={currentPet.image} alt={currentPet.name} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-7xl">
                  {currentPet.emoji}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl p-6">
                <h2 className="text-2xl font-bold mb-2">{currentPet.name}, {currentPet.age}</h2>
                <p className="text-gray-600 text-sm mb-1">{currentPet.emoji} {currentPet.breed}</p>
                <p className="text-gray-500 text-sm">{currentPet.type}</p>
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
    </div>
  );
}
