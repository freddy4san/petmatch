import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getCurrentUser, updateCurrentUser } from '../../auth/api';
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
import { createChatSocket } from '../../matches/socket';
import { createPet, deletePet, deletePetImage, getUserPets, updatePet, uploadPetImage } from '../../pets/api';
import {
  getImageCleanupWarning,
  getImageMutationErrorMessage,
  validatePetImageFile
} from '../../pets/imageValidation';

const UNAUTHORIZED_EVENT_NAME = 'petmatch:unauthorized';
const MESSAGE_PAGE_SIZE = 50;
const EMPTY_PET_FORM = {
  age: '',
  bio: '',
  breed: '',
  gender: '',
  imageFile: null,
  imagePreviewUrl: '',
  imageUrl: '',
  isBioCustomized: false,
  name: '',
  shouldDeleteImage: false,
  size: '',
  temperament: [],
  type: 'Dog'
};
const EMPTY_DISCOVERY_FILTERS = {
  breed: '',
  maxAge: '',
  minAge: '',
  size: '',
  type: '',
  withPhotos: false
};
const PET_TYPE_EMOJI_MAP = {
  Bird: '🦜',
  Cat: '🐱',
  Dog: '🐕',
  Rabbit: '🐇',
  Raccoon: '🦝',
  Reptile: '🦎'
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
  const [chatPagination, setChatPagination] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [maxDistance, setMaxDistance] = useState(25);
  const [discoveryFilters, setDiscoveryFilters] = useState(EMPTY_DISCOVERY_FILTERS);
  const [discoveryFilterDraft, setDiscoveryFilterDraft] = useState(EMPTY_DISCOVERY_FILTERS);
  const [theme, setTheme] = useState('light');
  const [userPets, setUserPets] = useState([]);
  const [activeUserPetId, setActiveUserPetId] = useState('');
  const [isPetsLoading, setIsPetsLoading] = useState(false);
  const [isSavingProfileDetails, setIsSavingProfileDetails] = useState(false);
  const [isSavingProfileLocation, setIsSavingProfileLocation] = useState(false);
  const [isSavingPet, setIsSavingPet] = useState(false);
  const [profileDetailsError, setProfileDetailsError] = useState('');
  const [profileLocationError, setProfileLocationError] = useState('');
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
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [matchesFilter, setMatchesFilter] = useState('all');
  const activeChatIdRef = useRef(null);
  const activeConversationIdRef = useRef(null);
  const chatSocketRef = useRef(null);
  const chatSocketConnectedRef = useRef(false);
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
  const currentChatPagination = currentChatPetId ? chatPagination[currentChatPetId] : null;
  const editingPet = useMemo(
    () => petDraft,
    [petDraft]
  );
  const unreadMatchCount = useMemo(
    () => matches.reduce((total, match) => total + (Number(match.unreadCount) || 0), 0),
    [matches]
  );
  const newMatchCount = useMemo(
    () => matches.reduce((total, match) => total + (match.isNewMatch ? 1 : 0), 0),
    [matches]
  );
  const matchNotificationCount = unreadMatchCount + newMatchCount;
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

    const filterError = getDiscoveryFilterValidationError(discoveryFilters);

    if (filterError) {
      setDiscoveryPets([]);
      setDiscoveryError(filterError);
      return;
    }

    setIsDiscoveryLoading(true);
    setDiscoveryError('');

    try {
      const pets = await getDiscoveryPets(authSession.token, {
        fromPetId: activeUserPet.id,
        limit: 10,
        ...getAppliedDiscoveryFilters(discoveryFilters)
      });
      setDiscoveryPets(pets.map(mapApiPetToViewModel));
    } catch (error) {
      setDiscoveryError(error.message);
    } finally {
      setIsDiscoveryLoading(false);
    }
  }, [activeUserPet?.id, authSession, discoveryFilters]);

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

  const loadMessages = useCallback(async (matchId, options = {}) => {
    if (!authSession?.token || !matchId) {
      return;
    }

    const { before = '', prepend = false } = options;
    const requestId = latestMessageRequestRef.current + 1;
    latestMessageRequestRef.current = requestId;
    if (prepend) {
      setIsLoadingOlderMessages(true);
    } else {
      setIsMessagesLoading(true);
    }
    setMessagesError('');

    try {
      const messagePage = normalizeMessagePage(await getMatchMessages(authSession.token, matchId, {
        before,
        limit: MESSAGE_PAGE_SIZE
      }));
      const messages = messagePage.messages;
      const currentUserId = getAuthenticatedUserId(authSession);

      if (latestMessageRequestRef.current !== requestId || activeChatIdRef.current !== matchId) {
        return;
      }

      setChatMessages((prev) => ({
        ...prev,
        [matchId]: mergeChatMessages(
          prev[matchId] || [],
          (messages || []).map((message) => mapApiMessageToViewModel(message, currentUserId))
        )
      }));
      setChatPagination((prev) => ({
        ...prev,
        [matchId]: messagePage.pagination
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
      if (prepend) {
        setIsLoadingOlderMessages(false);
      } else if (latestMessageRequestRef.current === requestId && activeChatIdRef.current === matchId) {
        setIsMessagesLoading(false);
      }
    }
  }, [authSession]);

  useEffect(() => {
    if (!authSession?.token) {
      chatSocketRef.current?.disconnect();
      chatSocketRef.current = null;
      chatSocketConnectedRef.current = false;
      return undefined;
    }

    const socket = createChatSocket(authSession.token);
    const currentUserId = getAuthenticatedUserId(authSession);
    chatSocketRef.current = socket;

    socket.on('connect', () => {
      chatSocketConnectedRef.current = true;
      if (activeConversationIdRef.current) {
        socket.emit('conversation:join', { conversationId: activeConversationIdRef.current });
      }
    });
    socket.on('disconnect', () => {
      chatSocketConnectedRef.current = false;
    });
    socket.on('connect_error', () => {
      chatSocketConnectedRef.current = false;
    });
    socket.on('message:new', (payload) => {
      const message = payload?.message;
      const matchId = payload?.matchId;

      if (!message?.id || !matchId) {
        return;
      }

      const isCurrentChat = activeChatIdRef.current === matchId;

      setChatMessages((prev) => appendChatMessage(
        prev,
        matchId,
        mapApiMessageToViewModel(message, currentUserId)
      ));
      setMatches((prev) => updateMatchLastMessage(
        prev,
        matchId,
        message,
        currentUserId,
        { isCurrentChat }
      ));

      if (isCurrentChat && message.senderUserId !== currentUserId) {
        readMessageIdsRef.current.add(message.id);
        markConversationRead(authSession.token, message.conversationId).catch(() => {});
      }
    });

    socket.connect();

    return () => {
      socket.disconnect();
      if (chatSocketRef.current === socket) {
        chatSocketRef.current = null;
        chatSocketConnectedRef.current = false;
      }
    };
  }, [authSession]);

  useEffect(() => {
    const socket = chatSocketRef.current;
    const conversationId = currentChatPet?.conversationId;

    if (!socket || !conversationId) {
      activeConversationIdRef.current = null;
      return undefined;
    }

    activeConversationIdRef.current = conversationId;
    socket.emit('conversation:join', { conversationId });

    return () => {
      socket.emit('conversation:leave', { conversationId });
      if (activeConversationIdRef.current === conversationId) {
        activeConversationIdRef.current = null;
      }
    };
  }, [currentChatPet?.conversationId]);

  useEffect(() => {
    if (!authSession?.token) {
      setUserPets([]);
      setDiscoveryPets([]);
      setMatches([]);
      setLikedPets([]);
      setChatMessages({});
      setChatPagination({});
      setEditingPetId(null);
      setPetDraft(EMPTY_PET_FORM);
      setActiveUserPetId('');
      setDiscoveryFilters(EMPTY_DISCOVERY_FILTERS);
      setDiscoveryFilterDraft(EMPTY_DISCOVERY_FILTERS);
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
    if (!match) {
      return;
    }

    if (match.lastMessage?.id) {
      readMessageIdsRef.current.add(match.lastMessage.id);
    }

    setMatches((prev) => prev.map((item) => (
      item.id === match.id ? { ...item, hasUnread: false, isNewMatch: false, unreadCount: 0 } : item
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

  const closeChat = () => {
    activeChatIdRef.current = null;
    setCurrentChatPetId(null);
    setCurrentScreen('matches');
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

  const loadOlderMessages = () => {
    const pagination = currentChatPetId ? chatPagination[currentChatPetId] : null;

    if (!currentChatPetId || !pagination?.hasMore || !pagination.nextCursor || isLoadingOlderMessages) {
      return;
    }

    loadMessages(currentChatPetId, {
      before: pagination.nextCursor,
      prepend: true
    });
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
      const createdMessage = await sendMessageWithRealtimeFallback(
        chatSocketRef.current,
        token,
        targetMatchId,
        messageBody
      );
      const currentUserId = getAuthenticatedUserId(authSession);
      const nextMessage = mapApiMessageToViewModel(createdMessage, currentUserId, true);

      if (latestSendRequestRef.current !== requestId || activeChatIdRef.current !== targetMatchId) {
        return;
      }

      setChatMessages((prev) => ({
        ...prev,
        [targetMatchId]: appendMessageIfMissing(prev[targetMatchId] || [], nextMessage)
      }));
      setMatches((prev) => updateMatchLastMessage(prev, targetMatchId, createdMessage, currentUserId));
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
    setChatPagination({});
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
    setDiscoveryFilters(EMPTY_DISCOVERY_FILTERS);
    setDiscoveryFilterDraft(EMPTY_DISCOVERY_FILTERS);
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

  const updateDiscoveryFilter = (field, value) => {
    setDiscoveryFilterDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyDiscoveryFilters = () => {
    const nextFilters = normalizeDiscoveryFilters(discoveryFilterDraft);
    setDiscoveryFilterDraft(nextFilters);

    if (areDiscoveryFiltersEqual(nextFilters, discoveryFilters)) {
      return;
    }

    setDiscoveryFilters(nextFilters);
    setDiscoveryPets([]);
    setDiscoveryError('');
    setInteractionError('');
  };

  const resetDiscoveryFilters = () => {
    setDiscoveryFilters(EMPTY_DISCOVERY_FILTERS);
    setDiscoveryFilterDraft(EMPTY_DISCOVERY_FILTERS);
    setDiscoveryPets([]);
    setDiscoveryError('');
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

      if (field === 'temperament') {
        return withAutoPetBio({
          ...prev,
          temperament: toggleValue(prev.temperament, value)
        });
      }

      if (field === 'bio') {
        return {
          ...prev,
          bio: value,
          isBioCustomized: true
        };
      }

      const nextDraft = { ...prev, [field]: value };

      return AUTO_BIO_FIELDS.has(field) ? withAutoPetBio(nextDraft) : nextDraft;
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
      bio: getNullableTrimmedValue(petDraft.bio),
      breed: petDraft.breed.trim(),
      gender: petDraft.gender || null,
      name: petDraft.name.trim(),
      size: petDraft.size || null,
      temperament: normalizeTemperament(petDraft.temperament),
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

  const saveProfileLocation = async (city) => {
    if (!authSession?.token) {
      setProfileLocationError('Please sign in again to update your location.');
      return false;
    }

    const trimmedCity = city.trim();

    if (!trimmedCity) {
      setProfileLocationError('Location is required.');
      return false;
    }

    if (trimmedCity.length > 120) {
      setProfileLocationError('Location must be 120 characters or fewer.');
      return false;
    }

    setIsSavingProfileLocation(true);
    setProfileLocationError('');

    try {
      const user = await updateCurrentUser(authSession.token, {
        city: trimmedCity
      });

      updateStoredUser(user);

      return true;
    } catch (error) {
      setProfileLocationError(error.message);
      return false;
    } finally {
      setIsSavingProfileLocation(false);
    }
  };

  const saveProfileDetails = async ({ bio, city, fullName }) => {
    if (!authSession?.token) {
      setProfileDetailsError('Please sign in again to update your profile.');
      return false;
    }

    const payload = {
      bio: getNullableTrimmedValue(bio),
      city: getNullableTrimmedValue(city),
      fullName: getNullableTrimmedValue(fullName)
    };

    if (payload.fullName && payload.fullName.length > 120) {
      setProfileDetailsError('Name must be 120 characters or fewer.');
      return false;
    }

    if (payload.city && payload.city.length > 120) {
      setProfileDetailsError('Location must be 120 characters or fewer.');
      return false;
    }

    if (payload.bio && payload.bio.length > 500) {
      setProfileDetailsError('Bio must be 500 characters or fewer.');
      return false;
    }

    setIsSavingProfileDetails(true);
    setProfileDetailsError('');

    try {
      const user = await updateCurrentUser(authSession.token, payload);

      updateStoredUser(user);
      return true;
    } catch (error) {
      setProfileDetailsError(error.message);
      return false;
    } finally {
      setIsSavingProfileDetails(false);
    }
  };

  const updateStoredUser = (user) => {
    setAuthSession((prev) => {
      if (!prev) {
        return prev;
      }

      const nextSession = {
        ...prev,
        user,
      };

      storeAuthSession(nextSession);
      return nextSession;
    });
  };

  return {
    activeUserPet,
    activeUserPetId,
    addPet,
    applyDiscoveryFilters,
    authSession,
    chatMessages,
    clearProfileDetailsError: () => setProfileDetailsError(''),
    currentChatPet,
    currentPet,
    currentScreen,
    editingPet,
    getActiveNav,
    handleAuthSuccess,
    handleLogout,
    handleSendMessage,
    closeChat,
    handleSwipe,
    isDiscoveryLoading,
    isEditingExistingPet: Boolean(editingPetId),
    isInteracting,
    isMatchesLoading,
    isMessagesLoading,
    isLoadingOlderMessages,
    isPetsLoading,
    isSavingProfileDetails,
    isSavingProfileLocation,
    isSavingPet,
    isSendingMessage,
    discoveryError,
    discoveryFilterDraft,
    discoveryFilters,
    discoveryPets,
    interactionError,
    likedPets,
    matchNotificationCount,
    matches,
    matchCelebration,
    matchesFilter,
    matchesError,
    messagesError,
    maxDistance,
    newMessage,
    notificationsEnabled,
    hasOlderMessages: Boolean(currentChatPagination?.hasMore),
    loadOlderMessages,
    openChat,
    petFormError,
    petsError,
    profileDetailsError,
    profileLocationError,
    refreshMatches: loadMatches,
    refreshMessages,
    removePet,
    resetDiscoveryFilters,
    saveEditingPet,
    saveProfileDetails,
    saveProfileLocation,
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
    newMatchCount,
    unreadMatchCount,
    updateDiscoveryFilter,
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

  if (petDraft.bio.trim().length > 500) {
    return 'Pet bio must be 500 characters or fewer.';
  }

  if (normalizeTemperament(petDraft.temperament).length > 10) {
    return 'Choose up to 10 temperament traits.';
  }

  return '';
}

function getNullableTrimmedValue(value) {
  const trimmedValue = value.trim();

  return trimmedValue || null;
}

function normalizeTemperament(values = []) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function normalizeDiscoveryFilters(filters) {
  return {
    breed: filters.breed.trim(),
    maxAge: filters.maxAge,
    minAge: filters.minAge,
    size: filters.size,
    type: filters.type,
    withPhotos: Boolean(filters.withPhotos)
  };
}

function getAppliedDiscoveryFilters(filters) {
  return {
    breed: filters.breed.trim(),
    maxAge: filters.maxAge,
    minAge: filters.minAge,
    size: filters.size,
    type: filters.type,
    withPhotos: filters.withPhotos
  };
}

function getDiscoveryFilterValidationError(filters) {
  const minAge = filters.minAge === '' ? null : Number(filters.minAge);
  const maxAge = filters.maxAge === '' ? null : Number(filters.maxAge);

  if ((minAge !== null && (Number.isNaN(minAge) || minAge < 0)) || (maxAge !== null && (Number.isNaN(maxAge) || maxAge < 0))) {
    return 'Use a valid age range.';
  }

  if (minAge !== null && maxAge !== null && minAge > maxAge) {
    return 'Minimum age must be less than or equal to maximum age.';
  }

  return '';
}

function areDiscoveryFiltersEqual(left = {}, right = {}) {
  return left.type === right.type
    && left.breed === right.breed
    && left.minAge === right.minAge
    && left.maxAge === right.maxAge
    && left.size === right.size
    && Boolean(left.withPhotos) === Boolean(right.withPhotos);
}

function toggleValue(values = [], value) {
  return values.includes(value)
    ? values.filter((currentValue) => currentValue !== value)
    : [...values, value];
}

const AUTO_BIO_FIELDS = new Set([
  'age',
  'breed',
  'gender',
  'size',
  'type'
]);

function withAutoPetBio(petDraft) {
  if (petDraft.isBioCustomized) {
    return petDraft;
  }

  return {
    ...petDraft,
    bio: getAutoPetBio(petDraft)
  };
}

function getAutoPetBio(petDraft) {
  const type = petDraft.type || 'pet';
  const breed = petDraft.breed?.trim();
  const age = petDraft.age !== '' && !Number.isNaN(Number(petDraft.age))
    ? Number(petDraft.age)
    : null;
  const gender = formatEnumLabel(petDraft.gender).toLowerCase();
  const size = formatEnumLabel(petDraft.size).toLowerCase();
  const temperament = normalizeTemperament(petDraft.temperament);
  const descriptionParts = [
    gender,
    size,
    breed,
    type
  ].filter(Boolean);
  const subject = descriptionParts.length > 0
    ? descriptionParts.join(' ')
    : type;
  const agePhrase = age === null
    ? ''
    : ` of age ${age}`;
  const temperamentPhrase = temperament.length > 0
    ? ` with ${formatList(temperament.map((trait) => trait.toLowerCase()))} temperament`
    : '';

  return `I am a ${subject}${agePhrase}${temperamentPhrase}.`;
}

function formatList(values) {
  if (values.length <= 1) {
    return values[0] || '';
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
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
    bio: pet.bio || '',
    city: pet.city || pet.location || '',
    emoji: getPetEmoji(pet.type),
    gender: pet.gender || '',
    genderLabel: formatEnumLabel(pet.gender),
    image: pet.primaryImage?.url || pet.imageUrl || '',
    location: pet.location || pet.city || '',
    owner: pet.owner || null,
    size: pet.size || '',
    sizeLabel: formatEnumLabel(pet.size),
    temperament: Array.isArray(pet.temperament) ? pet.temperament : []
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
    location: otherPet.location || otherPet.city || '',
    name: otherPet.name || 'Matched pet',
    owner: otherPet.owner || null,
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
    isNewMatch: Boolean(conversation.isNewMatch),
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

function normalizeMessagePage(response) {
  if (Array.isArray(response)) {
    return {
      messages: response,
      pagination: {
        hasMore: false,
        nextCursor: null
      }
    };
  }

  return {
    messages: Array.isArray(response?.messages) ? response.messages : [],
    pagination: {
      hasMore: Boolean(response?.pagination?.hasMore),
      nextCursor: response?.pagination?.nextCursor || null
    }
  };
}

async function sendMessageWithRealtimeFallback(socket, token, matchId, body) {
  if (!socket?.connected) {
    return sendMatchMessage(token, matchId, body);
  }

  return sendSocketMessage(socket, matchId, body);
}

function sendSocketMessage(socket, matchId, body) {
  return new Promise((resolve, reject) => {
    socket.timeout(5000).emit('message:send', { matchId, body }, (error, response) => {
      if (error) {
        reject(error);
        return;
      }

      if (!response?.success) {
        reject(new Error(response?.error || 'Could not send message'));
        return;
      }

      resolve(response.data);
    });
  });
}

function appendChatMessage(messagesByMatchId, matchId, message) {
  return {
    ...messagesByMatchId,
    [matchId]: appendMessageIfMissing(messagesByMatchId[matchId] || [], message)
  };
}

function appendMessageIfMissing(messages, message) {
  if (messages.some((existingMessage) => existingMessage.id === message.id)) {
    return messages;
  }

  return [...messages, message];
}

function mergeChatMessages(existingMessages, nextMessages) {
  const messagesById = new Map();

  existingMessages.forEach((message) => {
    messagesById.set(message.id, message);
  });
  nextMessages.forEach((message) => {
    messagesById.set(message.id, message);
  });

  return Array.from(messagesById.values()).sort((firstMessage, secondMessage) => (
    new Date(firstMessage.createdAt).getTime() - new Date(secondMessage.createdAt).getTime()
  ));
}

function updateMatchLastMessage(matches, matchId, message, currentUserId, options = {}) {
  const sentByCurrentUser = Boolean(currentUserId && message.senderUserId === currentUserId);
  const shouldMarkUnread = !sentByCurrentUser && !options.isCurrentChat;

  return matches.map((match) => (
    match.id === matchId
      ? {
          ...match,
          hasUnread: shouldMarkUnread ? true : false,
          isNewMatch: false,
          lastActivityAt: message.createdAt || match.updatedAt,
          lastMessage: message,
          lastMessagePreview: message.body || '',
          lastMessageSentByCurrentUser: sentByCurrentUser,
          unreadCount: shouldMarkUnread ? Number(match.unreadCount || 0) + 1 : 0,
          updatedAt: message.createdAt || match.updatedAt
        }
      : match
  ));
}

function mapPetToForm(pet) {
  return {
    age: String(pet.age),
    bio: pet.bio ?? '',
    breed: pet.breed ?? '',
    gender: pet.gender ?? '',
    id: pet.id,
    imageFile: null,
    imagePreviewUrl: '',
    imageUrl: pet.imageUrl ?? '',
    isBioCustomized: Boolean(pet.bio),
    name: pet.name ?? '',
    shouldDeleteImage: false,
    size: pet.size ?? '',
    temperament: Array.isArray(pet.temperament) ? pet.temperament : [],
    type: pet.type ?? 'Dog'
  };
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
