import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private prisma: PrismaService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? JSON.stringify(exception.getResponse())
        : 'Internal server error';

    let userId: number | null = null;

    try {
      const token =
        request.cookies?.access_token ||
        request.headers.authorization?.split(' ')[1];

      if (token) {
        const decoded: any = jwt.decode(token);
        userId = decoded?.id ?? null;
      }
    } catch (e) {}

    await this.prisma.logs.create({
      data: {
        statusCode: status,
        path: request.url,
        error: message,
        errorCode: 'EXCEPTION',
        session_id: userId,
      },
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}