import { apiFetch, getAuthHeaders } from '../../shared/lib/apiClient';

export function getDiscoveryPets(token, { cursor, fromPetId, limit = 10 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit)
  });

  if (cursor) {
    params.set('cursor', cursor);
  }

  if (fromPetId) {
    params.set('fromPetId', fromPetId);
  }

  return apiFetch(`/discovery?${params.toString()}`, {
    headers: getAuthHeaders(token)
  });
}
