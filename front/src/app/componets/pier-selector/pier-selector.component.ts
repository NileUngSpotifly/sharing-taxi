import {Component, Input} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";


export interface Pier {
  id: number;
  name: string;
  distance: number;
  lat: number;
  lon: number;
}

export interface PierGroup {
  disabled?: boolean;
  name: string;
  piers: Pier[];
}


@Component({
  selector: 'app-pier-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './pier-selector.component.html',
  styleUrl: './pier-selector.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: PierSelectorComponent
    }
  ]
})
export class PierSelectorComponent implements ControlValueAccessor {
  @Input() pierGroup: PierGroup[] = [];
  @Input() placeholder: string = 'Выберите пирс';

  selectedPierId: string = '';
  disabled = false;
  onTouched: () => void = () => {};
  onChange: (value: string) => void = () => {};

  constructor() {
  }

  writeValue(obj: string): void {
    this.selectedPierId = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  setValue(value: string): void {
    if (this.disabled) {
      return;
    }

    this.selectedPierId = value;
    this.onChange(this.selectedPierId);
    this.onTouched();
  }
}
