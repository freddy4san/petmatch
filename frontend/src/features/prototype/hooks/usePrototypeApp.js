import { useMemo, useState } from 'react';

import { initialUserPets, petProfiles } from '../../../mocks/pets';

const AUTH_STORAGE_KEY = 'petmatch-auth-session';

const AUTO_RESPONSES = [
  'That sounds great! My pet would love to meet yours.',
  "Awesome! Let's arrange a playdate soon.",
  'Perfect! What day works best for you?',
  'My pet is so excited to make new friends!',
  'Great idea! How about this weekend?'
];

const DEFAULT_MESSAGE = (petName) => ({
  id: `intro-${petName.toLowerCase()}`,
  text: `Hi! I saw ${petName}'s profile and our pets would be great playmates!`,
  time: '10:30 AM',
  sent: false
});

export function usePrototypeApp() {
  const [authSession, setAuthSession] = useState(() => readStoredAuthSession());
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [matches, setMatches] = useState([]);
  const [likedPets, setLikedPets] = useState([]);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [currentChatPetId, setCurrentChatPetId] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [maxDistance, setMaxDistance] = useState(25);
  const [theme, setTheme] = useState('light');
  const [userPets, setUserPets] = useState(initialUserPets);
  const [editingPetId, setEditingPetId] = useState(null);

  const currentPet = petProfiles[currentPetIndex];
  const currentChatPet = useMemo(
    () => matches.find((match) => match.id === currentChatPetId) ?? null,
    [currentChatPetId, matches]
  );
  const editingPet = useMemo(
    () => userPets.find((pet) => pet.id === editingPetId) ?? null,
    [editingPetId, userPets]
  );

  const handleSwipe = (liked) => {
    if (!currentPet) {
      return;
    }

    if (liked) {
      setMatches((prev) => [...prev, currentPet]);
      setLikedPets((prev) => [...prev, currentPet]);
      setChatMessages((prev) => (
        prev[currentPet.id]
          ? prev
          : { ...prev, [currentPet.id]: [DEFAULT_MESSAGE(currentPet.name)] }
      ));
    }

    setCurrentPetIndex((prev) => (prev < petProfiles.length - 1 ? prev + 1 : 0));
  };

  const openChat = (pet) => {
    setCurrentChatPetId(pet.id);
    setCurrentScreen('chat');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentChatPetId) {
      return;
    }

    const outgoingMessage = {
      id: `message-${Date.now()}`,
      text: newMessage,
      time: 'Just now',
      sent: true
    };

    setChatMessages((prev) => ({
      ...prev,
      [currentChatPetId]: [...(prev[currentChatPetId] || []), outgoingMessage]
    }));
    setNewMessage('');

    window.setTimeout(() => {
      const responseMessage = {
        id: `response-${Date.now()}`,
        text: AUTO_RESPONSES[Math.floor(Math.random() * AUTO_RESPONSES.length)],
        time: 'Just now',
        sent: false
      };

      setChatMessages((prev) => ({
        ...prev,
        [currentChatPetId]: [...(prev[currentChatPetId] || []), responseMessage]
      }));
    }, 2000);
  };

  const handleLogout = () => {
    clearStoredAuthSession();
    setAuthSession(null);
    setMatches([]);
    setLikedPets([]);
    setCurrentPetIndex(0);
    setChatMessages({});
    setCurrentChatPetId(null);
    setCurrentScreen('welcome');
  };

  const handleAuthSuccess = (session) => {
    setAuthSession(session);
    storeAuthSession(session);
  };

  const getActiveNav = (screen) => {
    const navScreens = ['home', 'discovery', 'matches', 'profile'];
    return navScreens.includes(screen) ? screen : '';
  };

  const startEditingPet = (pet) => {
    setEditingPetId(pet.id);
    setCurrentScreen('editPet');
  };

  const addPet = () => {
    const nextPet = {
      id: `user-pet-${Date.now()}`,
      name: 'New Pet',
      type: 'Dog',
      breed: 'Mixed',
      age: 1,
      emoji: '🐕'
    };

    setUserPets((prev) => [...prev, nextPet]);
    startEditingPet(nextPet);
  };

  const removePet = (petId) => {
    setUserPets((prev) => prev.filter((pet) => pet.id !== petId));
    if (editingPetId === petId) {
      setEditingPetId(null);
    }
  };

  const updateEditingPet = (field, value) => {
    if (!editingPet) {
      return;
    }

    setUserPets((prev) => prev.map((pet) => (
      pet.id === editingPet.id ? { ...pet, [field]: value } : pet
    )));
  };

  const saveEditingPet = () => {
    setCurrentScreen('profile');
    setEditingPetId(null);
  };

  return {
    addPet,
    authSession,
    chatMessages,
    currentChatPet,
    currentPet,
    currentPetIndex,
    currentScreen,
    editingPet,
    getActiveNav,
    handleAuthSuccess,
    handleLogout,
    handleSendMessage,
    handleSwipe,
    likedPets,
    matches,
    maxDistance,
    newMessage,
    notificationsEnabled,
    openChat,
    petProfiles,
    removePet,
    saveEditingPet,
    setCurrentScreen,
    setMaxDistance,
    setNewMessage,
    setNotificationsEnabled,
    setShowDistance,
    setTheme,
    showDistance,
    startEditingPet,
    theme,
    updateEditingPet,
    userPets
  };
}

function readStoredAuthSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function storeAuthSession(session) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredAuthSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
