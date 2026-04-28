const AUTH_STORAGE_KEY = 'petmatch-auth-session';

export function readStoredAuthSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function storeAuthSession(session) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function hasStoredAuthSession() {
  return Boolean(readStoredAuthSession()?.token);
}
