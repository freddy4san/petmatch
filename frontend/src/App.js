import { ArrowLeft, Bell, ChevronLeft, Heart, Send, Settings, Star, X } from 'lucide-react';
import { useState } from 'react';

export default function PetMatchApp() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [matches, setMatches] = useState([]);
  const [likedPets, setLikedPets] = useState([]);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [currentChatPet, setCurrentChatPet] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [maxDistance, setMaxDistance] = useState(25);
  const [theme, setTheme] = useState('light');
  const [userPets, setUserPets] = useState([
    { name: 'Rocky', type: 'Raccoon', breed: 'Raccoon', age: 2, emoji: '🦝' },
    { name: 'Martin', type: 'Cat', breed: 'Maine Coon', age: 3, emoji: '🦊' }
  ]);
  const [editingPet, setEditingPet] = useState(null);

  const petProfiles = [
    { name: 'Nala', age: 3, breed: 'Maine Coon', location: 'South Yarra, VIC', distance: '1.8km', emoji: '😺', color: 'from-orange-400 to-orange-500', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop' },
    { name: 'Max', age: 2, breed: 'Golden Retriever', location: 'Richmond, VIC', distance: '2.3km', emoji: '🐕', color: 'from-yellow-400 to-amber-500', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop' },
    { name: 'Bella', age: 1, breed: 'Persian', location: 'Melbourne CBD', distance: '3.1km', emoji: '🐱', color: 'from-pink-400 to-rose-500', image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=300&h=300&fit=crop' },
    { name: 'Charlie', age: 4, breed: 'Labrador', location: 'St Kilda, VIC', distance: '1.5km', emoji: '🦮', color: 'from-blue-400 to-indigo-500', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop' },
    { name: 'Milo', age: 2, breed: 'Beagle', location: 'Fitzroy, VIC', distance: '2.8km', emoji: '🐶', color: 'from-green-400 to-emerald-500', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop' },
    { name: 'Tweety', age: 1, breed: 'Parrot', location: 'Brisbane, QLD', distance: '4.2km', emoji: '🦜', color: 'from-green-400 to-emerald-500', image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=300&h=300&fit=crop' },
    { name: 'Bandit', age: 2, breed: 'Raccoon', location: 'Perth, WA', distance: '5.1km', emoji: '🦝', color: 'from-gray-400 to-gray-500', image: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=300&h=300&fit=crop' },
    { name: 'Spike', age: 3, breed: 'Bearded Dragon', location: 'Adelaide, SA', distance: '3.8km', emoji: '🦎', color: 'from-yellow-400 to-orange-500', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop' }
  ];

  const handleSwipe = (liked) => {
    const currentPet = petProfiles[currentPetIndex];
    if (liked) {
      setMatches([...matches, currentPet]);
      setLikedPets([...likedPets, currentPet]);
      if (!chatMessages[currentPet.name]) {
        setChatMessages({
          ...chatMessages,
          [currentPet.name]: [
            { text: `Hi! I saw ${currentPet.name}'s profile and our pets would be great playmates!`, time: "10:30 AM", sent: false }
          ]
        });
      }
    }
    setCurrentPetIndex(currentPetIndex < petProfiles.length - 1 ? currentPetIndex + 1 : 0);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && currentChatPet) {
      const newMsg = { text: newMessage, time: "Just now", sent: true };
      setChatMessages({
        ...chatMessages,
        [currentChatPet.name]: [...(chatMessages[currentChatPet.name] || []), newMsg]
      });
      setNewMessage('');

      // Auto-response after 2 seconds
      setTimeout(() => {
        const responses = [
          "That sounds great! My pet would love to meet yours.",
          "Awesome! Let's arrange a playdate soon.",
          "Perfect! What day works best for you?",
          "My pet is so excited to make new friends!",
          "Great idea! How about this weekend?"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseMsg = { text: randomResponse, time: "Just now", sent: false };
        setChatMessages(prev => ({
          ...prev,
          [currentChatPet.name]: [...(prev[currentChatPet.name] || []), responseMsg]
        }));
      }, 2000);
    }
  };

  const handleLogout = () => {
    setMatches([]);
    setLikedPets([]);
    setCurrentPetIndex(0);
    setChatMessages({});
    setCurrentChatPet(null);
    setCurrentScreen('welcome');
  };

  const getActiveNav = (screen) => {
    const navScreens = ['home', 'discovery', 'matches', 'profile'];
    return navScreens.includes(screen) ? screen : '';
  };

  const BottomNav = ({ active }) => (
    <div className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 border-t border-purple-300 flex justify-around items-center py-2 px-1 rounded-t-2xl">
      <button onClick={() => setCurrentScreen('home')} className="flex flex-col items-center gap-1">
        <div className={`rounded-xl p-1.5 ${active === 'home' ? 'bg-white' : ''}`}>
          <span className="text-xl">🏠</span>
        </div>
        <span className={`text-xs font-semibold ${active === 'home' ? 'text-white' : 'text-white opacity-70'}`}>Home</span>
      </button>
      <button onClick={() => setCurrentScreen('discovery')} className="flex flex-col items-center gap-1">
        <div className={`rounded-xl p-1.5 ${active === 'discovery' ? 'bg-white' : ''}`}>
          <span className="text-xl">🐾</span>
        </div>
        <span className={`text-xs font-semibold ${active === 'discovery' ? 'text-white' : 'text-white opacity-70'}`}>Discover</span>
      </button>
      <button onClick={() => setCurrentScreen('matches')} className="flex flex-col items-center gap-1 relative">
        <div className={`rounded-xl p-1.5 ${active === 'matches' ? 'bg-white' : ''}`}>
          <span className="text-xl">💬</span>
          {matches.length > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{matches.length}</div>
          )}
        </div>
        <span className={`text-xs font-semibold ${active === 'matches' ? 'text-white' : 'text-white opacity-70'}`}>Chats</span>
      </button>
      <button onClick={() => setCurrentScreen('profile')} className="flex flex-col items-center gap-1">
        <div className={`rounded-xl p-1.5 ${active === 'profile' ? 'bg-white' : ''}`}>
          <span className="text-xl">👤</span>
        </div>
        <span className={`text-xs font-semibold ${active === 'profile' ? 'text-white' : 'text-white opacity-70'}`}>Profile</span>
      </button>
    </div>
  );

  const screens = {
    welcome: (
      <div className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-start justify-center p-6 pt-12">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-6xl">🐾</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to PetMatch</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">Find perfect playmates, breeding partners, and new friends for your beloved pets in a safe, verified community.</p>
          <button onClick={() => setCurrentScreen('signup')} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-full font-semibold mb-4 hover:shadow-lg transition-all">Get Started</button>
          <button onClick={() => setCurrentScreen('login')} className="w-full border-2 border-gray-300 text-purple-600 py-4 rounded-full font-semibold hover:border-purple-600 transition-all">I Have an Account</button>
        </div>
      </div>
    ),

    login: (
      <div className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-3xl p-8 text-white relative">
            <button onClick={() => setCurrentScreen('welcome')} className="absolute left-4 top-4 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
              <ArrowLeft size={20} />
            </button>
            <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🐾</span>
            </div>
            <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
          </div>
          <div className="p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="Enter your email" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="Enter password" />
            </div>
            <button onClick={() => setCurrentScreen('home')} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-full font-semibold mb-4 hover:shadow-lg transition-all">Sign In</button>
            <p className="text-center text-sm text-gray-600">Don't have an account? <span onClick={() => setCurrentScreen('signup')} className="text-purple-600 font-semibold cursor-pointer hover:underline">Sign Up</span></p>
          </div>
        </div>
      </div>
    ),

    signup: (
      <div className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-start justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-3xl p-8 text-white relative">
            <button onClick={() => setCurrentScreen('welcome')} className="absolute left-4 top-4 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
              <ArrowLeft size={20} />
            </button>
            <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🐾</span>
            </div>
            <h2 className="text-2xl font-bold text-center">Create Account</h2>
          </div>
          <div className="p-8 max-h-96 overflow-y-auto">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter your full name" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter your email" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter phone for verification" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Create password" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Confirm password" />
            </div>
            <button onClick={() => setCurrentScreen('petSetup')} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-full font-semibold hover:shadow-lg transition-all">Create Account</button>
            <p className="text-center text-sm text-gray-600 mt-4">Already have an account? <span onClick={() => setCurrentScreen('login')} className="text-purple-600 font-semibold cursor-pointer hover:underline">Sign In</span></p>
          </div>
        </div>
      </div>
    ),

    petSetup: (
      <div className="h-full bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-3xl p-8 text-white relative">
            <button onClick={() => setCurrentScreen('signup')} className="absolute left-4 top-4 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-center">Add Your Pet</h2>
            <p className="text-center text-sm mt-2 opacity-90">Tell us about your furry friend</p>
          </div>
          <div className="p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter pet name" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Type</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none">
                <option>Dog</option>
                <option>Cat</option>
                <option>Bird</option>
                <option>Rabbit</option>
                <option>Other</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter breed" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
              <input type="number" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter age" />
            </div>
            <button onClick={() => setCurrentScreen('home')} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-full font-semibold hover:shadow-lg transition-all">Continue to App</button>
          </div>
        </div>
      </div>
    ),

    home: (
      <div className="bg-gray-50 flex flex-col pb-4">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm opacity-90">Good Morning</p>
              <h1 className="text-2xl font-bold">Bhavana</h1>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCurrentScreen('notifications')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all relative">
                <Bell size={20} />
                {matches.length > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>}
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
              <div className="text-2xl font-bold">{matches.length * 2}</div>
              <div className="text-xs opacity-90">Messages</div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button onClick={() => setCurrentScreen('discovery')} className="bg-white rounded-2xl p-4 text-center border-2 border-gray-100 hover:border-purple-500 transition-all">
              <span className="text-3xl mb-2 block">🐾</span>
              <span className="text-xs font-semibold">Discover Pets</span>
            </button>
            <button onClick={() => setCurrentScreen('matches')} className="bg-white rounded-2xl p-4 text-center border-2 border-gray-100 hover:border-purple-500 transition-all">
              <span className="text-3xl mb-2 block">💬</span>
              <span className="text-xs font-semibold">Messages</span>
            </button>
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

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Recent Matches</h2>
            <span onClick={() => setCurrentScreen('matches')} className="text-sm text-purple-600 font-semibold cursor-pointer hover:underline">See All</span>
          </div>
          {matches.length > 0 ? (
            <div className="space-y-3">
              {matches.slice(0, 3).map((match, i) => (
                <div key={i} onClick={() => { setCurrentChatPet(match); setCurrentScreen('chat'); }} className="bg-white rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl flex-shrink-0">{match.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{match.name} & Owner</div>
                    <div className="text-xs text-gray-600 truncate">
                      {chatMessages[match.name] && chatMessages[match.name].length > 0 
                        ? chatMessages[match.name][chatMessages[match.name].length - 1].text
                        : "Great! Let's arrange a playdate soon"}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">Just now</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🐾</div>
              <p className="text-gray-600 text-sm">No matches yet. Start discovering!</p>
              <button onClick={() => setCurrentScreen('discovery')} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-purple-700">Discover Pets</button>
            </div>
          )}
        </div>
      </div>
    ),

    discovery: (
      <div className="bg-gray-50 flex flex-col pb-16">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Discover Pets</h1>
          <div className="w-10"></div>
        </div>
        <div className="flex-1 p-6">
          <div className={`bg-gradient-to-br ${petProfiles[currentPetIndex].color} rounded-3xl h-96 relative shadow-xl overflow-hidden`}>
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-semibold">{petProfiles[currentPetIndex].distance}</div>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
              <h2 className="text-2xl font-bold mb-2">{petProfiles[currentPetIndex].name}, {petProfiles[currentPetIndex].age}</h2>
              <p className="text-gray-600 text-sm mb-1">{petProfiles[currentPetIndex].emoji} {petProfiles[currentPetIndex].breed}</p>
              <p className="text-gray-600 text-sm">📍 {petProfiles[currentPetIndex].location}</p>
            </div>
            <img src={petProfiles[currentPetIndex].image} alt={petProfiles[currentPetIndex].name} className="absolute bottom-30 left-1/2 transform -translate-x-1/2 w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg" />
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
    ),

    matches: (
      <div className="bg-gray-50 flex flex-col pb-4">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Messages</h1>
          <div className="w-10"></div>
        </div>
        <div className="flex border-b border-gray-200 bg-white">
          {['All', 'Matches', 'Unread'].map((tab, i) => (
            <div key={tab} className={`flex-1 py-4 text-center font-semibold ${i === 0 ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}>{tab}</div>
          ))}
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {matches.length > 0 ? matches.map((match, i) => (
            <div key={i} onClick={() => { setCurrentChatPet(match); setCurrentScreen('chat'); }} className="bg-white rounded-2xl p-4 mb-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl">{match.emoji}</div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{match.name} & Owner</div>
                <div className="text-sm text-gray-600 truncate">
                  {chatMessages[match.name] && chatMessages[match.name].length > 0 
                    ? chatMessages[match.name][chatMessages[match.name].length - 1].text
                    : `Let's meet up at ${match.location}`}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-gray-400 mb-1">Just now</div>
                {!chatMessages[match.name] || chatMessages[match.name].length <= 1 ? (
                  <div onClick={() => alert('Marked as read!')} className="bg-green-500 text-white rounded-full px-2 py-0.5 text-xs font-bold cursor-pointer">New</div>
                ) : null}
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-600 font-semibold mb-2">No matches yet</p>
              <p className="text-gray-500 text-sm mb-4">Start swiping to find your pet's perfect match!</p>
              <button onClick={() => setCurrentScreen('discovery')} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg">Start Discovering</button>
            </div>
          )}
        </div>
      </div>
    ),

    chat: (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 flex items-center gap-3">
          <button onClick={() => setCurrentScreen('matches')} className="w-10 h-10 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center flex-shrink-0 hover:bg-opacity-30">
            <ChevronLeft size={20} />
          </button>
          <div className="w-11 h-11 bg-white bg-opacity-30 rounded-full flex items-center justify-center text-xl flex-shrink-0">{currentChatPet?.emoji || '🐕'}</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate">{currentChatPet?.name || 'Pet'} & Owner</div>
            <div className="text-xs opacity-90">Active now</div>
          </div>
          <button className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl flex-shrink-0 hover:bg-opacity-30">📞</button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="text-center text-xs text-gray-400 mb-4">Today</div>
          {currentChatPet && chatMessages[currentChatPet.name] && chatMessages[currentChatPet.name].map((msg, idx) => (
            <div key={idx} className={`mb-4 ${msg.sent ? 'text-right' : ''}`}>
              <div className={`inline-block ${msg.sent ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl rounded-br-sm' : 'bg-white rounded-2xl rounded-bl-sm'} p-3 shadow-sm max-w-xs`}>
                <p className="text-sm">{msg.text}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
            </div>
          ))}
        </div>
        <div className="bg-white border-t border-gray-200 p-4 flex items-center gap-2">
          <button className="text-purple-600 text-xl flex-shrink-0">📎</button>
          <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:ring-2 focus:ring-purple-500 outline-none" />
          <button onClick={handleSendMessage} className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:shadow-lg">
            <Send size={18} />
          </button>
        </div>
      </div>
    ),

    profile: (
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
              <img src="https://picsum.photos/150/150" alt="Bhavana" className="w-16 h-16 bg-white rounded-full overflow-hidden border-2 border-white object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">Bhavana Pandalaneni</h2>
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
            <div className="flex gap-4 overflow-x-auto pb-2">
              {userPets.map((pet, index) => (
                <div key={index} className="min-w-28 flex-shrink-0 relative">
                  <div onClick={() => { setEditingPet(pet); setCurrentScreen('editPet'); }} className="bg-gray-100 rounded-2xl p-4 text-center hover:bg-gray-200 transition-colors cursor-pointer">
                    <div className="text-4xl mb-2">{pet.emoji}</div>
                    <div className="font-semibold text-sm text-gray-900">{pet.name}</div>
                    <div className="text-xs text-gray-500">{pet.breed}</div>
                  </div>
                  <button onClick={() => setUserPets(userPets.filter((_, i) => i !== index))} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors">
                    ×
                  </button>
                </div>
              ))}
              <div onClick={() => {
                const newPet = { name: 'New Pet', type: 'Dog', breed: 'Mixed', age: 1, emoji: '🐕' };
                setUserPets([...userPets, newPet]);
                setEditingPet(newPet);
                setCurrentScreen('editPet');
              }} className="min-w-28 flex-shrink-0 cursor-pointer">
                <div className="bg-purple-100 rounded-2xl p-4 text-center hover:bg-purple-200 transition-colors border-2 border-dashed border-purple-300">
                  <div className="text-4xl mb-2 text-purple-600">+</div>
                  <div className="font-semibold text-sm text-purple-600">Add Pet</div>
                  <div className="text-xs text-purple-500">New friend</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">About Me</h3>
            <p className="text-gray-600 leading-relaxed">Hi! I'm Bhavana, a passionate pet lover from Melbourne. I have two wonderful pets - Rocky the raccoon and Martin the Maine Coon. I love finding playmates for them and connecting with other pet owners. Let's arrange some fun playdates! 🐾</p>
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
                <div onClick={(e) => { e.stopPropagation(); setNotificationsEnabled(!notificationsEnabled); }} className={`w-11 h-6 ${notificationsEnabled ? 'bg-purple-600' : 'bg-gray-300'} rounded-full relative cursor-pointer transition-colors flex-shrink-0`}>
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
    ),

    preferences: (
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
                <input type="range" min="1" max="50" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} className="w-full" />
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
                  {['Dogs', 'Cats', 'Birds', 'Rabbits', 'Reptiles', 'Fish', 'Small Mammals'].map(type => (
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
                  {['Playdates', 'Walking Partners', 'Breeding', 'Adoption', 'Training Partners', 'Grooming Buddies', 'Pet Sitting'].map(option => (
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
    ),

    notificationSettings: (
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
    ),

    privacy: (
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
    ),

    verification: (
      <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
          <button onClick={() => setCurrentScreen('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
            <ArrowLeft size={20} />
          </button>
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
    ),

    notifications: (
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
            {matches.length > 0 && (
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
            )}
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
    ),

    settings: (
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
    ),

    editPet: (
      <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
          <button onClick={() => setCurrentScreen('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Edit Pet</h1>
          <div className="w-10"></div>
        </div>
        <div className="flex-1 p-6">
          {editingPet && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">{editingPet.emoji}</div>
                <h2 className="text-xl font-bold">{editingPet.name}</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name</label>
                  <input
                    type="text"
                    defaultValue={editingPet.name}
                    onChange={(e) => setEditingPet({ ...editingPet, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Type</label>
                  <select
                    defaultValue={editingPet.type}
                    onChange={(e) => setEditingPet({ ...editingPet, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Bird</option>
                    <option>Rabbit</option>
                    <option>Raccoon</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
                  <input
                    type="text"
                    defaultValue={editingPet.breed}
                    onChange={(e) => setEditingPet({ ...editingPet, breed: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    defaultValue={editingPet.age}
                    onChange={(e) => setEditingPet({ ...editingPet, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setUserPets(userPets.map(pet => pet.name === editingPet.name ? editingPet : pet));
                  setCurrentScreen('profile');
                  setEditingPet(null);
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    ),

    premium: (
      <div className="h-full bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 flex flex-col">
        <div className="p-6 flex items-center justify-between text-white">
          <button onClick={() => setCurrentScreen('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
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
                ].map(({ title, desc }) => (
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
            <button onClick={() => setCurrentScreen('profile')} className="w-full text-white text-center py-3 font-semibold hover:opacity-80">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    ),

    help: (
      <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
          <button onClick={() => setCurrentScreen('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
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
    ),

    about: (
      <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
          <button onClick={() => setCurrentScreen('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
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
    ),

    language: (
      <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between">
          <button onClick={() => setCurrentScreen('profile')} className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
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
    ),

    themeScreen: (
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
              {theme === 'light' && <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>}
            </div>
            <div onClick={() => setTheme('dark')} className={`bg-white rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${theme === 'dark' ? 'ring-2 ring-purple-500' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🌙</span>
                <span className="font-semibold">Dark Mode</span>
              </div>
              {theme === 'dark' && <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>}
            </div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="phone-mockup" style={{ left: '220px' }}>
      <div className="phone-body">
        <div className="phone-notch"></div>
        <div className="phone-screen w-[480px] bg-white shadow-2xl" style={{ height: '1024px', overflow: 'auto' }}>
          {screens[currentScreen]}
          {currentScreen !== 'welcome' && currentScreen !== 'login' && currentScreen !== 'signup' && currentScreen !== 'petSetup' && currentScreen !== 'notifications' && <BottomNav active={getActiveNav(currentScreen)} />}
        </div>
      </div>
    </div>
  );
}