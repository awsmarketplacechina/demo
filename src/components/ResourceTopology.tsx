import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ResourceNode } from './nodes/ResourceNode';

interface ResourceNode {
  id: string;
  type: 'iam' | 'network' | 'compute' | 'storage';
  data: {
    name: string;
    status: string;
    details: Record<string, any>;
  };
  position: { x: number; y: number };
}

const nodeTypes = {
  resourceNode: ResourceNode,
};

export const ResourceTopology = () => {
  // Mock nodes for testing
  const initialNodes = [
    {
      id: 'iam-1',
      type: 'resourceNode',
      data: { 
        name: 'IAM用户1', 
        status: '已部署',
        details: {
          permissions: ['AWSFullAccess']
        }
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'network-1',
      type: 'resourceNode',
      data: { 
        name: 'VPC配置', 
        status: '已部署',
        details: {
          cidr: '10.0.0.0/16'
        }
      },
      position: { x: 100, y: 250 },
    },
  ];

  const initialEdges = [
    {
      id: 'e1-2',
      source: 'iam-1',
      target: 'network-1',
      animated: true,
    },
  ];

  return (
    <div className="w-full h-[500px] border rounded-lg">
      <ReactFlow 
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
      />
    </div>
  );
};
