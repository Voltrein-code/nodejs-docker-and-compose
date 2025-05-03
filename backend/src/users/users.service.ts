import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';

import deletePassword from 'src/utils/deletePasswords';
import unSafeUserSelect from 'src/utils/unSafeUserSelect';
import safeUserSelect from 'src/utils/safeUserSelect';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(username: string, safe = true) {
    return await this.userRepository.findOne({
      where: { username },
      relations: ['wishes'],
      select: safe ? safeUserSelect : unSafeUserSelect,
    });
  }

  async findMany(query: string) {
    const users = await this.userRepository.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
      relations: ['wishes'],
    });

    return users.map((el) => deletePassword(el));
  }

  async create(createUserDto: CreateUserDto) {
    return deletePassword(
      await this.userRepository.save(this.userRepository.create(createUserDto)),
    );
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  findAll() {
    return this.userRepository.find();
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['wishes'],
    });

    if (!user)
      throw new NotFoundException(
        'Не удалось найти пользователя по переданному id',
      );

    return deletePassword(user);
  }
}
