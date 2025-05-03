import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { Request } from 'express';
import { LocalAuthGuard } from './local.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupAuthDto: SignupAuthDto) {
    return this.authService.signup(signupAuthDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  signin(@Req() req: Request) {
    return this.authService.signin(req.user);
  }
}
