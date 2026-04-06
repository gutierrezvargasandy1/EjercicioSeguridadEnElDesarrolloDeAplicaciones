import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {

  constructor(
    message: string,
    status: HttpStatus,
    errorCode: string,
  ) {
    super(
      {
        success: false,
        message: message,
        errorCode: errorCode,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}