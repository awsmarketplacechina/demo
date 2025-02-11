import { LoginCredentials, AuthResponse } from '../types';

class AuthAPI {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3000';
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mock implementation for testing
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Accept any username/password combination for mock usage
    return {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        username: credentials.username,
        role: 'user'
      }
    };
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return;

    await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    localStorage.removeItem('token');
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const authAPI = new AuthAPI();
