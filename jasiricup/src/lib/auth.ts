// src/lib/auth.ts
export const setAdminToken = (token: string) => {
  document.cookie = `admin-token=${token}; path=/; max-age=86400; secure; samesite=strict`;
};

export const removeAdminToken = () => {
  document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export const getAdminToken = () => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'admin-token') {
      return value;
    }
  }
  return null;
};