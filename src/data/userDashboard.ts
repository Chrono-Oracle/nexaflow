export interface UserWorkspace {
  id: string;
  name: string;
  role: string;
  plan: string;
}

export interface User {
  id: string;
  fullName: string;
  nickname: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  workspace: UserWorkspace;
}

export const currentUser: User = {
  id: 'usr_roger_01',
  fullName: 'Tankeu Daniel',
  nickname: 'OracleX',
  email: 'oraclexp@gmail.com',
  avatar: '/Avatar.jpg',
  status: 'online',
  workspace: {
    id: 'ws_nexaflow',
    name: 'NexaFlow',
    role: 'Ops Manager',
    plan: 'Enterprise',
  },
};
