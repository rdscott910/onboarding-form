/**
 * This mechanism helps protect against CSRF (Cross-Site Request Forgery) attacks by ensuring
 * that each request requiring CSRF protection includes a valid, one-time-use token.
 */
import { randomBytes } from 'crypto';
import serverStore from './server-store';

const TOKEN_EXPIRATION = 3600; // 1 hour in seconds

/**
 * Generates a CSRF token.
 *
 * @returns A promise that resolves to a string representing the generated CSRF token.
 */
export async function generateCSRFToken(): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expirationTime = Date.now() + TOKEN_EXPIRATION * 1000;
  serverStore.set(`csrf:${token}`, expirationTime, TOKEN_EXPIRATION);
  return token;
}

/**
 * Validates the CSRF token.
 *
 * @param token - The CSRF token to validate.
 * @returns A promise that resolves to a boolean indicating whether the token is valid or not.
 */
export async function validateCSRFToken(token: string): Promise<boolean> {
  const expirationTime = serverStore.get(`csrf:${token}`);
  if (expirationTime && typeof expirationTime === 'number') {
    if (Date.now() < expirationTime) {
      return true;
    }
    serverStore.delete(`csrf:${token}`);
  }
  return false;
}

/**
 * Rotates the CSRF token.
 *
 * @param oldToken - The old CSRF token.
 * @returns A promise that resolves to the new CSRF token, or null if the old token is invalid.
 */
export async function rotateCSRFToken(oldToken: string): Promise<string | null> {
  if (await validateCSRFToken(oldToken)) {
    serverStore.delete(`csrf:${oldToken}`);
    return generateCSRFToken();
  }
  return null;
}
