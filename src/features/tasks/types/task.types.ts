export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Approved' | 'Completed';

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  url?: string;
  uploadedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed?: boolean;
  note?: string;
  assigneeId?: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  taskNumber?: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: string;
  deadline: string;
  projectId: string;
  assigneeId?: string;
  assigneeIds?: string[];
  attachments?: TaskAttachment[];
  subtasks?: Subtask[];
  comments?: TaskComment[];
  createdAt: string;
}

export interface TaskFilterState {
  search: string;
  priority: TaskPriority | 'All';
  status: TaskStatus | 'All';
  projectId: string | 'All';
  assigneeId: string | 'All';
}
