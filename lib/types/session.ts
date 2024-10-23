// lib/types/session.ts
export interface SessionData {
  primary_email: string;
  registrationId: string;
}

/**
 * Checks if the provided session object is a valid SessionData.
 *
 * @param session - The session object to validate.
 * @returns A boolean indicating whether the session is valid.
 */
export function hasValidSession(session: unknown): session is SessionData {
  if (!session || typeof session !== 'object') return false;

  const typedSession = session as SessionData;
  return (
    typeof typedSession.primary_email === 'string' &&
    typeof typedSession.registrationId === 'string' &&
    typedSession.primary_email.length > 0 &&
    typedSession.registrationId.length > 0
  );
}
