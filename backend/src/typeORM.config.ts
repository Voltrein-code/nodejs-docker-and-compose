import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Offer } from 'src/offers/entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: configService.get<'postgres' | 'mysql' | 'mariadb' | 'sqlite'>('DB_TYPE', 'postgres'),
  host: configService.get<string>('POSTGRES_HOST', 'postgres'),
  port: configService.get<number>('POSTGRES_PORT', 5432),
  username: configService.get<string>('POSTGRES_USER', 'someUser'),
  password: configService.get<string>('POSTGRES_PASSWORD', 'somePassword'),
  database: configService.get<string>('POSTGRES_DB', 'postgres'),
  entities: [User, Wish, Wishlist, Offer],
  synchronize: true,
});

export default typeOrmConfig;