import { Project } from '@portfolio/shared';
import { IProjectRepository, ProjectsFilter } from './projects.repository.js';

export class ProjectsService {
  constructor(private readonly repository: IProjectRepository) {}

  async getProjects(filters?: ProjectsFilter): Promise<Project[]> {
    return this.repository.getProjects(filters);
  }
}
