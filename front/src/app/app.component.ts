import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {NgForOf} from "@angular/common";
import {AuthService} from "./services/auth.service";

interface MenuItem {
  name: string;
  path: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule, NgForOf
  ],
  providers: [AuthService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'river-taxi';
  menuItems: MenuItem[] = []

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.setLoggedMenu();
    } else {
      this.setUnloggedMenu();
      if (this.router.url !== '/login') {
        let promise = this.router.navigate(['/login']);
        promise.then();
      }
    }
  }

  setLoggedMenu() {
    this.menuItems = [
      {name: 'Заказать', path: '/book'},
      {name: 'История', path: '/history'},
      {name: 'Настройки', path: '/settings'},
      {name: 'Выйти', path: '/logout'}
    ]
  }

  setUnloggedMenu() {
    this.menuItems = [
      {name: 'Войти', path: '/login'}
    ]
  }

  itemClick(path: string) {
    if (path === '/logout') {
      this.setUnloggedMenu();
      this.authService.removeToken();
      this.router.navigate(['/login']);
      return;
    }
  }
}
