import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { IPokemonRepository } from '../pokemon.repository.interface';
import { IPokemonList, IPokemonDetails } from '@shared';

@Injectable()
export class PokeApiRepository implements IPokemonRepository {
  private readonly baseUrl: string;
  private readonly logger = new Logger(PokeApiRepository.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('POKEAPI_BASE_URL') || 'https://pokeapi.co/api/v2/pokemon';
  }

  async findAll(limit: number, offset: number): Promise<IPokemonList> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IPokemonList>(this.baseUrl, {
          params: { limit, offset },
        }),
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error fetching list from PokeAPI: ${axiosError.message}`);
      throw new InternalServerErrorException('Error fetching data from PokeAPI');
    }
  }

  async findByName(name: string): Promise<IPokemonDetails> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IPokemonDetails>(`${this.baseUrl}/${name}`),
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new NotFoundException(`Pokemon ${name} not found`);
      }
      this.logger.error(`Error fetching pokemon ${name}: ${axiosError.message}`);
      throw new InternalServerErrorException(`Error fetching pokemon ${name}`);
    }
  }
}
