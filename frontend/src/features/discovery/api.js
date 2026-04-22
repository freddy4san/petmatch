import { apiFetch } from '../../shared/lib/apiClient';

function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export function getDiscoveryPets(token, { limit = 10 } = {}) {
  return apiFetch(`/discovery?limit=${limit}`, {
    headers: getAuthHeaders(token)
  });
}
