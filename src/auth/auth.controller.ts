import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, LoginUserDTO } from './dto';
import { AuthGuard } from '@nestjs/passport';

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

  @Get('private')
  @UseGuards(AuthGuard())
  testPrivateRoute() {
    return {
      ok: true,
      message: 'Hello world',
    };
  }

  
}
