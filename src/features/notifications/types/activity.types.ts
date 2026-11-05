export type ActivityType =
  | 'project_created'
  | 'task_status_changed'
  | 'project_completed'
  | 'member_assigned';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  actorAvatar: string;
}
