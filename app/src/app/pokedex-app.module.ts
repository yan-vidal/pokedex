import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";

import { routes } from './pokedex-app.routes';
import { PokedexAppComponent } from "./pokedex-app.component";
import { PokemonService } from "./services/pokemon.service";
import { PokedexShellComponent } from "./components/pokedex-shell/pokedex-shell.component";
import { IAuthService } from "./services/auth.service.interface";
import { AuthService } from "./services/auth.service";
import { ISfxService } from "./services/sfx.service.interface";
import { SfxService } from "./services/sfx.service";
import { authInterceptor } from "./interceptors/auth.interceptor";

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    PokedexShellComponent,
  ],
  providers: [
    PokemonService,
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: IAuthService, useClass: AuthService },
    { provide: ISfxService, useClass: SfxService }
  ],
  declarations: [
    PokedexAppComponent,
  ],
  bootstrap: [PokedexAppComponent],
})
export class PokedexAppModule {}
