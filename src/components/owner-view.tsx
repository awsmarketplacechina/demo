import { useState } from 'react';
import { TodoTable } from './todo-table';
import { TodoItem } from '../types/todo';

interface OwnerViewProps {
  data: TodoItem[];
  ownerName?: string;
}

export function OwnerView({ data, ownerName = 'John Doe' }: OwnerViewProps) {
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateTask = async (taskId: string, updatedStatus: string, updatedComments: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://dummy-api-gateway.execute-api.us-east-1.amazonaws.com/prod/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          owner: ownerName,
          status: updatedStatus,
          comments: updatedComments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      setEditingTask(null);
      // In a real application, we would refresh the data here
      alert('Task updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const ownerTasks = data.filter((task) => task.owner === ownerName);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tasks for {ownerName}</h2>
      <TodoTable 
        data={ownerTasks}
        onStatusUpdate={async (task, newStatus) => {
          await handleUpdateTask(task.taskId, newStatus, task.comments);
        }}
        onCommentsUpdate={async (task, newComments) => {
          await handleUpdateTask(task.taskId, task.status, newComments);
        }}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
