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
