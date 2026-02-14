import { Injectable } from '@angular/core';
import { ISfxService, SoundType } from './sfx.service.interface';

@Injectable({
  providedIn: 'root'
})
export class SfxService implements ISfxService {
  private audioCtx: AudioContext | null = null;

  private readonly soundStrategies: Record<SoundType, (ctx: AudioContext, now: number) => void> = {
    /** High-pitched ascending chime for success actions */
    correct: (ctx, now) => {
      const { osc, gain } = this.createNodes(ctx);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      this.startAndStop(osc, now, 0.6);
    },

    /** Low-pitched descending buzz for errors or invalid actions */
    incorrect: (ctx, now) => {
      const { osc, gain } = this.createNodes(ctx);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      this.startAndStop(osc, now, 0.3);
    },

    /** Arpeggio sequence for saving data or milestone events */
    record: (ctx, now) => {
      const { osc, gain } = this.createNodes(ctx);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.50, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      this.startAndStop(osc, now, 1.5);
    },

    /** Rapid triumphant square-wave sequence for unlocks */
    achievement: (ctx, now) => {
      const { osc, gain } = this.createNodes(ctx);
      osc.type = 'square';
      [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, now + (i * 0.08));
      });
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      this.startAndStop(osc, now, 2.0);
    },

    /** Quick mid-range pop for UI transitions and plastic buttons */
    pop: (ctx, now) => {
      const { osc, gain } = this.createNodes(ctx);
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      this.startAndStop(osc, now, 0.05);
    },

    /** Sharp, high-frequency snap for D-pad or tactile switches */
    click: (ctx, now) => {
      const noise = ctx.createOscillator();
      noise.type = 'square';
      noise.frequency.setValueAtTime(1200, now);
      noise.frequency.exponentialRampToValueAtTime(400, now + 0.02);
      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.05, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      noise.connect(clickGain);
      clickGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.02);

      const { osc, gain } = this.createNodes(ctx);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      this.startAndStop(osc, now, 0.04);
    },

    /** Atmospheric wind noise for sliding panels or screen transitions */
    whoosh: (ctx, now) => {
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, now);
      filter.frequency.exponentialRampToValueAtTime(3000, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.5);
    },

    /** Realistic mechanical keyboard keypress with noise click and body resonance */
    keyboard: (ctx, now) => {
      const variation = Math.random() * 0.1 + 0.95;
      const noiseBufferSize = ctx.sampleRate * 0.02;
      const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
      const noiseOutput = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBufferSize; i++) noiseOutput[i] = Math.random() * 2 - 1;
      
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(3000 * variation, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.05, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      const { osc, gain } = this.createNodes(ctx);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150 * variation, now);
      osc.frequency.exponentialRampToValueAtTime(50 * variation, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      noiseSource.start(now);
      this.startAndStop(osc, now, 0.08);
    },

    /** Dull, low-frequency thud for joystick return or heavy impacts */
    thud: (ctx, now) => {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      const { osc, gain } = this.createNodes(ctx);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      this.startAndStop(osc, now, 0.1);
    }
  };

  private initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx?.state === 'suspended') this.audioCtx.resume();
  }

  private createNodes(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    return { osc, gain };
  }

  private startAndStop(osc: OscillatorNode, now: number, duration: number) {
    osc.start(now);
    osc.stop(now + duration);
  }

  play(type: SoundType) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const strategy = this.soundStrategies[type];
      if (strategy) strategy(this.audioCtx, this.audioCtx.currentTime);
    } catch (e) {
      console.warn("Sfx error inhibited", e);
    }
  }
}
