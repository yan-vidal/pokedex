import { Component, input, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPokemonDetails } from '@shared/interfaces/pokemon.interface';

@Component({
  selector: 'app-left-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './left-screen.component.html',
  styleUrl: './left-screen.component.scss'
})
export class LeftScreenComponent {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  pokemon = input<IPokemonDetails | null>(null);
  viewMode = input<'artwork' | 'details'>('artwork');
  isOpen = input<boolean>(false);

  activeTab = signal<number>(0);
  tabs = ['BIOS', 'STATS', 'MOVES', 'DATA'];
  isPlaying = signal(false);
  private currentAudio: HTMLAudioElement | null = null;

  navigateTab(direction: 'prev' | 'next') {
    this.activeTab.update(current => {
      if (direction === 'next') return (current + 1) % this.tabs.length;
      return current === 0 ? this.tabs.length - 1 : current - 1;
    });
  }

  scrollContent(direction: 'up' | 'down') {
    if (!this.scrollContainer) return;
    const amount = 40;
    this.scrollContainer.nativeElement.scrollBy({
      top: direction === 'up' ? -amount : amount,
      behavior: 'smooth'
    });
  }

  playCry() {
    const pk = this.pokemon();
    const cryUrl = pk?.cries?.legacy || pk?.cries?.latest;
    
    if (cryUrl) {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      this.currentAudio = new Audio(cryUrl);
      this.currentAudio.volume = 0.3;
      
      this.isPlaying.set(true);
      this.currentAudio.play().catch(err => {
        console.warn('Audio play blocked or failed', err);
        this.isPlaying.set(false);
      });

      this.currentAudio.onended = () => this.isPlaying.set(false);
    }
  }
}
