import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { PokeApiRepository } from './repositories/pokeapi/pokeapi.repository';
import { POKEMON_REPOSITORY_TOKEN } from './pokemon.constants';

@Module({
  imports: [HttpModule],
  controllers: [PokemonController],
  providers: [
    PokemonService,
    {
      provide: POKEMON_REPOSITORY_TOKEN,
      useClass: PokeApiRepository,
    },
  ],
})
export class PokemonModule {}
