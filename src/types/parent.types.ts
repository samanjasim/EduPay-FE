import type { ParentRelation } from './student.types';

export interface CreateParentData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber?: string | null;
  password: string;
}

export interface LinkParentData {
  parentUserId: string;
  relation: ParentRelation;
}
