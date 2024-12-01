import {CanActivateFn, Router, Routes} from '@angular/router';
import {ListComponent} from "./pages/list/list.component";
import {BookComponent} from "./pages/book/book.component";
import {HistoryComponent} from "./pages/history/history.component";
import {LoginComponent} from "./pages/login/login.component";
import {inject} from "@angular/core";
import {AuthService} from "./services/auth.service";
import {SettingsComponent} from "./pages/settings/settings.component";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

export const routes: Routes = [
  {path: '', component: BookComponent, canActivate: [authGuard]},
  {path: 'book', component: BookComponent, canActivate: [authGuard]},
  {path: 'history', component: HistoryComponent, canActivate: [authGuard]},
  {path: 'settings', component: SettingsComponent, canActivate: [authGuard]},
  {path: 'login', component: LoginComponent},
];
