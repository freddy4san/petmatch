const API_BASE_URL = normalizeApiBaseUrl(
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api'
);
const UNAUTHORIZED_EVENT_NAME = 'petmatch:unauthorized';

export async function apiFetch(path, options = {}) {
  const { headers, ...restOptions } = options;
  const isFormData = typeof FormData !== 'undefined' && restOptions.body instanceof FormData;
  const requestHeaders = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(headers || {})
  };

  const response = await fetch(buildApiUrl(path), {
    ...restOptions,
    headers: requestHeaders
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && requestHeaders.Authorization) {
      notifyUnauthorized();
    }

    const error = new Error(getApiErrorMessage(payload));
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }

  return payload?.data;
}

export function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function normalizeApiBaseUrl(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function getApiErrorMessage(payload) {
  if (Array.isArray(payload?.details) && payload.details.length > 0) {
    return payload.details.map((detail) => detail.message).join(' ');
  }

  return payload?.error || 'Request failed';
}

function notifyUnauthorized() {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
    return;
  }

  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT_NAME));
}
