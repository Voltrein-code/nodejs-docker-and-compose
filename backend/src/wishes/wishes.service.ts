import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import deletePassword from 'src/utils/deletePasswords';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  create(createWishDto: CreateWishDto, owner: User) {
    const newWish = this.wishRepository.create({ ...createWishDto, owner });
    return this.wishRepository.save(newWish);
  }

  async findAll(): Promise<Wish[]> {
    const wishes = await this.wishRepository.find({ relations: ['owner'] });

    return wishes.map((el) => ({ ...el, owner: deletePassword(el.owner) }));
  }

  async findOne(id: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner', 'offers', 'offers.user'],
    });

    if (!wish) throw new NotFoundException('Не удалось найти подарок по id');

    wish.owner = deletePassword(wish.owner);
    wish.offers = wish.offers.map((el) => {
      return {
        ...el,
        user: deletePassword(el.user),
      };
    });

    return wish;
  }

  async findLast() {
    const lastWishes = await this.wishRepository.find({
      take: 40,
      order: { createdAt: 'DESC' },
      relations: ['owner'],
    });

    return lastWishes.map((el) => ({ ...el, owner: deletePassword(el.owner) }));
  }

  async findFirst() {
    const firstWishes = await this.wishRepository.find({
      take: 20,
      order: { copied: 'DESC' },
      relations: ['owner'],
    });

    return firstWishes.map((el) => ({
      ...el,
      owner: deletePassword(el.owner),
    }));
  }

  async update(id: number, updateWishDto: UpdateWishDto, user: User) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });

    if (!wish) throw new NotFoundException('Не удалось найти подарок по id');

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException('Редактирование чужого подарка запрещено');
    }

    if (wish.offers.length) {
      throw new ForbiddenException(
        'Редактирование подарка на который скинулись запрещено',
      );
    }

    return this.wishRepository.save(Object.assign(wish, updateWishDto));
  }

  async copy(id: number, user: User) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!wish) throw new NotFoundException('Не удалось найти подарок по id');

    wish.copied += 1;
    await this.wishRepository.save(Object.assign({}, wish));

    const copiedWish = this.wishRepository.create({
      ...Object.assign({}, { ...wish, id: undefined }),
      owner: user,
      raised: 0,
      copied: 0,
    });

    return this.wishRepository.save(copiedWish);
  }

  async remove(id: number, user: User) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });

    if (!wish) throw new NotFoundException('Не удалось найти подарок по id');

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException('Удаление чужого подарка запрещено');
    }

    return this.wishRepository.delete(id);
  }
}
