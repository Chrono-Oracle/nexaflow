import { Team } from '../types/team.types';
import { Project } from '@/features/projects/types/project.types';

export function isTeamActiveOnProject(
  team: Team,
  projects: Project[]
): {
  isActive: boolean;
  projectName?: string;
  projectId?: string;
} {
  // A team is ONLY active when the team itself is assigned to an existing project.
  // All newly created teams have a status of being on standby until assigned to a project.
  if (team.projectId) {
    const project = projects.find((p) => p.id === team.projectId);
    if (project) {
      return {
        isActive: true,
        projectName: project.name,
        projectId: project.id,
      };
    }
  }

  if (team.status === 'Active' && team.projectId) {
    const project = projects.find((p) => p.id === team.projectId);
    return {
      isActive: true,
      projectName: project ? project.name : team.projectName,
      projectId: team.projectId,
    };
  }

  // Not assigned to any project -> On Standby
  return { isActive: false };
}
