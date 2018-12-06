import { User } from '../users';
import { Group } from './group';

export class UserProfile {
  groupId: string;
  type: string = 'USER:';

  constructor(group: Group, user: User) {
    this.groupId = group.groupId;
    this.type += user.userId;
  }
}
