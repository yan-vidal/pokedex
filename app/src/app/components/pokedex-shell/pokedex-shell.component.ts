import { Component, signal, inject, OnInit, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../services/pokemon.service';
import { LeftScreenComponent } from '../left-screen/left-screen.component';
import { RightScreenComponent } from '../right-screen/right-screen.component';
import { CoverDisplayComponent } from '../cover-display/cover-display.component';
import { IPokemon, IPokemonDetails } from '@shared/interfaces/pokemon.interface';
import { IAuthService } from '../../services/auth.service.interface';

@Component({
  selector: 'app-pokedex-shell',
  standalone: true,
  imports: [CommonModule, LeftScreenComponent, RightScreenComponent, CoverDisplayComponent],
  templateUrl: './pokedex-shell.component.html',
  styleUrl: './pokedex-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokedexShellComponent implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  private readonly authService = inject(IAuthService);

  isOpen = signal(false);
  pokemons = signal<IPokemon[]>([]);
  selectedPokemon = signal<IPokemonDetails | null>(null);
  
  offset = signal(0);
  limit = 15;

  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.loadPokemons();
      } else {
        this.pokemons.set([]);
        this.selectedPokemon.set(null);
        this.isOpen.set(false);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {}

  loadPokemons(): void {
    this.pokemonService.getPokemons(this.limit, this.offset()).subscribe({
      next: (data) => this.pokemons.set(data.results),
      error: (err) => console.error('Error loading pokemons', err)
    });
  }

  selectPokemon(name: string): void {
    this.pokemonService.getPokemonDetails(name).subscribe({
      next: (details) => this.selectedPokemon.set(details),
      error: (err) => console.error('Error loading details', err)
    });
  }

  nextPage(): void {
    this.offset.update(v => v + this.limit);
    this.loadPokemons();
  }

  prevPage(): void {
    if (this.offset() > 0) {
      this.offset.update(v => Math.max(0, v - this.limit));
      this.loadPokemons();
    }
  }

  toggleOpen(): void {
    if (!this.authService.isLoggedIn() && !this.isOpen()) return;
    this.isOpen.update(v => !v);
  }

  private dragStart = 0;
  
  onMouseDown(event: MouseEvent | TouchEvent): void {
    if (!this.authService.isLoggedIn() && !this.isOpen()) return;
    this.dragStart = 'touches' in event ? event.touches[0].clientX : event.clientX;
  }

  onMouseUp(event: MouseEvent | TouchEvent): void {
    if (!this.authService.isLoggedIn() && !this.isOpen()) return;
    
    const endX = 'touches' in event ? event.changedTouches[0].clientX : event.clientX;
    const diff = endX - this.dragStart;

    if (diff > 80 && !this.isOpen()) this.isOpen.set(true);
    else if (diff < -80 && this.isOpen()) this.isOpen.set(false);
  }
}
