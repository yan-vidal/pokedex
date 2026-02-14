import { Component, signal, inject, OnInit, ChangeDetectionStrategy, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../services/pokemon.service';
import { LeftScreenComponent } from '../left-screen/left-screen.component';
import { RightScreenComponent } from '../right-screen/right-screen.component';
import { CoverDisplayComponent } from '../cover-display/cover-display.component';
import { IPokemon, IPokemonDetails } from '@shared/interfaces/pokemon.interface';
import { IAuthService } from '../../services/auth.service.interface';
import { ISfxService } from '../../services/sfx.service.interface';

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
  private readonly sfx = inject(ISfxService);

  isOpen = signal(false);
  viewMode = signal<'artwork' | 'details'>('artwork');
  pokemons = signal<IPokemon[]>([]);
  selectedPokemon = signal<IPokemonDetails | null>(null);
  isListLoading = signal(false);
  
  offset = signal(0);
  limit = 15;

  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn()) {
        untracked(() => this.loadPokemons());
      } else {
        this.pokemons.set([]);
        this.selectedPokemon.set(null);
        this.isOpen.set(false);
        untracked(() => this.viewMode.set('artwork'));
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {}

  loadPokemons(): void {
    this.isListLoading.set(true);
    this.pokemonService.getPokemons(this.limit, this.offset()).subscribe({
      next: (data) => {
        const current = this.pokemons();
        this.pokemons.set([...current, ...data.results]);
        this.isListLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading pokemons', err);
        this.isListLoading.set(false);
      }
    });
  }

  selectPokemon(name: string): void {
    this.pokemonService.getPokemonDetails(name).subscribe({
      next: (details) => this.selectedPokemon.set(details),
      error: (err) => console.error('Error loading details', err)
    });
  }

  loadMore(): void {
    this.offset.update(v => v + this.limit);
    this.loadPokemons();
  }

  toggleView(): void {
    this.viewMode.update(v => v === 'artwork' ? 'details' : 'artwork');
  }

  private setOpen(open: boolean): void {
    if (this.isOpen() === open) return;
    
    this.sfx.play('whoosh');
    this.isOpen.set(open);
  }

  toggleOpen(): void {
    if (!this.authService.isLoggedIn() && !this.isOpen()) return;
    this.setOpen(!this.isOpen());
  }

  private dragStartX = 0;
  private dragStartY = 0;
  
  onMouseDown(event: MouseEvent | TouchEvent): void {
    if (!this.authService.isLoggedIn() && !this.isOpen()) return;
    this.dragStartX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    this.dragStartY = 'touches' in event ? event.touches[0].clientY : event.clientY;
  }

  onMouseUp(event: MouseEvent | TouchEvent): void {
    if (!this.authService.isLoggedIn() && !this.isOpen()) return;
    
    const endX = 'touches' in event ? event.changedTouches[0].clientX : event.clientX;
    const endY = 'touches' in event ? event.changedTouches[0].clientY : event.clientY;
    
    const diffX = endX - this.dragStartX;
    const diffY = endY - this.dragStartY;

    if (Math.abs(diffX) > 80 && Math.abs(diffX) > Math.abs(diffY) * 2) {
      if (diffX > 0 && !this.isOpen()) this.setOpen(true);
      else if (diffX < 0 && this.isOpen()) this.setOpen(false);
    }
  }
}
