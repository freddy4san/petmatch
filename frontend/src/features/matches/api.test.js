import { getConversations, getMatchMessages, markConversationRead, sendMatchMessage } from './api';

function mockApiResponse(data) {
  global.fetch.mockResolvedValueOnce({
    json: async () => ({ success: true, data }),
    ok: true
  });
}

describe('matches chat api', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches conversations with auth headers', async () => {
    mockApiResponse([{ id: 'conversation-1' }]);

    await expect(getConversations('token-1')).resolves.toEqual([{ id: 'conversation-1' }]);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/conversations',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-1'
        })
      })
    );
  });

  it('fetches messages for a match', async () => {
    mockApiResponse([{ id: 'message-1', body: 'Hello' }]);

    await expect(getMatchMessages('token-1', 'match-1')).resolves.toEqual([
      { id: 'message-1', body: 'Hello' }
    ]);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/matches/match-1/messages',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-1'
        })
      })
    );
  });

  it('marks a conversation as read', async () => {
    mockApiResponse({ conversationId: 'conversation-1', unreadCount: 0 });

    await expect(markConversationRead('token-1', 'conversation-1')).resolves.toEqual({
      conversationId: 'conversation-1',
      unreadCount: 0
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/conversations/conversation-1/read',
      expect.objectContaining({
        body: JSON.stringify({}),
        headers: expect.objectContaining({
          Authorization: 'Bearer token-1',
          'Content-Type': 'application/json'
        }),
        method: 'POST'
      })
    );
  });

  it('sends a message body to the backend', async () => {
    mockApiResponse({ id: 'message-1', body: 'Hello' });

    await expect(sendMatchMessage('token-1', 'match-1', 'Hello')).resolves.toEqual({
      id: 'message-1',
      body: 'Hello'
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/matches/match-1/messages',
      expect.objectContaining({
        body: JSON.stringify({ body: 'Hello' }),
        headers: expect.objectContaining({
          Authorization: 'Bearer token-1',
          'Content-Type': 'application/json'
        }),
        method: 'POST'
      })
    );
  });
});
