// Guest mode storage utilities
const GUEST_KEY = 'anchor_guest_profile';
const GUEST_FLAG = 'anchor_is_guest';

export const isGuestMode = () => localStorage.getItem(GUEST_FLAG) === 'true';

export const saveGuestProfile = (data) => {
  localStorage.setItem(GUEST_KEY, JSON.stringify(data));
};

export const loadGuestProfile = () => {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setGuestMode = (value) => {
  localStorage.setItem(GUEST_FLAG, value ? 'true' : 'false');
};

export const clearGuestData = () => {
  localStorage.removeItem(GUEST_KEY);
  localStorage.removeItem(GUEST_FLAG);
};