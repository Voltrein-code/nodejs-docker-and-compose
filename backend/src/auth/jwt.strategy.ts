import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface IJwtPayload {
  id: number;
  username: string;
}

@Injectable()
export class JwtStaregy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'super-strond-secret-dev',
    });
  }

  validate(payload: IJwtPayload) {
    return Object.assign({}, payload);
  }
}
