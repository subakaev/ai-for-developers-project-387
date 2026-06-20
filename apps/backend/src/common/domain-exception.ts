import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Application error that carries the contract's stable `code` alongside an HTTP
 * status, so responses can be rendered as the contract's `ApiError` shape.
 */
export class DomainException extends HttpException {
  constructor(
    status: HttpStatus,
    public readonly code: string,
    message: string,
  ) {
    super({ code, message }, status);
  }

  static notFound(code: string, message: string): DomainException {
    return new DomainException(HttpStatus.NOT_FOUND, code, message);
  }

  static conflict(code: string, message: string): DomainException {
    return new DomainException(HttpStatus.CONFLICT, code, message);
  }

  static badRequest(code: string, message: string): DomainException {
    return new DomainException(HttpStatus.BAD_REQUEST, code, message);
  }
}
