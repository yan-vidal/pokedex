export abstract class ISfxService {
  abstract play(type: SoundType): void;
}

export type SoundType = 
  | 'correct' 
  | 'incorrect' 
  | 'record' 
  | 'achievement' 
  | 'pop' 
  | 'click' 
  | 'whoosh' 
  | 'keyboard' 
  | 'thud';
