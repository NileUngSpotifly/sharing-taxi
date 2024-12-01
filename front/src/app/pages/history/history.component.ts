import {Component, OnInit} from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {DatePipe} from "@angular/common";
import {Order, UserService} from "../../../gen";
export interface HistoryItem {
  date: Date;
  from: string;
  to: string;
  status: string;
}

// const HISTORY_DATA: HistoryItem[] = [
//   {date: new Date(), from: 'Пирс 1', to: 'Пирс 2', price: 100, distance: 3},
//   {date: new Date(), from: 'Пирс 3', to: 'Пирс 4', price: 200, distance: 10},
// ];

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  providers: [DatePipe, UserService]
})
export class HistoryComponent implements OnInit {
  displayedColumns: string[] = ['date', 'from', 'to', 'status'];
  dataSource: HistoryItem[] = [];
  clickedRows = new Set<HistoryItem>();

  constructor(private datePipe: DatePipe, private userService: UserService) {
  }

  ngOnInit(): void {
    this.userService.userHistoryList().subscribe(data => {
      this.dataSource = data.map(this.toViewRow);
    });
  }

  toViewRow(item: Order): HistoryItem {
    let status = '';
    switch (item.order_status) {
      case Order.OrderStatusEnum.Active:
        status = 'Активен';
        break;
      case Order.OrderStatusEnum.InSearch:
        status = 'В поиске';
        break;
      case Order.OrderStatusEnum.Waiting:
        status = 'В ожидании';
        break;
      case Order.OrderStatusEnum.Finished:
        status = 'Завершен';
        break;
      case Order.OrderStatusEnum.Cancelled:
        status = 'Отменен';
        break;
      case Order.OrderStatusEnum.NoVehicles:
        status = 'Нет доступных такси';
        break;
      case Order.OrderStatusEnum.RouteError:
        status = 'Отсутствует маршрут';
        break;
    }

    return {
      date: item.created_datetime ?? new Date(),
      from: item.from_port.toString(),
      to: item.to_port.toString(),
      status: status,
    };
  }

  historyItemToString(item: HistoryItem): string {
    return JSON.stringify(item);
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy hh:mm') || '';
  }
}
