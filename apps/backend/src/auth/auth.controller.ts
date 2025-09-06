import type { User } from '@clerk/backend';
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  @Get('me')
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
    };
  }

  @Get('profile')
  async getFullProfile(@CurrentUser() user: User) {
    return user;
  }
}