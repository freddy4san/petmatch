import { apiFetch, getAuthHeaders } from '../../shared/lib/apiClient';

export function getDiscoveryPets(token, {
  breed,
  cursor,
  fromPetId,
  limit = 10,
  maxAge,
  minAge,
  size,
  type,
  withPhotos
} = {}) {
  const params = new URLSearchParams({
    limit: String(limit)
  });

  if (cursor) {
    params.set('cursor', cursor);
  }

  if (fromPetId) {
    params.set('fromPetId', fromPetId);
  }

  if (type) {
    params.set('type', type);
  }

  if (breed) {
    params.set('breed', breed);
  }

  if (minAge !== '' && minAge !== null && minAge !== undefined) {
    params.set('minAge', String(minAge));
  }

  if (maxAge !== '' && maxAge !== null && maxAge !== undefined) {
    params.set('maxAge', String(maxAge));
  }

  if (size) {
    params.set('size', size);
  }

  if (withPhotos) {
    params.set('withPhotos', 'true');
  }

  return apiFetch(`/discovery?${params.toString()}`, {
    headers: getAuthHeaders(token)
  });
}
