import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

import { UsersQueryRepository } from '../../features/users/infrastructure/users.query.repo';

@ValidatorConstraint({ name: 'IsEmailAlreadyExist', async: true })
@Injectable()
export class IsEmailAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}
  async validate(email: string): Promise<boolean> {
    const user = await this.usersQueryRepository.findUserByEmail(email);
    return !user;
  }
}

export const IsEmailAlreadyExist =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailAlreadyExistConstraint,
    });
  };
