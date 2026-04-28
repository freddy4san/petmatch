import { fireEvent, render, screen } from '@testing-library/react';

import { ChatPage, MatchesPage } from './MatchesPages';

function createMatch(overrides = {}) {
  return {
    breed: 'Corgi',
    emoji: 'P',
    id: 'match-1',
    image: '',
    lastMessage: null,
    name: 'Milo',
    type: 'Dog',
    updatedAt: '2026-04-23T10:00:00.000Z',
    ...overrides
  };
}

function createBaseApp(overrides = {}) {
  return {
    chatMessages: {},
    currentChatPet: null,
    handleSendMessage: jest.fn(),
    isMatchesLoading: false,
    isMessagesLoading: false,
    isSendingMessage: false,
    matches: [],
    matchesError: '',
    messagesError: '',
    newMessage: '',
    openChat: jest.fn(),
    setCurrentScreen: jest.fn(),
    setNewMessage: jest.fn(),
    ...overrides
  };
}

describe('MatchesPage', () => {
  it('shows a conversations loading state', () => {
    render(<MatchesPage app={createBaseApp({ isMatchesLoading: true })} />);

    expect(screen.getByText(/loading conversations/i)).toBeInTheDocument();
  });

  it('shows an empty state when there are no conversations', () => {
    render(<MatchesPage app={createBaseApp()} />);

    expect(screen.getByText(/no matches yet/i)).toBeInTheDocument();
  });

  it('shows conversation errors without also showing the empty state', () => {
    render(<MatchesPage app={createBaseApp({ matchesError: 'Could not load conversations' })} />);

    expect(screen.getByText('Could not load conversations')).toBeInTheDocument();
    expect(screen.queryByText(/no matches yet/i)).not.toBeInTheDocument();
  });

  it('opens a chat from a conversation row', () => {
    const match = createMatch();
    const openChat = jest.fn();

    render(<MatchesPage app={createBaseApp({ matches: [match], openChat })} />);
    fireEvent.click(screen.getByText(/milo & owner/i));

    expect(openChat).toHaveBeenCalledWith(match);
  });

  it('shows unread counts and last message previews', () => {
    render(<MatchesPage app={createBaseApp({
      matches: [
        createMatch({
          hasUnread: true,
          lastMessagePreview: 'Are you free for a walk?',
          unreadCount: 3
        })
      ],
      unreadMatchCount: 3
    })} />);

    expect(screen.getByText('Unread (3)')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Are you free for a walk?')).toBeInTheDocument();
  });
});

describe('ChatPage', () => {
  it('shows a message loading state', () => {
    render(<ChatPage app={createBaseApp({ currentChatPet: createMatch(), isMessagesLoading: true })} />);

    expect(screen.getByText(/loading messages/i)).toBeInTheDocument();
  });

  it('shows an empty message state', () => {
    render(<ChatPage app={createBaseApp({ currentChatPet: createMatch() })} />);

    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('shows a message error without also showing the empty state', () => {
    render(<ChatPage app={createBaseApp({
      currentChatPet: createMatch(),
      messagesError: 'Could not load messages'
    })} />);

    expect(screen.getByText('Could not load messages')).toBeInTheDocument();
    expect(screen.queryByText(/no messages yet/i)).not.toBeInTheDocument();
  });

  it('renders message bubbles and submits the draft', () => {
    const handleSendMessage = jest.fn();

    const { container } = render(<ChatPage app={createBaseApp({
      chatMessages: {
        'match-1': [
          {
            id: 'message-1',
            sent: true,
            text: 'Hello there',
            time: '10:15 AM'
          }
        ]
      },
      currentChatPet: createMatch(),
      handleSendMessage,
      newMessage: 'A new hello'
    })} />);

    expect(screen.getByText('Hello there')).toBeInTheDocument();

    const submitButton = container.querySelector('button[type="submit"]');
    fireEvent.click(submitButton);

    expect(handleSendMessage).toHaveBeenCalledTimes(1);
  });

  it('disables sending while a message is being sent', () => {
    const { container } = render(<ChatPage app={createBaseApp({
      currentChatPet: createMatch(),
      isSendingMessage: true,
      newMessage: 'Please wait'
    })} />);

    expect(screen.getByPlaceholderText(/type a message/i)).toBeDisabled();
    expect(container.querySelector('button[type="submit"]')).toBeDisabled();
  });
});
