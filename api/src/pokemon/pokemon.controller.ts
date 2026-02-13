import { Controller, Get, Param, Query } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { GetPokemonsDto } from './dtos/pokemon.dto';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  async findAll(@Query() query: GetPokemonsDto) {
    return await this.pokemonService.list(query);
  }

  @Get(':name')
  async findOne(@Param('name') name: string) {
    return await this.pokemonService.get(name);
  }
}
