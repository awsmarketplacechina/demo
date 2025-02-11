import { ResourceDiscoveryRequest, ResourceDiscoveryResponse } from '../types';

class ResourceAPI {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3000';
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async discoverResources(request: ResourceDiscoveryRequest): Promise<ResourceDiscoveryResponse> {
    const response = await fetch(`${this.baseUrl}/resources/discover`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Resource discovery failed');
    }

    return response.json();
  }

  async validateResources(resources: any[]): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/resources/validate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ resources }),
    });

    return response.ok;
  }
}

export const resourceAPI = new ResourceAPI();
