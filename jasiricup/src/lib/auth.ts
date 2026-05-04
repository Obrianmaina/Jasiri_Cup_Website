// src/lib/auth.ts
// NOTE: Do NOT set/read auth cookies from the client side.
// Auth cookies are set exclusively server-side via /api/admin/auth/route.ts
// This file is intentionally left minimal to avoid accidental misuse.

// Use this only to check if the user appears logged in (for UI purposes only)
// The real auth check always happens server-side via middleware.ts
export const isAdminLoggedIn = (): boolean => {
  if (typeof document === 'undefined') return false;
  // We cannot read httpOnly cookies from JS - this is intentional for security.
  // Instead, we rely on the server redirect in middleware.ts
  return false;
};