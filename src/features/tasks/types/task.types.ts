export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  projectId: string;
  assigneeId?: string;
  createdAt: string;
}

export interface TaskFilterState {
  search: string;
  priority: TaskPriority | 'All';
  status: TaskStatus | 'All';
  projectId: string | 'All';
  assigneeId: string | 'All';
}
