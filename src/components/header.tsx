import { type FC } from 'react';

interface HeaderProps {
  activeTab: 'todo' | 'api' | 'owner';
  onTabSwitch: (tab: 'todo' | 'api' | 'owner') => void;
}

export const Header: FC<HeaderProps> = ({ activeTab, onTabSwitch }) => {
  return (
    <div className="flex space-x-4 border-b border-zinc-200 p-4">
      <button
        className={`px-4 py-2 font-medium ${
          activeTab === 'todo'
            ? 'border-b-2 border-zinc-900 text-zinc-900'
            : 'text-zinc-500 hover:text-zinc-700'
        }`}
        onClick={() => onTabSwitch('todo')}
      >
        ToDo List
      </button>
      <button
        className={`px-4 py-2 font-medium ${
          activeTab === 'api'
            ? 'border-b-2 border-zinc-900 text-zinc-900'
            : 'text-zinc-500 hover:text-zinc-700'
        }`}
        onClick={() => onTabSwitch('api')}
      >
        API Gateway Demo
      </button>
      <button
        className={`px-4 py-2 font-medium ${
          activeTab === 'owner'
            ? 'border-b-2 border-zinc-900 text-zinc-900'
            : 'text-zinc-500 hover:text-zinc-700'
        }`}
        onClick={() => onTabSwitch('owner')}
      >
        Owner View
      </button>
    </div>
  );
};
