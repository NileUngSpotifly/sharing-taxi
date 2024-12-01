import {Component, OnInit} from '@angular/core';
import {MatListModule} from "@angular/material/list";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [MatListModule, NgForOf],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  constructor() {
  }

  ngOnInit(): void {
    // this.RiverTaxiService.RiverTaxiCommandList().subscribe(data => {
    //   if (!data.commands) {
    //     return;
    //   }
    //   this.commands = data.commands;
    // });

    // this.petService.findPetsByStatus(['sold']).subscribe(data => {
    //   console.log(data);
    // });
  }
}
