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

export function getMatchMessages(token, matchId) {
  return apiFetch(`/matches/${matchId}/messages`, {
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
