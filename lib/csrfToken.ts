let csrfToken: string | null = null;
let tokenTimestamp: number | null = null;

export const getCsrfToken = async (): Promise<string> => {
  const currentTime = Date.now();
  if (!csrfToken || !tokenTimestamp || currentTime - tokenTimestamp > 3600000) {
    // 1 hour
    try {
      const response = await fetch('/api/csrf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        csrfToken = data.csrfToken;
        tokenTimestamp = currentTime;
      } else {
        throw new Error('Failed to fetch CSRF token');
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  }
  return csrfToken as string;
};
