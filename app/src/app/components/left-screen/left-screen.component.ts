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
  barHeights = signal<number[]>([20, 20, 20, 20, 20, 20, 20]);

  private currentAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrame: number | null = null;

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
      this.stopAudio();

      this.currentAudio = new Audio(cryUrl);
      this.currentAudio.crossOrigin = "anonymous";
      this.currentAudio.volume = 0.3;
      
      this.setupAudioAnalysis();

      this.isPlaying.set(true);
      this.currentAudio.play().then(() => {
        this.startAnalysisLoop();
      }).catch(err => {
        console.warn('Audio play blocked or failed', err);
        this.isPlaying.set(false);
      });

      this.currentAudio.onended = () => this.stopAudio();
    }
  }

  private setupAudioAnalysis() {
    if (!this.currentAudio) return;
    
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256; 
    this.analyser.smoothingTimeConstant = 0.6;
    
    const source = this.audioContext.createMediaElementSource(this.currentAudio);
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  private startAnalysisLoop() {
    const bufferLength = this.analyser!.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      if (!this.isPlaying()) return;
      
      this.analyser!.getByteFrequencyData(dataArray);
      
      let totalAmplitude = 0;
      let weightedSum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        totalAmplitude += dataArray[i];
        weightedSum += dataArray[i] * i;
      }
      
      const centroid = totalAmplitude > 0 ? weightedSum / totalAmplitude : bufferLength / 4;
      
      const step = Math.max(2, centroid / 4);
      const newHeights = [];
      
      for (let i = -3; i <= 3; i++) {
        const targetIdx = Math.round(centroid + (i * step));
        const safeIdx = Math.max(0, Math.min(bufferLength - 1, targetIdx));
        const val = dataArray[safeIdx];
        
        const height = Math.max(15, (val / 255) * 100 * 1.2);
        newHeights.push(height);
      }
      
      this.barHeights.set(newHeights);
      this.animationFrame = requestAnimationFrame(update);
    };

    update();
  }

  private stopAudio() {
    this.isPlaying.set(false);
    this.barHeights.set([20, 20, 20, 20, 20, 20, 20]);
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
