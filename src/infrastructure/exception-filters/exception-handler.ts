import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { ResultCode } from '../../base/enums/result-code.enum';

export const exceptionHandler = (
  code: ResultCode,
  message?: string,
  field?: string,
) => {
  const exceptionObject = {
    message: [
      {
        message: message,
        field: field,
      },
    ],
  };
  switch (code) {
    case ResultCode.BadRequest: {
      throw new BadRequestException(exceptionObject);
    }
    case ResultCode.NotFound: {
      throw new NotFoundException(exceptionObject);
    }
    case ResultCode.Forbidden: {
      throw new ForbiddenException(exceptionObject);
    }
    case ResultCode.Unauthorized: {
      throw new UnauthorizedException(exceptionObject);
    }
    case ResultCode.InternalServerError: {
      throw new InternalServerErrorException(exceptionObject);
    }
  }
};
