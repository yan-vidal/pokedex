import { Component, input, output, ChangeDetectionStrategy, ViewChild, ElementRef, afterRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPokemon, IPokemonDetails } from '@shared/interfaces/pokemon.interface';

@Component({
  selector: 'app-right-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './right-screen.component.html',
  styleUrl: './right-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightScreenComponent {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  protected readonly Math = Math;

  pokemons = input<IPokemon[]>([]);
  selectedPokemon = input<IPokemonDetails | null>(null);
  isOpen = input<boolean>(false);
  isLoading = input<boolean>(false);

  onSelect = output<string>();
  onNext = output<void>();
  onPrev = output<void>();

  private lastCount = 0;

  constructor() {
    afterRender(() => {
      const currentCount = this.pokemons().length;
      
      if (currentCount > this.lastCount && !this.isLoading()) {
        this.lastCount = currentCount;
        this.scrollToBottom();
      }
      
      if (currentCount < this.lastCount) {
        this.lastCount = currentCount;
      }
    });
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      const container = this.scrollContainer.nativeElement;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  getPokemonId(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 2];
  }

  getPokemonImageUrl(url: string): string {
    const id = this.getPokemonId(url);
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }
}
