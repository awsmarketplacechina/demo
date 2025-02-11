// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

// Resource Discovery Types
export interface ResourceDiscoveryRequest {
  platform: 'alicloud';
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region?: string;
  };
}

export interface ResourceDiscoveryResponse {
  resources: {
    ram: any[];
    network: any[];
    compute: any[];
    storage: any[];
  };
  metadata: {
    timestamp: string;
    region: string;
  };
}

// Deployment Types
export interface DeploymentRequest {
  projectId: string;
  resources: {
    type: 'ram' | 'network' | 'compute' | 'storage';
    source: any;
    target: any;
  }[];
}

export interface DeploymentResponse {
  deploymentId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  resources: {
    type: string;
    status: string;
    details: any;
  }[];
}
