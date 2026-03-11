import { API_BASE_URL, ApiError, extractApiErrorMessage, requestJson } from './client';

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

export { API_BASE_URL, ApiError, extractApiErrorMessage };

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
