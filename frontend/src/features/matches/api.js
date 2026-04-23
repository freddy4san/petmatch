import { apiFetch } from '../../shared/lib/apiClient';

function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

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
