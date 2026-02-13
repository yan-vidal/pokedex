import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPokemonDetails } from '@shared/interfaces/pokemon.interface';

@Component({
  selector: 'app-left-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './left-screen.component.html',
  styleUrl: './left-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeftScreenComponent {
  pokemon = input<IPokemonDetails | null>(null);
  viewMode = input<'artwork' | 'details'>('artwork');
  isOpen = input<boolean>(false);
}
