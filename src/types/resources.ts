export type ResourceType = 'iam' | 'network' | 'compute' | 'storage';

export type ResourceStatus = '已部署' | '部署中' | '等待中' | '失败';

export interface DeployedResource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  details: Record<string, any>;
  connections: string[];
}

export interface ResourceConnection {
  id: string;
  source: string;
  target: string;
  type: 'network' | 'permission' | 'dependency';
  label?: string;
}

export interface ResourcePosition {
  x: number;
  y: number;
}

export interface ResourceNode extends DeployedResource {
  position: ResourcePosition;
}

export interface ResourceEdge extends ResourceConnection {
  animated?: boolean;
  style?: Record<string, any>;
}
