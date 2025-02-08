import { DeployedResource, ResourceNode, ResourceEdge } from '../types/resources';

export const mockDeployedResources: DeployedResource[] = [
  {
    id: 'iam-1',
    name: 'IAM用户1',
    type: 'iam',
    status: '已部署',
    details: {
      permissions: ['AWSFullAccess', 'EC2FullAccess'],
      mfa: '已启用',
      groups: ['管理员组']
    },
    connections: ['network-1']
  },
  {
    id: 'network-1',
    name: 'VPC配置',
    type: 'network',
    status: '已部署',
    details: {
      cidr: '10.0.0.0/16',
      subnets: ['10.0.1.0/24', '10.0.2.0/24'],
      region: 'ap-southeast-1'
    },
    connections: ['compute-1', 'storage-1']
  },
  {
    id: 'compute-1',
    name: 'EC2实例组',
    type: 'compute',
    status: '已部署',
    details: {
      instanceType: 't2.large',
      autoScaling: '已启用',
      minInstances: 2,
      maxInstances: 6
    },
    connections: ['storage-1']
  },
  {
    id: 'storage-1',
    name: 'S3存储桶',
    type: 'storage',
    status: '已部署',
    details: {
      bucketType: '标准存储',
      versioning: '已启用',
      encryption: 'AWS-KMS'
    },
    connections: []
  }
];

// Position nodes in a logical layout
export const mockNodes: ResourceNode[] = mockDeployedResources.map((resource, index) => ({
  ...resource,
  position: {
    x: 100 + (index % 2) * 300,
    y: 100 + Math.floor(index / 2) * 200
  }
}));

// Create edges between connected nodes
export const mockEdges: ResourceEdge[] = mockDeployedResources.flatMap(resource =>
  resource.connections.map(targetId => ({
    id: `${resource.id}-${targetId}`,
    source: resource.id,
    target: targetId,
    type: 'dependency',
    animated: true,
    style: { stroke: '#2563eb' }
  }))
);

// Resource type specific layouts
export const resourceTypePositions = {
  iam: { x: 100, y: 100 },
  network: { x: 400, y: 100 },
  compute: { x: 100, y: 300 },
  storage: { x: 400, y: 300 }
};
