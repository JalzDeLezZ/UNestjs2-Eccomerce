import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Headers,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, LoginUserDTO } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { MyAuth, GetUser, RawHeaders } from './decorators';
import { User } from './entities/user.entity';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { IValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDTO: CreateUserDTO) {
    return this.authService.create(createUserDTO);
  }

  @Post('login')
  login(@Body() loginUserDTO: LoginUserDTO) {
    return this.authService.login(loginUserDTO);
  }

  @Get('check-status')
  @MyAuth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testPrivateRoute(
    @GetUser('email') user: User,
    @RawHeaders() rawHeaders: string[], //? 1. some method to get the raw headers
    @Headers() headers: IncomingHttpHeaders, //? 2. some method to get the headers as an object
  ) {
    return {
      ok: true,
      message: 'Hello world',
      user,
      rawHeaders,
      headers2: headers,
    };
  }

  @Get('private2')
  //!X @SetMetadata('roles', ['admin', 'super-user']) //? 3. some method to set metadata
  @RoleProtected(IValidRoles.superUser, IValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user2: User) {
    return {
      ok: true,
      message: 'Hello world',
      user: user2,
    };
  }

  @Get('private3')
  @MyAuth(IValidRoles.superUser, IValidRoles.admin)
  privateRoute3(@GetUser() user3: User) {
    return {
      ok: true,
      user: user3,
    };
  }
}
