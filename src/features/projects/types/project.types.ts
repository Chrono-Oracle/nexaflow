export type ProjectStatus = 'In Progress' | 'Completed' | 'At Risk' | 'In Review' | 'Pending';
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ProjectMemberRole = 'Owner' | 'Manager' | 'Member' | 'Members';

export interface ProjectAssignedMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: ProjectMemberRole;
}

export interface ProjectAttachment {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  url?: string;
  uploadedAt?: string;
}

export interface ProjectManager {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
}

export interface ProjectSubtask {
  id: string;
  title: string;
  completed?: boolean;
}

export interface ProjectComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface ProjectActivity {
  id: string;
  actorName: string;
  actorAvatar?: string;
  action: string;
  target?: string;
  timestamp: string;
  badge?: {
    type: 'check' | 'status_change' | 'create' | 'tag';
    label?: string;
    from?: string;
    to?: string;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  manager: ProjectManager;
  startDate?: string;
  deadline: string;
  status: ProjectStatus;
  priority?: ProjectPriority;
  progress: number;
  color: string;
  createdAt: string;
  taskCount: number;
  tags: string[];
  members?: ProjectAssignedMember[];
  attachments?: ProjectAttachment[];
  subtasks?: ProjectSubtask[];
  comments?: ProjectComment[];
  activities?: ProjectActivity[];
  reminderActive?: boolean;
  viewsCount?: number;
}

export interface ProjectFilterState {
  search: string;
  status: ProjectStatus | 'All';
  priority?: ProjectPriority | 'All';
  sortBy: 'deadline' | 'progress' | 'name';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'table';
}
