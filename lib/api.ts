// Thin API client - calls FastAPI when reachable, otherwise returns mocks for non-chat data.
// Set EXPO_PUBLIC_API_BASE in .env/app config. Example: http://192.168.1.6:8000

const rawApiBase =
  (typeof process !== 'undefined' && (process as any).env?.EXPO_PUBLIC_API_BASE) ||
  'http://localhost:8000';

const API_BASE = String(rawApiBase).replace(/^["']|["']$/g, '').replace(/\/$/, '');

async function safeFetch<T>(path: string, init?: RequestInit, fallback?: T): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (e) {
    console.error('API Fetch Error (' + path + '):', e);
    return fallback ?? null;
  }
}

export const api = {
  createUser: (email: string, name: string) =>
    safeFetch('/users', { method: 'POST', body: JSON.stringify({ email, name }) }, { id: Date.now(), email, name }),

  analyze: (userId: number, bbt: number, lh: number) =>
    safeFetch(
      '/analyze',
      {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, bbt_temp: bbt, lh_ratio: lh }),
      },
      mockAnalyze(bbt, lh),
    ),

  chat: (messages: {role: string, content: string}[]) =>
    safeFetch<{status: string, reply?: string, message?: string}>(
      '/chat',
      {
        method: 'POST',
        body: JSON.stringify({ messages }),
      },
      {
        status: 'error',
        message: `Could not reach backend at ${API_BASE}. Start FastAPI and check EXPO_PUBLIC_API_BASE.`,
      },
    ),
};

function mockAnalyze(bbt: number, lh: number) {
  if (lh >= 1.0 && bbt < 36.5) {
    return {
      status: 'success',
      verdict: 'False Surge Detected',
      advice: 'LH is high but temperature is low. This is common in PCOS - avoid HIIT today, try anti-inflammatory foods.',
    };
  }
  if (lh >= 1.0 && bbt >= 36.6) {
    return {
      status: 'success',
      verdict: 'Ovulation Confirmed',
      advice: 'Your temperature has risen. Focus on magnesium-rich foods today.',
    };
  }
  return { status: 'success', verdict: 'Normal', advice: 'Keep tracking daily - patterns take time to emerge.' };
}
