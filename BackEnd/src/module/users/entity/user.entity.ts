import { Role } from '@prisma/client';

export class User {
  id: number;
  name: string;
  lastname: string;
  username: string;
  password?: string;
  created_at: Date;
  hash?: string | null;
  role: Role; 
}