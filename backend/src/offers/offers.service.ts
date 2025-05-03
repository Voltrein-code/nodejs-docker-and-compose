import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { Wish } from 'src/wishes/entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import deletePassword from 'src/utils/deletePasswords';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User) {
    const { amount, hidden, itemId } = createOfferDto;

    const wish = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: ['owner', 'offers'],
    });

    if (!wish) throw new NotFoundException('Не удалось найти подарок по id');

    if (wish.owner.id === user.id) {
      throw new ForbiddenException('Запрещено скидываться на свой же подарок');
    }

    if (wish.raised + amount > wish.price) {
      throw new BadRequestException('Сумма сбора превысила стоимость подарка');
    }

    wish.raised += createOfferDto.amount;
    await this.wishRepository.save(wish);

    return this.offerRepository.save(
      this.offerRepository.create({
        amount,
        hidden,
        user,
        item: wish,
      }),
    );
  }

  async findAll() {
    const allOffers = await this.offerRepository.find({
      relations: ['user', 'item'],
    });

    return allOffers.map((el) => ({ ...el, user: deletePassword(el.user) }));
  }

  async findOne(id: number) {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ['user', 'item'],
    });

    if (!offer) throw new NotFoundException('Не удалось найти оффер по id');

    offer.user = deletePassword(offer.user);

    return offer;
  }
}
