import Constants from 'expo-constants';

type BackendUser = {
  id?: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  photo?: string | null;
};

type AuthTokens = {
  access: string;
  refresh: string;
};

type AuthResponse = {
  user: BackendUser;
  tokens: AuthTokens;
};

export type ApiErrorShape = {
  detail?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  payload: ApiErrorShape | null;

  constructor(message: string, status: number, payload: ApiErrorShape | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function inferBaseUrlFromExpoHost(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    ((Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } }).manifest2
      ?.extra?.expoGo?.debuggerHost ??
      (Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost ??
      '');
  const host = hostUri.split(':')[0]?.trim();
  if (!host) return 'http://127.0.0.1:8000';
  return `http://${host}:8000`;
}

export const API_BASE_URL = stripTrailingSlash(
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || inferBaseUrlFromExpoHost(),
);

function parseErrorMessage(payload: ApiErrorShape | null): string {
  if (!payload) return 'Request failed. Please try again.';
  if (typeof payload.detail === 'string' && payload.detail.trim()) return payload.detail;

  for (const value of Object.values(payload)) {
    if (typeof value === 'string' && value.trim()) return value;
    if (Array.isArray(value) && value.length && typeof value[0] === 'string') return value[0];
  }

  return 'Request failed. Please try again.';
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorPayload = payload && typeof payload === 'object' ? (payload as ApiErrorShape) : null;
    throw new ApiError(parseErrorMessage(errorPayload), response.status, errorPayload);
  }

  return payload as T;
}

export function extractApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  return requestJson<AuthResponse>('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
}

export async function googleAuthRequest(params: {
  idToken?: string;
  accessToken?: string;
}): Promise<AuthResponse> {
  const payload: Record<string, string> = {};
  if (params.idToken) payload.id_token = params.idToken;
  if (params.accessToken) payload.access_token = params.accessToken;

  return requestJson<AuthResponse>('/api/auth/google/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function registerRequest(params: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return requestJson<AuthResponse>('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      first_name: params.firstName.trim(),
      last_name: params.lastName.trim(),
      email: params.email.trim().toLowerCase(),
      password: params.password,
      password_confirm: params.password,
    }),
  });
}

export async function meRequest(accessToken: string): Promise<BackendUser> {
  return requestJson<BackendUser>('/api/auth/me/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await requestJson<{ access: string }>('/api/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken }),
  });
  return response.access;
}

export async function logoutRequest(accessToken: string, refreshToken: string): Promise<void> {
  await requestJson<{ detail: string }>('/api/auth/logout/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });
}

export type { AuthResponse, BackendUser, AuthTokens };
