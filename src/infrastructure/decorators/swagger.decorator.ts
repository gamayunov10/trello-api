import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function SwaggerOptions(
  summary: string,
  bearer: boolean,
  basic: boolean,
  apiResponseStatusCode: number,
  apiResponseDescription: string,
  apiResponseSchema: boolean | any,
  apiBadRequestResponse: boolean | string,
  apiBadRequestSchema: boolean | any,
  apiUnauthorizedResponse: boolean | string,
  apiForbiddenResponse: boolean | string,
  apiNotFoundResponse: boolean | string,
  apiTooManyRequestsResponse: boolean | string,
) {
  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [ApiOperation({ summary })];

  if (apiResponseSchema) {
    if (typeof apiResponseSchema === 'boolean') {
      throw new Error('apiResponseSchema must be an Schema not just true');
    }
    decorators.push(ApiExtraModels(apiResponseSchema));
    decorators.push(
      ApiResponse({
        status: apiResponseStatusCode,
        description: apiResponseDescription,
        schema: {
          $ref: getSchemaPath(apiResponseSchema),
        },
      }),
    );
  } else {
    decorators.push(
      ApiResponse({
        status: apiResponseStatusCode,
        description: apiResponseDescription,
      }),
    );
  }

  if (apiUnauthorizedResponse) {
    let description = 'Unauthorized';
    if (typeof apiUnauthorizedResponse === 'string') {
      description = apiUnauthorizedResponse;
    }
    decorators.push(ApiUnauthorizedResponse({ description: description }));
  }

  if (bearer) {
    decorators.push(ApiBearerAuth());
  }

  if (basic) {
    decorators.push(ApiBasicAuth());
  }

  if (apiBadRequestSchema) {
    if (typeof apiBadRequestSchema === 'boolean') {
      throw new Error('apiBadRequestSchema must be an Schema not just true');
    }
    let description = 'If the inputModel has incorrect values';
    if (typeof apiBadRequestResponse === 'string') {
      description = apiBadRequestResponse;
    }
    decorators.push(ApiExtraModels(apiBadRequestSchema));
    decorators.push(
      ApiBadRequestResponse({
        description: description,
        schema: {
          $ref: getSchemaPath(apiBadRequestSchema),
        },
      }),
    );
  }

  if (apiForbiddenResponse) {
    let description = 'Forbidden';
    if (typeof apiForbiddenResponse === 'string') {
      description = apiForbiddenResponse;
    }
    decorators.push(ApiForbiddenResponse({ description: description }));
  }

  if (apiNotFoundResponse) {
    let description = 'Not Found';
    if (typeof apiNotFoundResponse === 'string') {
      description = apiNotFoundResponse;
    }
    decorators.push(ApiNotFoundResponse({ description: description }));
  }

  if (apiTooManyRequestsResponse) {
    let description =
      'More than 5 attempts from one IP-address during 10 seconds';
    if (typeof apiTooManyRequestsResponse === 'string') {
      description = apiTooManyRequestsResponse;
    }
    decorators.push(ApiTooManyRequestsResponse({ description: description }));
  }

  return applyDecorators(...decorators);
}
