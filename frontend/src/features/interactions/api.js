import { apiFetch } from '../../shared/lib/apiClient';

function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export function createInteraction(token, data) {
  return apiFetch('/interactions', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data)
  });
}
