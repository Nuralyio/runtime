import { Logger } from 'tslog';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from './exceptions';

export const handleError = (error: any, logger: Logger<any>): void => {
  logger.error(error);

  if (error instanceof UnauthorizedException) throw new UnauthorizedException(error.message);
  if (error instanceof NotFoundException) throw new NotFoundException(error.message);
  if (error instanceof BadRequestException) throw new BadRequestException(error.message);
  if (error instanceof InternalServerErrorException) throw new InternalServerErrorException(error.message);
  if (error instanceof ConflictException) throw new ConflictException(error.message);

  if (error.type === "Not Found") throw new NotFoundException(error.detail);
  if (error.code === '23503') throw new BadRequestException(error.detail);
  if (error.code === '23505') throw new BadRequestException(error.detail);
  if (error.code === '23502') throw new BadRequestException(error.detail);
  if (error.code === '22P02') throw new BadRequestException(error.detail);
  if (error.code === '23514') throw new BadRequestException(error.detail);
  if (error.code === '42601') throw new BadRequestException("Campo attribute(attr) no válido.");

  if (error.status === 404) throw new NotFoundException(error.response);
  if (error.status === 400) throw new BadRequestException(error.response);

  throw new InternalServerErrorException('Internal Server Error');
};
