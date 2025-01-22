import { useState } from 'react';
import { TodoTable } from './todo-table';
import { TodoItem } from '../types/todo';

interface OwnerViewProps {
  data: TodoItem[];
  ownerName?: string;
}

export function OwnerView({ data, ownerName = 'John Doe' }: OwnerViewProps) {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateTask = async (taskId: string, updatedStatus: string, updatedComments: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demonstration, log the update payload
      console.log('Task Update:', {
        taskId,
        owner: ownerName,
        status: updatedStatus,
        comments: updatedComments,
      });

      // Simulate successful response
      alert('Task updated successfully!');
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Update Error:', err);
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
