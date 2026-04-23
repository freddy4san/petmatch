const API_BASE_URL = normalizeApiBaseUrl(
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api'
);

export async function apiFetch(path, options = {}) {
  const { headers, ...restOptions } = options;
  const isFormData = typeof FormData !== 'undefined' && restOptions.body instanceof FormData;

  const response = await fetch(buildApiUrl(path), {
    ...restOptions,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {})
    }
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload));
  }

  return payload?.data;
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
