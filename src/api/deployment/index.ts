import { DeploymentRequest, DeploymentResponse } from '../types';

class DeploymentAPI {
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

  async startDeployment(request: DeploymentRequest): Promise<DeploymentResponse> {
    const response = await fetch(`${this.baseUrl}/deployment/start`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Deployment failed to start');
    }

    return response.json();
  }

  async getDeploymentStatus(deploymentId: string): Promise<DeploymentResponse> {
    const response = await fetch(`${this.baseUrl}/deployment/${deploymentId}/status`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch deployment status');
    }

    return response.json();
  }
}

export const deploymentAPI = new DeploymentAPI();
