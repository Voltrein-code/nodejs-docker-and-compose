import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import deletePassword from 'src/utils/deletePasswords';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(signupAuthDto: SignupAuthDto) {
    return await this.usersService.create({
      ...signupAuthDto,
      password: await bcrypt.hash(signupAuthDto.password, 10),
    });
  }

  signin(user: User) {
    return {
      access_token: this.jwtService.sign({
        id: user.id,
        username: user.username,
      }),
      user: deletePassword(user),
    };
  }

  async checkUser(username: string, password: string) {
    const user = await this.usersService.findOne(username, false);

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    return deletePassword(user);
  }
}
