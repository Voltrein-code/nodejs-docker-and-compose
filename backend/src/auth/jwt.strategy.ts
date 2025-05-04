import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface IJwtPayload {
  id: number;
  username: string;
}

@Injectable()
export class JwtStaregy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET', 'test-secret'),
      ignoreExpiration: false,
    });
  }

  validate(payload: IJwtPayload) {
    return Object.assign({}, payload);
  }
}
