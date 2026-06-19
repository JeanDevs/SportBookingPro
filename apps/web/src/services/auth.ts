const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3002';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message ?? 'Credenciales inválidas.');
  }

  return (await response.json()) as AuthResponse;
}

export function saveSession(authResponse: AuthResponse) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('app-deporte-token', authResponse.token);
  localStorage.setItem('app-deporte-user', JSON.stringify(authResponse.user));
}

export function logout() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('app-deporte-token');
  localStorage.removeItem('app-deporte-user');
}

export function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem('app-deporte-token');
  const rawUser = localStorage.getItem('app-deporte-user');

  if (!token || !rawUser) {
    return null;
  }

  return {
    token,
    user: JSON.parse(rawUser) as AuthUser,
  };
}
