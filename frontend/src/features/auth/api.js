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

export function updateCurrentUser(token, data) {
  return apiFetch('/auth/me', {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data)
  });
}

export function resendVerificationEmail(token) {
  return apiFetch('/auth/resend-verification', {
    method: 'POST',
    headers: getAuthHeaders(token)
  });
}

export function verifyEmail(token) {
  const params = new URLSearchParams({ token });

  return apiFetch(`/auth/verify-email?${params.toString()}`);
}
