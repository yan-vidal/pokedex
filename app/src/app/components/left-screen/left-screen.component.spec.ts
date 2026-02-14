import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeftScreenComponent } from './left-screen.component';
import { IPokemonDetails } from '@shared/interfaces/pokemon.interface';

describe('LeftScreenComponent', () => {
  let component: LeftScreenComponent;
  let fixture: ComponentFixture<LeftScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftScreenComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LeftScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show "SYSTEM READY" when no pokemon is selected and pokedex is open', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('pokemon', null);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('SYSTEM READY');
  });

  it('should display pokemon image and id when provided', () => {
    const mockPokemon: Partial<IPokemonDetails> = {
      id: 25,
      name: 'pikachu',
      sprites: {
        front_default: 'pika-url',
        back_default: '',
        front_shiny: '',
        back_shiny: '',
        other: {
          'official-artwork': { front_default: 'pika-artwork-url' }
        }
      }
    };

    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('pokemon', mockPokemon);
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img');
    const idText = fixture.nativeElement.textContent;

    expect(img.src).toContain('pika-artwork-url');
    expect(idText).toContain('#25');
  });

  it('should toggle display mode between 2d and 3d', () => {
    const mockPokemon: Partial<IPokemonDetails> = {
      id: 25,
      name: 'pikachu',
      sprites: { front_default: 'url', back_default: '', front_shiny: '', back_shiny: '' },
      model3d: 'model-url'
    };

    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('pokemon', mockPokemon);
    fixture.componentRef.setInput('viewMode', 'artwork');
    fixture.detectChanges();

    expect(component.displayMode()).toBe('2d');
    
    const toggleBtn = fixture.nativeElement.querySelector('button');
    toggleBtn.click();
    fixture.detectChanges();

    expect(component.displayMode()).toBe('3d');
    
    const viewer = fixture.nativeElement.querySelector('app-pokemon-3d-viewer');
    expect(viewer).toBeTruthy();
  });
});
