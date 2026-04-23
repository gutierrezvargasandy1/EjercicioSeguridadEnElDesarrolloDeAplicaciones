import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { AppException } from '../exceptions/AppException';
import { ErrorCodes } from '../exceptions/errorCodes';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // ================= PRISMA ERRORS =================
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {

      switch (exception.code) {

        case 'P2002':
          return response.status(HttpStatus.CONFLICT).json(
            new AppException(
              'Ya existe un registro con estos datos',
              HttpStatus.CONFLICT,
              ErrorCodes.UNIQUE_CONSTRAINT,
            ).getResponse(),
          );

        case 'P2003':
          return response.status(HttpStatus.BAD_REQUEST).json(
            new AppException(
              'Error de relación entre entidades',
              HttpStatus.BAD_REQUEST,
              ErrorCodes.FOREIGN_KEY_ERROR,
            ).getResponse(),
          );

        default:
          return response.status(HttpStatus.BAD_REQUEST).json(
            new AppException(
              'Error en la base de datos',
              HttpStatus.BAD_REQUEST,
              ErrorCodes.DATABASE_ERROR,
            ).getResponse(),
          );
      }
    }

    // ================= APP ERROR =================
    if (exception instanceof AppException) {
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    // ================= UNKNOWN =================
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      errorCode: ErrorCodes.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
}