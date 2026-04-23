import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    errorCode: string,
    details?: any,
  ) {
    super(
      {
        success: false,
        message,
        errorCode,
        timestamp: new Date().toISOString(),
        details: details ?? null,
      },
      status,
    );
  }
}