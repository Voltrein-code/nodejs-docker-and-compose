import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from 'src/wishes/entities/wish.entity';
import { In, Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';
import deletePassword from 'src/utils/deletePasswords';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    @InjectRepository(Wishlist)
    private readonly wishListRepository: Repository<Wishlist>,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, owner: User) {
    const wishes = await this.wishRepository.findBy({
      id: In(createWishlistDto.itemsId),
    });

    return this.wishListRepository.save(
      this.wishListRepository.create({
        ...createWishlistDto,
        items: wishes,
        owner,
      }),
    );
  }

  async findAll() {
    const wishlists = await this.wishListRepository.find({
      relations: ['owner', 'items'],
    });

    return wishlists.map((el) => ({ ...el, owner: deletePassword(el.owner) }));
  }

  async findOne(id: number) {
    const wishlist = await this.wishListRepository.findOne({
      where: { id },
      relations: ['owner', 'items', 'items.owner'],
    });

    if (!wishlist) {
      throw new NotFoundException('Не удалось найти вишлист по id');
    }

    wishlist.owner = deletePassword(wishlist.owner);
    wishlist.items = wishlist.items.map((el) => ({
      ...el,
      owner: deletePassword(el.owner),
    }));

    return wishlist;
  }

  async update(id: number, updateWishlistDto: UpdateWishlistDto, user: User) {
    const wishlist = await this.wishListRepository.findOne({
      where: { id },
      relations: ['owner', 'items', 'items.owner'],
    });

    if (!wishlist) {
      throw new NotFoundException('Не удалось найти вишлист по id');
    }

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException('Запрещено редактировать чужой вишлист');
    }

    if (updateWishlistDto.itemsId) {
      wishlist.items = await this.wishRepository.findBy({
        id: In(updateWishlistDto.itemsId),
      });
    }

    const updatedWishList = await this.wishListRepository.save(
      Object.assign(wishlist, updateWishlistDto),
    );

    updatedWishList.owner = deletePassword(updatedWishList.owner);
    updatedWishList.items.map((el) => ({
      ...el,
      owner: deletePassword(el.owner),
    }));

    return updatedWishList;
  }

  async remove(id: number, user: User) {
    const removeCandidate = await this.wishListRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!removeCandidate) {
      throw new NotFoundException('Не удалось найти вишлист по id');
    }

    if (removeCandidate.owner.id !== user.id) {
      throw new ForbiddenException('Запрещено удалять чужие карточки');
    }

    return this.wishListRepository.delete(id);
  }
}
