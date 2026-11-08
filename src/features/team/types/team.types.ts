export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  capacity: number; // Percentage 0 - 100
  activeTaskCount: number;
  status: 'Active' | 'On Leave';
  isPending?: boolean;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  memberIds: string[];
  members: TeamMember[];
  createdAt: string;
  description?: string;
}

