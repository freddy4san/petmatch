import { apiFetch, getAuthHeaders } from '../../shared/lib/apiClient';

export function getMatches(token) {
  return apiFetch('/matches', {
    headers: getAuthHeaders(token)
  });
}

export function getConversations(token) {
  return apiFetch('/conversations', {
    headers: getAuthHeaders(token)
  });
}

export const getMatchConversations = getConversations;

export function markConversationRead(token, conversationId) {
  return apiFetch(`/conversations/${conversationId}/read`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({})
  });
}

export function getMatchMessages(token, matchId, options = {}) {
  const params = new URLSearchParams();

  if (options.limit) {
    params.set('limit', String(options.limit));
  }

  if (options.before) {
    params.set('before', options.before);
  }

  const queryString = params.toString();

  return apiFetch(`/matches/${matchId}/messages${queryString ? `?${queryString}` : ''}`, {
    headers: getAuthHeaders(token)
  });
}

export function sendMatchMessage(token, matchId, body) {
  return apiFetch(`/matches/${matchId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ body })
  });
}
