import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAuthService } from '../../services/auth.service.interface';
import { ISfxService } from '../../services/sfx.service.interface';

@Component({
  selector: 'app-cover-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cover-display.component.html',
  styleUrl: './cover-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoverDisplayComponent implements OnInit {
  private readonly authService = inject(IAuthService);
  public readonly sfx = inject(ISfxService);
  
  isLoggedIn = this.authService.isLoggedIn;
  username = signal('');
  password = signal('');
  activeField = signal<'user' | 'pass'>('user');
  
  mode = signal<'login' | 'register'>('login');
  errorMessage = signal<string | null>(null);
  statusMessage = signal<string>('IDENTITY VERIFICATION');
  isLoading = signal(false);

  keyboardKeys = ['1','2','3','A','B','C','4','5','6','D','E','F','7','8','9','G','H','I','0','J','K','L'];

  ngOnInit() {
    if (this.isLoggedIn()) {
      const user = this.authService.currentUser();
      if (user) {
        this.username.set(user.name);
        this.password.set('******');
        this.statusMessage.set('ACCESS GRANTED');
      }
    }
  }

  handleKeyPress(key: string) {
    this.sfx.play('keyboard');
    this.errorMessage.set(null);
    
    if (key === 'DEL') {
      if (this.activeField() === 'user') this.username.update(v => v.slice(0, -1));
      else this.password.update(v => v.slice(0, -1));
      return;
    }

    if (this.activeField() === 'user' && this.username().length < 8) {
      this.username.update(v => v + key);
    } else if (this.activeField() === 'pass' && this.password().length < 12) {
      this.password.update(v => v + key);
    }
  }

  handleAction() {
    this.sfx.play('pop');
    if (!this.username() || !this.password()) {
      this.errorMessage.set('FIELDS REQUIRED');
      this.sfx.play('incorrect');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (this.mode() === 'login') {
      this.authService.login(this.username(), this.password()).subscribe({
        next: () => {
          this.statusMessage.set('ACCESS GRANTED');
          this.sfx.play('correct');
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.sfx.play('incorrect');
          if (err.status === 401) {
            this.errorMessage.set('INVALID CODE');
          } else if (err.status === 404) {
             this.mode.set('register');
             this.statusMessage.set('ID NOT FOUND. REGISTER?');
          } else {
            this.errorMessage.set('SYSTEM ERROR');
          }
        }
      });
    } else {
      this.authService.register(this.username(), this.password()).subscribe({
        next: () => {
          this.mode.set('login');
          this.handleAction();
        },
        error: () => {
          this.isLoading.set(false);
          this.sfx.play('incorrect');
          this.errorMessage.set('REGISTRATION FAILED');
        }
      });
    }
  }

  logout() {
    this.sfx.play('pop');
    this.authService.logout();
    this.username.set('');
    this.password.set('');
    this.activeField.set('user');
    this.statusMessage.set('IDENTITY VERIFICATION');
    this.errorMessage.set(null);
    this.mode.set('login');
  }

  cancelRegister() {
    this.sfx.play('pop');
    this.mode.set('login');
    this.statusMessage.set('IDENTITY VERIFICATION');
    this.errorMessage.set(null);
  }
}
