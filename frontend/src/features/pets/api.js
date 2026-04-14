import { apiFetch } from '../../shared/lib/apiClient';

function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export function getUserPets(token) {
  return apiFetch('/pets', {
    headers: getAuthHeaders(token)
  });
}

export function createPet(token, data) {
  return apiFetch('/pets', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data)
  });
}

export function updatePet(token, petId, data) {
  return apiFetch(`/pets/${petId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data)
  });
}

export function deletePet(token, petId) {
  return apiFetch(`/pets/${petId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });
}
