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
  // 1. Check if any project explicitly lists this team in project.teamIds or project.teams
  const assignedProjects = projects.filter(
    (p) =>
      p.teamIds?.includes(team.id) ||
      p.teams?.some((t) => t.id === team.id) ||
      p.id === team.projectId ||
      team.projectIds?.includes(p.id)
  );

  if (assignedProjects.length > 0) {
    const projectNames = assignedProjects.map((p) => p.name).join(', ');
    return {
      isActive: true,
      projectName: projectNames,
      projectId: assignedProjects[0].id,
    };
  }

  // 2. If team has an explicit projectId assigned
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

  // 3. If team status is explicitly set to Active
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
