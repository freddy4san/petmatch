import { useCallback, useEffect, useMemo, useState } from 'react';

import { getDiscoveryPets } from '../../discovery/api';
import { createInteraction } from '../../interactions/api';
import { getMatches } from '../../matches/api';
import { createPet, deletePet, deletePetImage, getUserPets, updatePet, uploadPetImage } from '../../pets/api';

const AUTH_STORAGE_KEY = 'petmatch-auth-session';
const EMPTY_PET_FORM = {
  age: '',
  breed: '',
  imageFile: null,
  imagePreviewUrl: '',
  imageUrl: '',
  name: '',
  shouldDeleteImage: false,
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

export function usePrototypeApp() {
  const [authSession, setAuthSession] = useState(() => readStoredAuthSession());
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [matches, setMatches] = useState([]);
  const [likedPets, setLikedPets] = useState([]);
  const [discoveryPets, setDiscoveryPets] = useState([]);
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
  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState('');
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionError, setInteractionError] = useState('');
  const [isMatchesLoading, setIsMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState('');

  const activeUserPet = userPets[0] ?? null;
  const currentPet = discoveryPets[0] ?? null;
  const currentChatPet = useMemo(
    () => matches.find((match) => match.id === currentChatPetId) ?? null,
    [currentChatPetId, matches]
  );
  const editingPet = useMemo(
    () => petDraft,
    [petDraft]
  );

  const loadDiscoveryPets = useCallback(async () => {
    if (!authSession?.token) {
      setDiscoveryPets([]);
      return;
    }

    setIsDiscoveryLoading(true);
    setDiscoveryError('');

    try {
      const pets = await getDiscoveryPets(authSession.token, { limit: 10 });
      setDiscoveryPets(pets.map(mapApiPetToViewModel));
    } catch (error) {
      setDiscoveryError(error.message);
    } finally {
      setIsDiscoveryLoading(false);
    }
  }, [authSession]);

  const loadMatches = useCallback(async () => {
    if (!authSession?.token) {
      setMatches([]);
      return;
    }

    setIsMatchesLoading(true);
    setMatchesError('');

    try {
      const nextMatches = await getMatches(authSession.token);
      setMatches(nextMatches.map(mapApiMatchToViewModel));
    } catch (error) {
      setMatchesError(error.message);
    } finally {
      setIsMatchesLoading(false);
    }
  }, [authSession]);

  useEffect(() => {
    if (!authSession?.token) {
      setUserPets([]);
      setDiscoveryPets([]);
      setMatches([]);
      setLikedPets([]);
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

  useEffect(() => {
    if (!authSession?.token) {
      return;
    }

    loadDiscoveryPets();
    loadMatches();
  }, [authSession, loadDiscoveryPets, loadMatches]);

  const handleSwipe = async (liked) => {
    if (!currentPet) {
      return;
    }

    if (!authSession?.token) {
      setInteractionError('Please sign in again to discover pets.');
      return;
    }

    if (!activeUserPet) {
      setInteractionError('Add one of your pets before discovering matches.');
      return;
    }

    setIsInteracting(true);
    setInteractionError('');

    try {
      const interactionResult = await createInteraction(authSession.token, {
        fromPetId: activeUserPet.id,
        toPetId: currentPet.id,
        type: liked ? 'LIKE' : 'PASS'
      });

      setDiscoveryPets((prev) => prev.filter((pet) => pet.id !== currentPet.id));

      if (liked) {
        setLikedPets((prev) => (
          prev.some((pet) => pet.id === currentPet.id) ? prev : [...prev, currentPet]
        ));
      }

      if (interactionResult.match) {
        await loadMatches();
      }

      if (discoveryPets.length <= 1) {
        await loadDiscoveryPets();
      }
    } catch (error) {
      if (error.message === 'Interaction already exists') {
        setDiscoveryPets((prev) => prev.filter((pet) => pet.id !== currentPet.id));
        if (discoveryPets.length <= 1) {
          await loadDiscoveryPets();
        }
        return;
      }

      setInteractionError(error.message);
    } finally {
      setIsInteracting(false);
    }
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
    setDiscoveryPets([]);
    setChatMessages({});
    setCurrentChatPetId(null);
    setUserPets([]);
    setPetDraft(EMPTY_PET_FORM);
    setEditingPetId(null);
    setPetsError('');
    setPetFormError('');
    setDiscoveryError('');
    setInteractionError('');
    setMatchesError('');
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
    setPetDraft((prev) => {
      if (field === 'imageFile') {
        revokeObjectUrl(prev.imagePreviewUrl);

        return {
          ...prev,
          imageFile: value,
          imagePreviewUrl: value ? createObjectPreviewUrl(value) : '',
          shouldDeleteImage: value ? false : prev.shouldDeleteImage
        };
      }

      if (field === 'removeImage') {
        revokeObjectUrl(prev.imagePreviewUrl);

        return {
          ...prev,
          imageFile: null,
          imagePreviewUrl: '',
          imageUrl: '',
          shouldDeleteImage: Boolean(prev.imageUrl)
        };
      }

      return { ...prev, [field]: value };
    });
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
      name: petDraft.name.trim(),
      type: petDraft.type.trim()
    };

    setIsSavingPet(true);
    setPetFormError('');

    try {
      const wasEditingExistingPet = Boolean(editingPetId);
      const savedProfilePet = editingPetId
        ? await updatePet(authSession.token, editingPetId, payload)
        : await createPet(authSession.token, payload);
      let savedPet = savedProfilePet;

      try {
        if (petDraft.imageFile) {
          savedPet = await uploadPetImage(authSession.token, savedProfilePet.id, petDraft.imageFile);
        } else if (wasEditingExistingPet && petDraft.shouldDeleteImage) {
          savedPet = await deletePetImage(authSession.token, savedProfilePet.id);
        }
      } catch (imageError) {
        setUserPets((prev) => upsertPetInList(prev, savedProfilePet, wasEditingExistingPet));

        if (!wasEditingExistingPet) {
          setEditingPetId(savedProfilePet.id);
        }

        setPetFormError(`Pet details saved, but the image update failed: ${imageError.message}`);
        return;
      }

      setUserPets((prev) => upsertPetInList(prev, savedPet, wasEditingExistingPet));
      setEditingPetId(null);
      revokeObjectUrl(petDraft.imagePreviewUrl);
      setPetDraft(EMPTY_PET_FORM);
      loadDiscoveryPets();
      loadMatches();
      setCurrentScreen(petFormOriginScreen === 'petSetup' ? 'home' : 'profile');
    } catch (error) {
      setPetFormError(error.message);
    } finally {
      setIsSavingPet(false);
    }
  };

  return {
    activeUserPet,
    addPet,
    authSession,
    chatMessages,
    currentChatPet,
    currentPet,
    currentScreen,
    editingPet,
    getActiveNav,
    handleAuthSuccess,
    handleLogout,
    handleSendMessage,
    handleSwipe,
    isDiscoveryLoading,
    isEditingExistingPet: Boolean(editingPetId),
    isInteracting,
    isMatchesLoading,
    isPetsLoading,
    isSavingPet,
    discoveryError,
    discoveryPets,
    interactionError,
    likedPets,
    matches,
    matchesError,
    maxDistance,
    newMessage,
    notificationsEnabled,
    openChat,
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

function createObjectPreviewUrl(file) {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return '';
  }

  return URL.createObjectURL(file);
}

function revokeObjectUrl(url) {
  if (url?.startsWith('blob:') && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url);
  }
}

function upsertPetInList(pets, apiPet, isExistingPet) {
  const nextPet = mapApiPetToViewModel(apiPet);

  if (!isExistingPet) {
    return pets.some((pet) => pet.id === nextPet.id) ? pets : [...pets, nextPet];
  }

  return pets.map((pet) => (pet.id === nextPet.id ? nextPet : pet));
}

function mapApiPetToViewModel(pet) {
  return {
    ...pet,
    age: Number(pet.age || 0),
    emoji: getPetEmoji(pet.type),
    image: pet.primaryImage?.url || pet.imageUrl || ''
  };
}

function mapApiMatchToViewModel(match) {
  const otherPet = match.otherPet || {};

  return {
    id: match.id,
    createdAt: match.createdAt,
    petIds: match.petIds || [],
    currentPet: match.currentPet ? mapApiPetToViewModel(match.currentPet) : null,
    otherPet: mapApiPetToViewModel(otherPet),
    age: Number(otherPet.age || 0),
    breed: otherPet.breed || '',
    emoji: getPetEmoji(otherPet.type),
    image: otherPet.primaryImage?.url || otherPet.imageUrl || '',
    imageUrl: otherPet.imageUrl || otherPet.primaryImage?.url || '',
    name: otherPet.name || 'Matched pet',
    type: otherPet.type || ''
  };
}

function mapPetToForm(pet) {
  return {
    age: String(pet.age),
    breed: pet.breed ?? '',
    id: pet.id,
    imageFile: null,
    imagePreviewUrl: '',
    imageUrl: pet.imageUrl ?? '',
    name: pet.name ?? '',
    shouldDeleteImage: false,
    type: pet.type ?? 'Dog'
  };
}

function getPetEmoji(type) {
  return PET_TYPE_EMOJI_MAP[type] || '🐾';
}
