import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService } from './pokemon.service';
import { Logger } from '@nestjs/common';
import { IPokemonRepository } from './repositories/pokemon.repository.interface';
import { POKEMON_REPOSITORY_TOKEN } from './pokemon.constants';
import { IPokemonList, IPokemonDetails } from '@shared';

describe('PokemonService (Unit)', () => {
  let service: PokemonService;
  let repository: jest.Mocked<IPokemonRepository>;
  let logger: Logger;

  beforeEach(async () => {
    const mockRepository: Partial<jest.Mocked<IPokemonRepository>> = {
      findAll: jest.fn(),
      findByName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonService,
        Logger,
        {
          provide: POKEMON_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PokemonService>(PokemonService);
    repository = module.get(POKEMON_REPOSITORY_TOKEN);
    logger = module.get(Logger);
  });

  describe('list', () => {
    it('should return a list of pokemons', async () => {
      const result: IPokemonList = { count: 1, next: null, previous: null, results: [{ name: 'pikachu', url: 'url' }] };
      repository.findAll.mockResolvedValue(result);

      expect(await service.list({})).toEqual(result);
      expect(repository.findAll).toHaveBeenCalledWith(20, 0); // Default values
    });

    it('should use provided limit and offset', async () => {
      const result: IPokemonList = { count: 0, next: null, previous: null, results: [] };
      repository.findAll.mockResolvedValue(result);

      await service.list({ limit: 10, offset: 5 });
      expect(repository.findAll).toHaveBeenCalledWith(10, 5);
    });
  });

  describe('get', () => {
    it('should return pokemon details', async () => {
      const result = { id: 1, name: 'bulbasaur' } as IPokemonDetails;
      repository.findByName.mockResolvedValue(result);

      expect(await service.get('bulbasaur')).toEqual(result);
      expect(repository.findByName).toHaveBeenCalledWith('bulbasaur');
    });
  });
});
