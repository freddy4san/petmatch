import { ArrowLeft, Heart, Star, X } from 'lucide-react';

export default function DiscoveryPage({ app }) {
  const { currentPet, currentPetIndex, handleSwipe, matches, petProfiles, setCurrentScreen } = app;

  if (!currentPet) {
    return null;
  }

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
        <div className={`bg-gradient-to-br ${currentPet.color} rounded-3xl h-96 relative shadow-xl overflow-hidden`}>
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-semibold">{currentPet.distance}</div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
            <h2 className="text-2xl font-bold mb-2">{currentPet.name}, {currentPet.age}</h2>
            <p className="text-gray-600 text-sm mb-1">{currentPet.emoji} {currentPet.breed}</p>
            <p className="text-gray-600 text-sm">📍 {currentPet.location}</p>
          </div>
          <img src={currentPet.image} alt={currentPet.name} className="absolute bottom-30 left-1/2 transform -translate-x-1/2 w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg" />
        </div>
        <div className="text-center my-4 text-sm text-gray-600">Pet {currentPetIndex + 1} of {petProfiles.length}</div>
        <div className="flex justify-center gap-6 mt-8">
          <button onClick={() => handleSwipe(false)} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-500 text-red-500 hover:bg-red-50 transition-all">
            <X size={32} />
          </button>
          <button onClick={() => handleSwipe(true)} className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl text-white hover:shadow-2xl transform hover:scale-105 transition-all">
            <Heart size={36} />
          </button>
          <button onClick={() => handleSwipe(true)} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-green-500 text-green-500 hover:bg-green-50 transition-all">
            <Star size={32} />
          </button>
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => setCurrentScreen('matches')} className="text-purple-600 font-semibold text-sm hover:underline">View Matches ({matches.length})</button>
        </div>
      </div>
    </div>
  );
}
