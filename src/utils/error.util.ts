import { FORBIDDEN_CODE_COMMON, JWT_CODE_COMMON } from "@/constants";
import { ReasonPhrases, StatusCodes } from "@/core";

export class ErrorResponse extends Error {
  status: number;
  others: any;
  code?: string;

  constructor(message: string, status: number, others?: any, code?: string) {
    super(message);
    this.status = status;
    this.others = others;
    this.code = code;
  }
}

export class NotFoundRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.NOT_FOUND,
    statusCode = StatusCodes.NOT_FOUND,
    code = FORBIDDEN_CODE_COMMON
  ) {
    super(message, statusCode, undefined, code);
  }
}

export class InternalServerRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.INTERNAL_SERVER_ERROR,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  ) {
    super(message, statusCode);
  }
}

export class BadRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.BAD_REQUEST,
    statusCode = StatusCodes.BAD_REQUEST,
    others?: any
  ) {
    super(message, statusCode, others);
  }
}

export class ForbiddenRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.FORBIDDEN,
    statusCode = StatusCodes.FORBIDDEN,
    code = FORBIDDEN_CODE_COMMON
  ) {
    super(message, statusCode, undefined, code);
  }
}

export class UnauthorizedRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.UNAUTHORIZED,
    statusCode = StatusCodes.UNAUTHORIZED,
    code = JWT_CODE_COMMON
  ) {
    super(message, statusCode, undefined, code);
  }
}

export class ConflictRequestError extends ErrorResponse {
  constructor(message = ReasonPhrases.CONFLICT, statusCode = StatusCodes.CONFLICT) {
    super(message, statusCode);
  }
}
