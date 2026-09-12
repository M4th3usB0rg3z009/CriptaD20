import { Test, TestingModule } from '@nestjs/testing';
import { CharacterSheetsService } from './character-sheets.service';

describe('CharacterSheetsService', () => {
  let service: CharacterSheetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CharacterSheetsService],
    }).compile();

    service = module.get<CharacterSheetsService>(CharacterSheetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
