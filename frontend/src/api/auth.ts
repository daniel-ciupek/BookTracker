import type { AuthUser } from '../types/auth'

const TOKEN_KEY = 'bt_token'
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function authRequest<T>(
  path: string,
  body: object,
  method = 'POST',
  token?: string,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data as T
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  return authRequest('/api/login', { email, password })
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  return authRequest('/api/register', { name, email, password })
}

export async function logout(token: string): Promise<void> {
  await fetch(`${BASE}/api/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
}

export async function me(token: string): Promise<AuthUser> {
  const res = await fetch(`${BASE}/api/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Unauthorized')
  return res.json() as Promise<AuthUser>
}

export function forgotPassword(email: string): Promise<void> {
  return authRequest('/api/forgot-password', { email })
}

export function resetPassword(
  token: string,
  email: string,
  password: string,
): Promise<void> {
  return authRequest('/api/reset-password', {
    token,
    email,
    password,
    password_confirmation: password,
  })
}

export function updateProfile(
  data: { name?: string; email?: string },
  authToken: string,
): Promise<AuthUser> {
  return authRequest<AuthUser>('/api/user', data, 'PATCH', authToken)
}

export function changePassword(
  currentPassword: string,
  newPassword: string,
  authToken: string,
): Promise<void> {
  return authRequest(
    '/api/user/password',
    {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPassword,
    },
    'PUT',
    authToken,
  )
}
