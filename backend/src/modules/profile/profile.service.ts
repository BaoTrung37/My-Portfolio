import { Profile } from '@portfolio/shared';
import { IProfileRepository } from './profile.repository.js';

export class ProfileService {
  constructor(private readonly repository: IProfileRepository) {}

  async getProfile(): Promise<Profile> {
    const profile = await this.repository.getProfile();
    if (!profile) {
      throw new Error('Profile not found in database');
    }
    return profile;
  }
}
