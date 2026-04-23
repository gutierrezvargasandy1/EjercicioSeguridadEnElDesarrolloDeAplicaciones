import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: any; // o User si quieres tipado fuerte
    }
  }
}