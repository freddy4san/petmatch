import { apiFetch, getAuthHeaders } from '../../shared/lib/apiClient';

export function createInteraction(token, data) {
  return apiFetch('/interactions', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data)
  });
}
