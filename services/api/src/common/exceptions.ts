export class BadRequestException extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.status = 400;
    this.name = 'BadRequestException';
  }
}

export class ConflictException extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.status = 409;
    this.name = 'ConflictException';
  }
}

export class InternalServerErrorException extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.status = 500;
    this.name = 'InternalServerErrorException';
  }
}

export class NotFoundException extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.status = 404;
    this.name = 'NotFoundException';
  }
}

export class UnauthorizedException extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.status = 401;
    this.name = 'UnauthorizedException';
  }
}
