export type ProjectStatus = 'In Progress' | 'Completed' | 'Pending';

export interface ProjectManager {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  manager: ProjectManager;
  deadline: string;
  status: ProjectStatus;
  progress: number;
  color: string;
  createdAt: string;
  taskCount: number;
  tags: string[];
}

export interface ProjectFilterState {
  search: string;
  status: ProjectStatus | 'All';
  sortBy: 'deadline' | 'progress' | 'name';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'table';
}
