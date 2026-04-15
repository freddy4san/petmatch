import { useEffect, useMemo, useState } from 'react';

import { petProfiles } from '../../../mocks/pets';
import { createPet, deletePet, getUserPets, updatePet } from '../../pets/api';

const AUTH_STORAGE_KEY = 'petmatch-auth-session';
const EMPTY_PET_FORM = {
  age: '',
  breed: '',
  imageUrl: '',
  name: '',
  type: 'Dog'
};
const PET_TYPE_EMOJI_MAP = {
  Bird: '🦜',
  Cat: '🐱',
  Dog: '🐕',
  Rabbit: '🐇',
  Raccoon: '🦝'
};

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
  const [userPets, setUserPets] = useState([]);
  const [isPetsLoading, setIsPetsLoading] = useState(false);
  const [isSavingPet, setIsSavingPet] = useState(false);
  const [petsError, setPetsError] = useState('');
  const [petFormError, setPetFormError] = useState('');
  const [petDraft, setPetDraft] = useState(EMPTY_PET_FORM);
  const [editingPetId, setEditingPetId] = useState(null);
  const [petFormOriginScreen, setPetFormOriginScreen] = useState('profile');

  const currentPet = petProfiles[currentPetIndex];
  const currentChatPet = useMemo(
    () => matches.find((match) => match.id === currentChatPetId) ?? null,
    [currentChatPetId, matches]
  );
  const editingPet = useMemo(
    () => petDraft,
    [petDraft]
  );

  useEffect(() => {
    if (!authSession?.token) {
      setUserPets([]);
      setEditingPetId(null);
      setPetDraft(EMPTY_PET_FORM);
      return;
    }

    let isMounted = true;

    const loadPets = async () => {
      setIsPetsLoading(true);
      setPetsError('');

      try {
        const pets = await getUserPets(authSession.token);

        if (!isMounted) {
          return;
        }

        setUserPets(pets.map(mapApiPetToViewModel));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPetsError(error.message);
      } finally {
        if (isMounted) {
          setIsPetsLoading(false);
        }
      }
    };

    loadPets();

    return () => {
      isMounted = false;
    };
  }, [authSession]);

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
    setUserPets([]);
    setPetDraft(EMPTY_PET_FORM);
    setEditingPetId(null);
    setPetsError('');
    setPetFormError('');
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
    setPetFormError('');
    setEditingPetId(pet.id);
    setPetDraft(mapPetToForm(pet));
    setPetFormOriginScreen('profile');
    setCurrentScreen('editPet');
  };

  const addPet = () => {
    setPetFormError('');
    setEditingPetId(null);
    setPetDraft(EMPTY_PET_FORM);
    setPetFormOriginScreen('profile');
    setCurrentScreen('editPet');
  };

  const startPetSetup = () => {
    setPetFormError('');
    setEditingPetId(null);
    setPetDraft(EMPTY_PET_FORM);
    setPetFormOriginScreen('petSetup');
    setCurrentScreen('petSetup');
  };

  const removePet = async (pet) => {
    const petId = pet?.id;

    if (!petId) {
      return;
    }

    if (!authSession?.token) {
      setPetsError('Please sign in again to manage your pets.');
      return;
    }

    try {
      setPetsError('');
      await deletePet(authSession.token, petId);
      setUserPets((prev) => prev.filter((pet) => pet.id !== petId));

      if (editingPetId === petId) {
        setEditingPetId(null);
        setPetDraft(EMPTY_PET_FORM);
      }
    } catch (error) {
      setPetsError(error.message);
    }
  };

  const updateEditingPet = (field, value) => {
    setPetFormError('');
    setPetDraft((prev) => ({ ...prev, [field]: value }));
  };

  const saveEditingPet = async () => {
    if (!authSession?.token) {
      setPetFormError('Please sign in again to save your pet.');
      return;
    }

    const validationError = validatePetDraft(petDraft);

    if (validationError) {
      setPetFormError(validationError);
      return;
    }

    const payload = {
      age: Number(petDraft.age),
      breed: petDraft.breed.trim(),
      imageUrl: petDraft.imageUrl.trim() || undefined,
      name: petDraft.name.trim(),
      type: petDraft.type.trim()
    };

    setIsSavingPet(true);
    setPetFormError('');

    try {
      const savedPet = editingPetId
        ? await updatePet(authSession.token, editingPetId, payload)
        : await createPet(authSession.token, payload);
      const nextPet = mapApiPetToViewModel(savedPet);

      setUserPets((prev) => {
        if (!editingPetId) {
          return [...prev, nextPet];
        }

        return prev.map((pet) => (pet.id === nextPet.id ? nextPet : pet));
      });
      setEditingPetId(null);
      setPetDraft(EMPTY_PET_FORM);
      setCurrentScreen(petFormOriginScreen === 'petSetup' ? 'home' : 'profile');
    } catch (error) {
      setPetFormError(error.message);
    } finally {
      setIsSavingPet(false);
    }
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
    isEditingExistingPet: Boolean(editingPetId),
    isPetsLoading,
    isSavingPet,
    likedPets,
    matches,
    maxDistance,
    newMessage,
    notificationsEnabled,
    openChat,
    petProfiles,
    petFormError,
    petsError,
    removePet,
    saveEditingPet,
    setCurrentScreen,
    setMaxDistance,
    setNewMessage,
    setNotificationsEnabled,
    setShowDistance,
    setTheme,
    showDistance,
    startPetSetup,
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

function validatePetDraft(petDraft) {
  if (!petDraft.name.trim()) {
    return 'Pet name is required.';
  }

  if (!petDraft.type.trim()) {
    return 'Pet type is required.';
  }

  if (!petDraft.breed.trim()) {
    return 'Breed is required.';
  }

  if (petDraft.age === '' || Number.isNaN(Number(petDraft.age)) || Number(petDraft.age) < 0) {
    return 'Please enter a valid age.';
  }

  return '';
}

function mapApiPetToViewModel(pet) {
  return {
    ...pet,
    age: Number(pet.age),
    emoji: getPetEmoji(pet.type)
  };
}

function mapPetToForm(pet) {
  return {
    age: String(pet.age),
    breed: pet.breed ?? '',
    imageUrl: pet.imageUrl ?? '',
    name: pet.name ?? '',
    type: pet.type ?? 'Dog'
  };
}

function getPetEmoji(type) {
  return PET_TYPE_EMOJI_MAP[type] || '🐾';
}
