import { IPokemonList, IPokemonDetails } from '@shared';

export interface IPokemonRepository {
  findAll(limit: number, offset: number): Promise<IPokemonList>;
  findByName(name: string): Promise<IPokemonDetails>;
}
