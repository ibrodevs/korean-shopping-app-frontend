import Constants from 'expo-constants';

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

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
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
