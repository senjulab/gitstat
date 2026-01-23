/**
 * Get the base URL for the application
 * In production, uses NEXT_PUBLIC_APP_URL environment variable
 * In development/client-side, falls back to window.location.origin
 */
export function getAppUrl(): string {
  // Server-side or when env var is set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Client-side fallback
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Default fallback (shouldn't happen in practice)
  return 'http://localhost:3000';
}
