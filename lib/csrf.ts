import { randomBytes } from 'crypto';
import serverStore from './server-store';

const TOKEN_EXPIRATION = 3600; // 1 hour in seconds

function setCSRFToken(token: string, expirationTime: number) {
  serverStore.set(`csrf:${token}`, { expirationTime } as any, TOKEN_EXPIRATION);
}

export async function generateCSRFToken(): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expirationTime = Date.now() + TOKEN_EXPIRATION * 1000;
  setCSRFToken(token, expirationTime);
  return token;
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  const data = serverStore.get(`csrf:${token}`) as { expirationTime: number } | null;
  if (data && typeof data.expirationTime === 'number') {
    if (Date.now() < data.expirationTime) {
      return true;
    }
    serverStore.delete(`csrf:${token}`);
  }
  return false;
}

export async function rotateCSRFToken(oldToken: string): Promise<string | null> {
  if (await validateCSRFToken(oldToken)) {
    serverStore.delete(`csrf:${oldToken}`);
    return generateCSRFToken();
  }
  return null;
}
