import { Handle, Position } from '@xyflow/react';

interface ResourceNodeProps {
  data: {
    name: string;
    status: string;
    details: Record<string, any>;
  };
}

export const ResourceNode = ({ data }: ResourceNodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border">
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col gap-1">
        <div className="text-lg font-bold">{data.name}</div>
        <div className="text-sm text-gray-500">{data.status}</div>
        {Object.entries(data.details).map(([key, value]) => (
          <div key={key} className="text-xs text-gray-600">
            {key}: {Array.isArray(value) ? value.join(', ') : value.toString()}
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
