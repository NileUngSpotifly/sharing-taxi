import {Component, OnInit} from '@angular/core';
import {SettingsService, UserLocation} from "../../services/settings.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  providers: [SettingsService]
})
export class SettingsComponent implements OnInit {
  points : UserLocation[] = [];

  constructor(private settingsService: SettingsService) {
  }

  ngOnInit(): void {
    this.points = this.settingsService.getSettings().points;
  }

  selectLocation(value: UserLocation) {
    if (value === null) {
      return;
    }
    this.settingsService.setLocation(value);
  }
}
