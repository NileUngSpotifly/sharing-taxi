import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {Login, LoginService} from "../../../gen";
import {MatFormField, MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFabButton} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, FormsModule,
    MatIconModule,
    MatLabel,
    ReactiveFormsModule,
    MatFabButton
  ],
  providers: [LoginService, AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  formGroup: FormGroup;
  hide = signal(true);

  constructor(private loginService: LoginService, private authService: AuthService, private router: Router) {
    this.formGroup = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/book']);
    }
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  login() {
    if (!this.formGroup.valid) {
      return
    }

    let data: Login = {
      email: this.formGroup.get('email')?.value,
      password: this.formGroup.get('password')?.value
    };

    this.loginService.loginCreate(data).subscribe(data => {
      this.authService.saveToken(data.token);
      location.href = '/book';
    });
  }
}
