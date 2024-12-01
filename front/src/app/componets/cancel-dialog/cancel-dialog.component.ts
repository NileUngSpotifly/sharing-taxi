import {Component, inject, model} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {NgIf} from "@angular/common";

export interface DialogData {
  model: any;
  title: string;
  question: string;
  cancel: string;
  ok: string;
}

@Component({
  selector: 'app-cancel-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    NgIf,
  ],
  templateUrl: './cancel-dialog.component.html',
  styleUrl: './cancel-dialog.component.scss'
})
export class CancelDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CancelDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly send = model(true);

  onNoClick(): void {
    this.dialogRef.close();
  }
}
