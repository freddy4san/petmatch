import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getCurrentUser } from '../../auth/api';
import {
  clearStoredAuthSession,
  hasStoredAuthSession,
  readStoredAuthSession,
  storeAuthSession
} from '../../auth/session';
import { getDiscoveryPets } from '../../discovery/api';
import { createInteraction } from '../../interactions/api';
import {
  getMatchConversations,
  getMatchMessages,
  markConversationRead,
  sendMatchMessage
} from '../../matches/api';
import { createPet, deletePet, deletePetImage, getUserPets, updatePet, uploadPetImage } from '../../pets/api';
import {
  getImageCleanupWarning,
  getImageMutationErrorMessage,
  validatePetImageFile
} from '../../pets/imageValidation';

const UNAUTHORIZED_EVENT_NAME = 'petmatch:unauthorized';
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
const PUBLIC_SCREENS = new Set(['welcome', 'login', 'signup']);

export function usePrototypeApp() {
  const [authSession, setAuthSession] = useState(() => readStoredAuthSession());
  const [currentScreen, setCurrentScreen] = useState(() => (authSession?.token ? 'home' : 'welcome'));
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
  const [activeUserPetId, setActiveUserPetId] = useState('');
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
  const [matchCelebration, setMatchCelebration] = useState(null);
  const [isMatchesLoading, setIsMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState('');
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [matchesFilter, setMatchesFilter] = useState('all');
  const activeChatIdRef = useRef(null);
  const latestMessageRequestRef = useRef(0);
  const latestSendRequestRef = useRef(0);
  const readMessageIdsRef = useRef(new Set());

  const activeUserPet = useMemo(
    () => userPets.find((pet) => pet.id === activeUserPetId) || userPets[0] || null,
    [activeUserPetId, userPets]
  );
  const currentPet = discoveryPets[0] ?? null;
  const currentChatPet = useMemo(
    () => matches.find((match) => match.id === currentChatPetId) ?? null,
    [currentChatPetId, matches]
  );
  const editingPet = useMemo(
    () => petDraft,
    [petDraft]
  );
  const unreadMatchCount = useMemo(
    () => matches.reduce((total, match) => total + (Number(match.unreadCount) || 0), 0),
    [matches]
  );
  const navigateToScreen = useCallback((screen) => {
    if (isProtectedScreen(screen) && !authSession?.token && !hasStoredAuthSession()) {
      setCurrentScreen('welcome');
      return;
    }

    setCurrentScreen(screen);
  }, [authSession?.token]);

  const loadDiscoveryPets = useCallback(async () => {
    if (!authSession?.token || !activeUserPet?.id) {
      setDiscoveryPets([]);
      return;
    }

    setIsDiscoveryLoading(true);
    setDiscoveryError('');

    try {
      const pets = await getDiscoveryPets(authSession.token, {
        fromPetId: activeUserPet.id,
        limit: 10
      });
      setDiscoveryPets(pets.map(mapApiPetToViewModel));
    } catch (error) {
      setDiscoveryError(error.message);
    } finally {
      setIsDiscoveryLoading(false);
    }
  }, [activeUserPet?.id, authSession]);

  const loadMatches = useCallback(async () => {
    if (!authSession?.token) {
      setMatches([]);
      return;
    }

    setIsMatchesLoading(true);
    setMatchesError('');

    try {
      const conversations = await getMatchConversations(authSession.token);
      const currentUserId = getAuthenticatedUserId(authSession);
      setMatches((conversations || []).map((conversation) => (
        mapApiConversationToViewModel(conversation, currentUserId, readMessageIdsRef.current)
      )));
    } catch (error) {
      setMatchesError(error.message);
    } finally {
      setIsMatchesLoading(false);
    }
  }, [authSession]);

  const loadMessages = useCallback(async (matchId) => {
    if (!authSession?.token || !matchId) {
      return;
    }

    const requestId = latestMessageRequestRef.current + 1;
    latestMessageRequestRef.current = requestId;
    setIsMessagesLoading(true);
    setMessagesError('');

    try {
      const messages = await getMatchMessages(authSession.token, matchId);
      const currentUserId = getAuthenticatedUserId(authSession);

      if (latestMessageRequestRef.current !== requestId || activeChatIdRef.current !== matchId) {
        return;
      }

      setChatMessages((prev) => ({
        ...prev,
        [matchId]: (messages || []).map((message) => mapApiMessageToViewModel(message, currentUserId))
      }));
      (messages || []).forEach((message) => {
        if (message.senderUserId !== currentUserId) {
          readMessageIdsRef.current.add(message.id);
        }
      });
      setMatches((prev) => prev.map((match) => (
        match.id === matchId ? { ...match, hasUnread: false, unreadCount: 0 } : match
      )));
    } catch (error) {
      if (latestMessageRequestRef.current !== requestId || activeChatIdRef.current !== matchId) {
        return;
      }

      setMessagesError(error.message);
    } finally {
      if (latestMessageRequestRef.current === requestId && activeChatIdRef.current === matchId) {
        setIsMessagesLoading(false);
      }
    }
  }, [authSession]);

  useEffect(() => {
    if (!authSession?.token) {
      setUserPets([]);
      setDiscoveryPets([]);
      setMatches([]);
      setLikedPets([]);
      setChatMessages({});
      setEditingPetId(null);
      setPetDraft(EMPTY_PET_FORM);
      setActiveUserPetId('');
      setMatchesFilter('all');
      readMessageIdsRef.current = new Set();
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

        const nextPets = pets.map(mapApiPetToViewModel);
        setUserPets(nextPets);
        setActiveUserPetId((prev) => (
          nextPets.some((pet) => pet.id === prev) ? prev : nextPets[0]?.id || ''
        ));
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

    let isMounted = true;
    const token = authSession.token;

    const verifySession = async () => {
      try {
        const user = await getCurrentUser(token);

        if (!isMounted) {
          return;
        }

        setAuthSession((prev) => {
          if (!prev || prev.token !== token) {
            return prev;
          }

          const nextSession = {
            ...prev,
            user,
          };

          storeAuthSession(nextSession);
          return nextSession;
        });
      } catch (error) {
        if (isMounted && error.statusCode !== 401) {
          setPetsError(error.message);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [authSession?.token]);

  useEffect(() => {
    if (!authSession?.token) {
      return;
    }

    loadDiscoveryPets();
    loadMatches();
  }, [authSession, loadDiscoveryPets, loadMatches]);

  useEffect(() => {
    setDiscoveryPets([]);
    setInteractionError('');
  }, [activeUserPet?.id]);

  useEffect(() => {
    if (!authSession?.token && isProtectedScreen(currentScreen)) {
      setCurrentScreen('welcome');
    }
  }, [authSession?.token, currentScreen]);

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
        setMatchCelebration({
          id: interactionResult.match.id,
          matchedPet: currentPet,
          userPet: activeUserPet
        });
        await loadMatches();
      }

      if (discoveryPets.length <= 1) {
        await loadDiscoveryPets();
      }
    } catch (error) {
      if (error.message === 'Interaction already exists') {
        setDiscoveryPets((prev) => prev.filter((pet) => pet.id !== currentPet.id));
        setInteractionError('You already responded to this pet from the selected pet profile.');
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

  const markMatchRead = async (match) => {
    if (!match?.lastMessage?.id) {
      return;
    }

    readMessageIdsRef.current.add(match.lastMessage.id);
    setMatches((prev) => prev.map((item) => (
      item.id === match.id ? { ...item, hasUnread: false, unreadCount: 0 } : item
    )));

    if (!authSession?.token || !match.conversationId) {
      return;
    }

    try {
      await markConversationRead(authSession.token, match.conversationId);
    } catch {
      // Opening the chat should stay responsive even if persisting read state fails.
    }
  };

  const openChat = (match) => {
    markMatchRead(match);
    activeChatIdRef.current = match.id;
    setCurrentChatPetId(match.id);
    setMessagesError('');
    setIsSendingMessage(false);
    setNewMessage('');
    setCurrentScreen('chat');
    loadMessages(match.id);
  };

  const dismissMatchCelebration = () => {
    setMatchCelebration(null);
  };

  const viewCelebratedMatch = () => {
    setMatchCelebration(null);
    setCurrentScreen('matches');
  };

  const refreshMessages = () => {
    if (currentChatPetId) {
      loadMessages(currentChatPetId);
    }
  };

  const handleSendMessage = async () => {
    const messageBody = newMessage.trim();

    const targetMatchId = currentChatPetId;

    if (!messageBody || !targetMatchId || isSendingMessage) {
      return;
    }

    if (!authSession?.token) {
      setMessagesError('Please sign in again to send a message.');
      return;
    }

    const requestId = latestSendRequestRef.current + 1;
    latestSendRequestRef.current = requestId;
    const token = authSession.token;
    setIsSendingMessage(true);
    setMessagesError('');

    try {
      const createdMessage = await sendMatchMessage(token, targetMatchId, messageBody);
      const currentUserId = getAuthenticatedUserId(authSession);
      const nextMessage = mapApiMessageToViewModel(createdMessage, currentUserId, true);

      if (latestSendRequestRef.current !== requestId || activeChatIdRef.current !== targetMatchId) {
        return;
      }

      setChatMessages((prev) => ({
        ...prev,
        [targetMatchId]: [...(prev[targetMatchId] || []), nextMessage]
      }));
      setMatches((prev) => updateMatchLastMessage(prev, targetMatchId, createdMessage));
      setNewMessage('');
    } catch (error) {
      if (latestSendRequestRef.current !== requestId || activeChatIdRef.current !== targetMatchId) {
        return;
      }

      setMessagesError(error.message);
    } finally {
      if (latestSendRequestRef.current === requestId && activeChatIdRef.current === targetMatchId) {
        setIsSendingMessage(false);
      }
    }
  };

  const handleLogout = useCallback(() => {
    activeChatIdRef.current = null;
    latestMessageRequestRef.current += 1;
    latestSendRequestRef.current += 1;
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
    setMessagesError('');
    setIsMessagesLoading(false);
    setIsSendingMessage(false);
    setCurrentScreen('welcome');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    window.addEventListener(UNAUTHORIZED_EVENT_NAME, handleLogout);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT_NAME, handleLogout);
    };
  }, [handleLogout]);

  const handleAuthSuccess = (session) => {
    setAuthSession(session);
    storeAuthSession(session);
  };

  const selectActiveUserPet = (petId) => {
    setActiveUserPetId(petId);
    setDiscoveryPets([]);
    setInteractionError('');
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

  const skipPetSetup = () => {
    setPetFormError('');
    setEditingPetId(null);
    revokeObjectUrl(petDraft.imagePreviewUrl);
    setPetDraft(EMPTY_PET_FORM);
    setPetFormOriginScreen('profile');
    setCurrentScreen('home');
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
      const deleteResult = await deletePet(authSession.token, petId);
      const nextPets = userPets.filter((pet) => pet.id !== petId);
      setUserPets(nextPets);
      setActiveUserPetId((currentPetId) => (
        currentPetId === petId ? nextPets[0]?.id || '' : currentPetId
      ));
      setPetsError(getImageCleanupWarning(deleteResult));

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
        const imageValidationError = validatePetImageFile(value);

        if (imageValidationError) {
          setPetFormError(imageValidationError);
          return prev;
        }

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
          setActiveUserPetId(savedProfilePet.id);
        }

        setPetFormError(getImageMutationErrorMessage(imageError));
        return;
      }

      setUserPets((prev) => upsertPetInList(prev, savedPet, wasEditingExistingPet));
      setActiveUserPetId((prev) => prev || savedPet.id);
      setEditingPetId(null);
      revokeObjectUrl(petDraft.imagePreviewUrl);
      setPetDraft(EMPTY_PET_FORM);
      loadDiscoveryPets();
      loadMatches();
      setPetsError(getImageCleanupWarning(savedPet));
      setCurrentScreen(petFormOriginScreen === 'petSetup' ? 'home' : 'profile');
    } catch (error) {
      setPetFormError(error.message);
    } finally {
      setIsSavingPet(false);
    }
  };

  return {
    activeUserPet,
    activeUserPetId,
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
    isMessagesLoading,
    isPetsLoading,
    isSavingPet,
    isSendingMessage,
    discoveryError,
    discoveryPets,
    interactionError,
    likedPets,
    matches,
    matchCelebration,
    matchesFilter,
    matchesError,
    messagesError,
    maxDistance,
    newMessage,
    notificationsEnabled,
    openChat,
    petFormError,
    petsError,
    refreshMatches: loadMatches,
    refreshMessages,
    removePet,
    saveEditingPet,
    selectActiveUserPet,
    setCurrentScreen: navigateToScreen,
    setMatchesFilter,
    setMaxDistance,
    setNewMessage,
    setNotificationsEnabled,
    setShowDistance,
    setTheme,
    showDistance,
    skipPetSetup,
    startPetSetup,
    startEditingPet,
    theme,
    unreadMatchCount,
    updateEditingPet,
    dismissMatchCelebration,
    viewCelebratedMatch,
    userPets
  };
}

function isProtectedScreen(screen) {
  return !PUBLIC_SCREENS.has(screen);
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

function mapApiConversationToViewModel(conversation, currentUserId = '', readMessageIds = new Set()) {
  const lastMessage = conversation.lastMessage || null;
  const unreadCount = Number(conversation.unreadCount) || 0;
  const hasBackendUnreadState = typeof conversation.hasUnread === 'boolean' || conversation.unreadCount !== undefined;
  const lastMessageSentByCurrentUser = Boolean(
    currentUserId &&
    lastMessage?.senderUserId === currentUserId
  );
  const fallbackHasUnread = Boolean(
    lastMessage?.id &&
    !lastMessageSentByCurrentUser &&
    !readMessageIds.has(lastMessage.id)
  );

  return {
    ...mapApiMatchToViewModel(conversation.match || {}),
    conversationCreatedAt: conversation.createdAt,
    conversationId: conversation.id,
    id: conversation.match?.id || conversation.matchId,
    hasUnread: hasBackendUnreadState ? Boolean(conversation.hasUnread || unreadCount > 0) : fallbackHasUnread,
    lastActivityAt: conversation.latestMessageAt || lastMessage?.createdAt || conversation.updatedAt,
    lastMessageSentByCurrentUser,
    lastMessage,
    lastMessagePreview: conversation.lastMessagePreview || lastMessage?.body || '',
    lastReadAt: conversation.lastReadAt || null,
    matchId: conversation.matchId,
    unreadCount: hasBackendUnreadState ? unreadCount : (fallbackHasUnread ? 1 : 0),
    updatedAt: conversation.updatedAt
  };
}

function mapApiMessageToViewModel(message, currentUserId, forceSent = false) {
  return {
    ...message,
    sent: forceSent || Boolean(currentUserId && message.senderUserId === currentUserId),
    text: message.body || '',
    time: formatMessageTime(message.createdAt)
  };
}

function updateMatchLastMessage(matches, matchId, message) {
  return matches.map((match) => (
    match.id === matchId
      ? {
          ...match,
          hasUnread: false,
          lastActivityAt: message.createdAt || match.updatedAt,
          lastMessage: message,
          lastMessagePreview: message.body || '',
          lastMessageSentByCurrentUser: true,
          unreadCount: 0,
          updatedAt: message.createdAt || match.updatedAt
        }
      : match
  ));
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

function getAuthenticatedUserId(authSession) {
  return authSession?.user?.id
    || authSession?.userId
    || authSession?.id
    || getUserIdFromToken(authSession?.token);
}

function getUserIdFromToken(token) {
  if (!token || typeof window === 'undefined' || typeof window.atob !== 'function') {
    return '';
  }

  const [, payload] = token.split('.');

  if (!payload) {
    return '';
  }

  try {
    const normalizedPayload = padBase64(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsedPayload = JSON.parse(window.atob(normalizedPayload));

    return parsedPayload.sub || parsedPayload.userId || parsedPayload.id || '';
  } catch {
    return '';
  }
}

function padBase64(value) {
  const paddingLength = (4 - (value.length % 4)) % 4;

  return `${value}${'='.repeat(paddingLength)}`;
}

function formatMessageTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}
