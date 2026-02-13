import { Injectable, Inject, Logger } from '@nestjs/common';
import { IPokemonRepository } from './repositories/pokemon.repository.interface';
import { POKEMON_REPOSITORY_TOKEN } from './pokemon.constants';
import { GetPokemonsDto } from './dtos/pokemon.dto';
import { IPokemonList, IPokemonDetails } from '@shared';

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);

  constructor(
    @Inject(POKEMON_REPOSITORY_TOKEN)
    private readonly pokemonRepository: IPokemonRepository
  ) {}

  async list(dto: GetPokemonsDto): Promise<IPokemonList> {
     const limit = dto.limit ? Number(dto.limit) : 20;
     const offset = dto.offset ? Number(dto.offset) : 0;
     
     this.logger.log(`Fetching pokemons with limit: ${limit}, offset: ${offset}`);
     return await this.pokemonRepository.findAll(limit, offset);
  }

  async get(name: string): Promise<IPokemonDetails> {
      this.logger.log(`Fetching pokemon details for: ${name}`);
      return await this.pokemonRepository.findByName(name);
  }
}
