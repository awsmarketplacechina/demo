export type ResourceType = 'ram' | 'network' | 'compute' | 'storage';

export type DeploymentStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export type VerificationPhase = 'testing' | 'preview' | 'deployment' | 'complete';

export type CheckPhase = 'source_permission' | 'aws_permission' | 'source_resources' | 'complete';

export interface ResourceProgress {
  steps: string[];
  currentStep: number;
  status: DeploymentStatus;
}

export interface DeploymentProgress {
  ram: ResourceProgress;
  network: ResourceProgress;
  compute: ResourceProgress;
  storage: ResourceProgress;
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
}
