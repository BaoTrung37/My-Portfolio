import { Skill } from '@portfolio/shared';
import { ISkillsRepository, SkillsFilter } from './skills.repository.js';

export class SkillsService {
  constructor(private readonly repository: ISkillsRepository) {}

  async getSkills(filters?: SkillsFilter): Promise<Skill[]> {
    return this.repository.getSkills(filters);
  }
}
