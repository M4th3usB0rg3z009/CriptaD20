import { Test, TestingModule } from '@nestjs/testing';
import { CharacterSheetsController } from './character-sheets.controller';

describe('CharacterSheetsController', () => {
  let controller: CharacterSheetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CharacterSheetsController],
    }).compile();

    controller = module.get<CharacterSheetsController>(CharacterSheetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
