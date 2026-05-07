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

    console.error('[AllExceptionFilter] ========== EXCEPCIÓN CAPTURADA ==========');
    console.error('[AllExceptionFilter] Tipo:', exception?.constructor?.name);
    console.error('[AllExceptionFilter] Mensaje:', exception?.message);
    console.error('[AllExceptionFilter] Código Prisma:', exception?.code);
    console.error('[AllExceptionFilter] Stack:', exception?.stack);
    try {
      console.error('[AllExceptionFilter] JSON:', JSON.stringify(exception, null, 2));
    } catch {
      console.error('[AllExceptionFilter] (no se pudo serializar el error)');
    }
    console.error('[AllExceptionFilter] =========================================');

    // ================= PRISMA ERRORS =================
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('[AllExceptionFilter] → Es un PrismaClientKnownRequestError, código:', exception.code);

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
      console.error('[AllExceptionFilter] → Es un AppException, status:', exception.getStatus());
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    // ================= UNKNOWN =================
    console.error('[AllExceptionFilter] → Excepción DESCONOCIDA, retornando 500');
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      errorCode: ErrorCodes.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
}