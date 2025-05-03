import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import deletePassword from 'src/utils/deletePasswords';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('find')
  @HttpCode(201)
  findMany(@Body('query') query: string) {
    return this.usersService.findMany(query);
  }

  @Get('me')
  findMe(@Req() req: Request) {
    return this.usersService.findById(req.user.id);
  }

  @Get('me/wishes')
  async getMeWishes(@Req() req: Request) {
    const user = await this.usersService.findById(req.user.id);

    return user.wishes.map((el) => ({
      ...el,
      owner: deletePassword(el.owner),
    }));
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    const user = await this.usersService.findOne(username);

    return user.wishes.map((el) => ({
      ...el,
      owner: deletePassword(el.owner),
    }));
  }

  @Patch('me')
  update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }
}
