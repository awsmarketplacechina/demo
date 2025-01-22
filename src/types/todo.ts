export interface TodoItem {
  taskId: string;
  description: string;
  reviewWeek: string;
  wbrDate: Date;
  owner: string;
  dueDate: Date;
  status: 'Not Started' | 'In Progress' | 'Completed';
  comments: string;
}

export const mockTodoItems: TodoItem[] = [
  {
    taskId: 'TASK-001',
    description: 'Implement login functionality',
    reviewWeek: 'Week 12',
    wbrDate: new Date('2024-03-20'),
    owner: 'John Doe',
    dueDate: new Date('2024-03-25'),
    status: 'In Progress',
    comments: 'Working on OAuth integration'
  },
  {
    taskId: 'TASK-002',
    description: 'Design database schema',
    reviewWeek: 'Week 12',
    wbrDate: new Date('2024-03-20'),
    owner: 'Jane Smith',
    dueDate: new Date('2024-03-22'),
    status: 'Completed',
    comments: 'Schema approved by team'
  },
  {
    taskId: 'TASK-003',
    description: 'Set up CI/CD pipeline',
    reviewWeek: 'Week 13',
    wbrDate: new Date('2024-03-27'),
    owner: 'Mike Johnson',
    dueDate: new Date('2024-03-29'),
    status: 'Not Started',
    comments: 'Waiting for infrastructure team'
  }
];
