import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { GetUser, MyAuth } from 'src/auth/decorators';
import { IValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  //@MyAuth(IValidRoles.admin)
  executeSeed(/* @GetUser() userJWT: User */) {
    return this.seedService.executeSeed(/* userJWT */);
  }
}
