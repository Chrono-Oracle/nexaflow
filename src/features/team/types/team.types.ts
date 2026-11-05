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
}
