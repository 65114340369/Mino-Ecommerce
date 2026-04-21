import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    @if (showShell()) {
      <app-navbar />
    }
    <main>
      <router-outlet />
    </main>
    @if (showShell()) {
      <app-footer />
    }
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    main { flex: 1; }
  `],
})
export class App {
  private readonly router = inject(Router);

  // ซ่อน navbar/footer ในหน้า admin (มี layout เอง) และ admin/login
  protected readonly showShell = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        return !url.startsWith('/admin');
      }),
    ),
    { initialValue: true },
  );
}
