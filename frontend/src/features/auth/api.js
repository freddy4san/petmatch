import { apiFetch, getAuthHeaders } from '../../shared/lib/apiClient';

export function registerUser(data) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function loginUser(data) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function getCurrentUser(token) {
  return apiFetch('/auth/me', {
    headers: getAuthHeaders(token)
  });
}
