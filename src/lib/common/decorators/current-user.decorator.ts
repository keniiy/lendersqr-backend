import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '../interfaces/user.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof IUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
