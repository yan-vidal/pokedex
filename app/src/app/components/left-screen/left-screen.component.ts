import { Component, input, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPokemonDetails } from '@shared/interfaces/pokemon.interface';
import { Pokemon3dViewerComponent } from '../pokemon-3d-viewer/pokemon-3d-viewer.component';

@Component({
  selector: 'app-left-screen',
  standalone: true,
  imports: [CommonModule, Pokemon3dViewerComponent],
  templateUrl: './left-screen.component.html',
  styleUrl: './left-screen.component.scss'
})
export class LeftScreenComponent {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  pokemon = input<IPokemonDetails | null>(null);
  viewMode = input<'artwork' | 'details'>('artwork');
  isOpen = input<boolean>(false);

  displayMode = signal<'2d' | '3d'>('2d');
  activeTab = signal<number>(0);
  tabs = ['BIOS', 'STATS', 'MOVES', 'DATA'];
  isPlaying = signal(false);
  barHeights = signal<number[]>([20, 20, 20, 20, 20, 20, 20]);
  
  // Joystick State
  joystickPos = signal({ x: 0, y: 0 });
  private isDraggingJoystick = false;
  private joystickRadius = 12; // Maximum travel distance
  private lastTriggerTime = 0;
  private triggerInterval = 150; // ms between repeated actions

  private currentAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrame: number | null = null;

  // Handlers for Joystick
  onJoystickStart(event: MouseEvent | TouchEvent) {
    this.isDraggingJoystick = true;
    this.handleJoystickMove(event);
  }

  handleJoystickMove(event: MouseEvent | TouchEvent) {
    if (!this.isDraggingJoystick) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    // Get joystick container center
    const stickBase = document.getElementById('joystick-base');
    if (!stickBase) return;
    
    const rect = stickBase.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate delta and clamp to radius
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.joystickRadius) {
      dx = (dx / distance) * this.joystickRadius;
      dy = (dy / distance) * this.joystickRadius;
    }

    this.joystickPos.set({ x: dx, y: dy });
    this.detectJoystickAction(dx, dy);
  }

  onJoystickEnd() {
    this.isDraggingJoystick = false;
    this.joystickPos.set({ x: 0, y: 0 });
  }

  private detectJoystickAction(x: number, y: number) {
    const now = Date.now();
    if (now - this.lastTriggerTime < this.triggerInterval) return;

    const threshold = 8; // Min distance to trigger action
    
    // Check dominant direction
    if (Math.abs(x) > Math.abs(y)) {
      if (x > threshold) {
        this.navigateTab('next');
        this.lastTriggerTime = now;
      } else if (x < -threshold) {
        this.navigateTab('prev');
        this.lastTriggerTime = now;
      }
    } else {
      if (y > threshold) {
        this.scrollContent('down');
        this.lastTriggerTime = now;
      } else if (y < -threshold) {
        this.scrollContent('up');
        this.lastTriggerTime = now;
      }
    }
  }

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
