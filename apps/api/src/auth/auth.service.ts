import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim();

    const existingEmail = await this.usersService.findByEmail(email);

    if (existingEmail) {
      throw new ConflictException('Este email já está cadastrado.');
    }

    const existingUsername =
      await this.usersService.findByUsername(username);

    if (existingUsername) {
      throw new ConflictException(
        'Este nome de usuário já está em uso.',
      );
    }

    const passwordHash = await argon2.hash(dto.password);

    return this.usersService.create({
      username,
      email,
      password: passwordHash,
    });
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const passwordIsValid = await argon2.verify(
      user.password,
      dto.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}