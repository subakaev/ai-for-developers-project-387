import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiError } from '../api/types';

/**
 * Renders every error as the contract's `ApiError` ({ code, message }) instead
 * of Nest's default `{ statusCode, message, error }` body.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(toApiError(exception));
      return;
    }

    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: 'internal_error',
      message: 'Unexpected error.',
    } satisfies ApiError);
  }
}

function toApiError(exception: HttpException): ApiError {
  const body = exception.getResponse();

  // DomainException (and any handler that already returns { code, message }).
  if (
    typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    'message' in body &&
    typeof (body as Record<string, unknown>).message === 'string'
  ) {
    return body as ApiError;
  }

  // ValidationPipe errors: { statusCode, message: string[] | string, error }.
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const raw = (body as { message: unknown }).message;
    const message = Array.isArray(raw) ? raw.join('; ') : String(raw);
    return { code: 'validation_error', message };
  }

  return { code: 'error', message: exception.message };
}
