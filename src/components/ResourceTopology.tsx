import { ReactFlow, Node, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ResourceNode } from './nodes/ResourceNode';
import { mockDeployedResources, mockEdges } from '../mocks/resources';
import { convertToCloudFormation, formatCloudFormation } from '../utils/cloudformation';
import { DeployedResource } from '../types/resources';

type ResourceNodeData = {
  name: string;
  status: string;
  details: Record<string, any>;
  cloudformation: string;
} & Record<string, unknown>;

type CustomNode = Node<ResourceNodeData>;
type CustomNodeTypes = NodeTypes & {
  resourceNode: typeof ResourceNode;
};

const nodeTypes: CustomNodeTypes = {
  resourceNode: ResourceNode,
};

const createResourceNode = (resource: DeployedResource, index: number): CustomNode => {
  const template = convertToCloudFormation(resource);
  return {
    id: resource.id,
    type: 'resourceNode',
    data: {
      name: resource.name,
      status: resource.status,
      details: resource.details,
      cloudformation: formatCloudFormation(template)
    },
    position: {
      x: 100 + (index % 2) * 300,
      y: 100 + Math.floor(index / 2) * 200
    }
  };
};

export const ResourceTopology = () => {
  const nodes = mockDeployedResources.map(createResourceNode);

  return (
    <div className="w-full h-[500px] border rounded-lg">
      <ReactFlow 
        nodes={nodes}
        edges={mockEdges}
        nodeTypes={nodeTypes}
        fitView
      />
    </div>
  );
};
