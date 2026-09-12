import { Test, TestingModule } from '@nestjs/testing';
import { CharacterSheetDataController } from './character-sheet-data.controller';

describe('CharacterSheetDataController', () => {
  let controller: CharacterSheetDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CharacterSheetDataController],
    }).compile();

    controller = module.get<CharacterSheetDataController>(CharacterSheetDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
