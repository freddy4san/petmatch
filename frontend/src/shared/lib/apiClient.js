const API_BASE_URL = normalizeApiBaseUrl(
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api'
);

export async function apiFetch(path, options = {}) {
  const { headers, ...restOptions } = options;

  const response = await fetch(buildApiUrl(path), {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    }
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed');
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
