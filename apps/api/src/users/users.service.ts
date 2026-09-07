import { Injectable } from '@nestjs/common';
import { prisma } from '@criptad20/database';

@Injectable()
export class UsersService {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

  create(data: {
    username: string;
    email: string;
    password: string;
  }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}