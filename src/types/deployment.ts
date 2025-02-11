export type ResourceType = 'ram' | 'network' | 'compute' | 'storage';

export type DeploymentStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export type VerificationPhase = 'testing' | 'preview' | 'deployment' | 'complete';

export type CheckPhase = 'source_permission' | 'aws_permission' | 'source_resources' | 'complete';

export interface ResourceConfig {
  id: string;
  name: string;
  type: ResourceType;
  platform: 'alicloud' | 'aws';
  region: string;
  config: Record<string, any>;
  dependencies?: string[];
  tags?: Record<string, string>;
}

export interface ResourceProgress {
  steps: string[];
  currentStep: number;
  status: DeploymentStatus;
  resource: ResourceConfig;
  logs: string[];
  error?: string;
}

export interface DeploymentProgress {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  startTime: string;
  endTime?: string;
  resources: {
    ram: ResourceProgress;
    network: ResourceProgress;
    compute: ResourceProgress;
    storage: ResourceProgress;
  };
  error?: string;
}

export interface FormData {
  projectName: string;
  sourcePlatform: string;
  sourceAccount: string;
  sourceAK: string;
  sourceSK: string;
  awsAccount: string;
  awsAK: string;
  awsSK: string;
  sourceRegion: string;
  targetRegion: string;
  githubUrl: string;
}
