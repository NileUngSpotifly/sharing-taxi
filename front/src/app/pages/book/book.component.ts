import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Pier, PierGroup, PierSelectorComponent} from "../../componets/pier-selector/pier-selector.component";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MapComponent, MapPoint} from "../../componets/map/map.component";
import {District, Order, OrderService, OrdersService, PortsService} from "../../../gen";
import {OwlDateTimeModule, OwlNativeDateTimeModule} from "@danielmoncada/angular-datetime-picker";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {interval, Subscription, switchMap} from "rxjs";
import {EMPTY_SUBSCRIPTION} from "rxjs/internal/Subscription";
import {SettingsService} from "../../services/settings.service";
import {MatDialog} from "@angular/material/dialog";
import {CancelDialogComponent} from "../../componets/cancel-dialog/cancel-dialog.component";

interface BookStatus {
  estimatedTime: number;
  distance: number;
  price: number;
  points: MapPoint[];
  message: string;
}

const BOOK_STATUS: BookStatus = {
  estimatedTime: 10,
  distance: 5,
  price: 1000,
  message: 'Ваше такси уже в пути',
  points: [
    {lat: 55.705039, lon: 37.640793, title: 'Вы', description: 'ваша текущая локация', type: 'you'},
    {lat: 55.671146, lon: 37.687288, title: 'Такси', description: 'локация такси', type: 'taxi'},
    {lat: 55.690413, lon: 37.628448, title: 'Нагатинский', description: 'пункт отправления', type: 'start'},
    {lat: 55.689239, lon: 37.675941, title: 'Южный речной вокзал', description: 'остановка', type: 'stop'},
    {lat: 55.640955, lon: 37.754406, title: 'Братеево', description: 'пункт прибытия', type: 'end'},
  ],
}

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [PierSelectorComponent,
    MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatInputModule,
    MatButtonModule, MatDividerModule, MatIconModule, ReactiveFormsModule, MapComponent, NgIf,
    OwlDateTimeModule,
    OwlNativeDateTimeModule, MatFormField,
  ],
  providers: [PortsService, OrderService, OrdersService, SettingsService],
  templateUrl: './book.component.html',
  styleUrl: './book.component.scss',
})
export class BookComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  formGroup: FormGroup;
  selectPierGroups: PierGroup[] = [];
  isBooked = false;
  status: BookStatus = {} as BookStatus;
  currentPiers: MapPoint[] = [];

  userOnMap: MapPoint = {lat: 55.705039, lon: 37.640793, title: 'Вы', description: 'ваша текущая локация', type: 'you'}

  drawOnMapPoints: MapPoint[] = [];

  statusSubscription: Subscription = EMPTY_SUBSCRIPTION;

  constructor(private portsService: PortsService, private orderService: OrderService, private ordersService: OrdersService, private settingsService: SettingsService) {
    this.formGroup = new FormGroup({
      pierFrom: new FormControl('', [Validators.required]),
      pierTo: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
    });
  }

  ngOnDestroy(): void {
    this.statusSubscription.unsubscribe();
  }

  ngOnInit(): void {
    let currentLocation = this.settingsService.getCurrentLocation();
    this.userOnMap.lat = currentLocation.lat;
    this.userOnMap.lon = currentLocation.lon;
    this.portsService.portsList().subscribe(data => {
      this.fillPierGroupAndDistance(data);
      let points = data.map(group => group.ports).flat().map<MapPoint>(pier => {
        let load = '';
        switch (pier.workload) {
          case 'empty':
            load = 'низкая загруженность';
            break;
          case 'busy':
            load = 'средняя загруженность';
            break;
          case 'full':
            load = 'высокая загруженность';
            break;
        }
        return {
          lat: pier.lat,
          lon: pier.lon,
          title: pier.name,
          description: load,
          type: 'pier'
        };
      });
      points.push(this.userOnMap);

      this.drawOnMapPoints = points;
    });

    this.formGroup.statusChanges.subscribe(() => {
      this.currentPiers = [];

      if (this.formGroup.get('pierFrom')) {
        const pierFrom = this.findPierById(+this.formGroup.get('pierFrom')?.value);
        if (pierFrom) {
          this.currentPiers.push({
            lat: pierFrom.lat,
            lon: pierFrom.lon,
            title: pierFrom.name,
            description: 'пункт отправления',
            type: 'start',
          });
        }
      }

      if (this.formGroup.get('pierTo')) {
        const pierTo = this.findPierById(+this.formGroup.get('pierTo')?.value);
        if (pierTo) {
          this.currentPiers.push({
            lat: pierTo.lat,
            lon: pierTo.lon,
            title: pierTo.name,
            description: 'пункт прибытия',
            type: 'end'
          });
        }
      }
    });

    if (localStorage.getItem('order_id')) {
      this.setOrderInterval(localStorage.getItem('order_id') ?? '');
    }
  }

  fillPierGroupAndDistance(data: District[]) {
    let group = data.map(this.toPierGroup);
    group.forEach(group => {
      group.piers.forEach(pier => {
        pier.distance = this.haversineDistance(this.userOnMap.lat, this.userOnMap.lon, pier.lat, pier.lon);
        pier.name += ` (${pier.distance.toFixed(1)} км)`;
      });
      group.piers.sort((a, b) => a.distance - b.distance);
    });

    this.selectPierGroups = group;
  }

  findPierById(id: number): Pier | null {
    for (const group of this.selectPierGroups) {
      for (const pier of group.piers) {
        if (pier.id === id) {
          return pier;
        }
      }
    }

    return null;
  }

  toPierGroup(district: District): PierGroup {
    return {
      name: district.name,
      piers: district.ports.map(port => {
        return {
          id: port.id ?? -1,
          name: port.name,
          distance: 0,
          lat: port.lat,
          lon: port.lon,
        };
      }),
    };
  }

  book() {
    this.drawOnMapPoints = [];

    this.ordersService.ordersCreate({
      from_port: this.formGroup.get('pierFrom')?.value,
      to_port: this.formGroup.get('pierTo')?.value,
      date: this.formGroup.get('date')?.value,
    }).subscribe(order => {
      this.drawOnMapPoints = [this.userOnMap, ...this.currentPiers];
      this.isBooked = true;
      this.setOrderInterval(order?.id?.toString() ?? '');
    })
  }

  cancel() {
    this.openDialog();
  }

  setOrderInterval(orderId: string) {
    if (orderId) {
      localStorage.setItem('order_id', orderId);

      this.statusSubscription = interval(5000) // Emit value every 5 seconds
        .pipe(
          switchMap(() => {
            return this.orderService.orderRead(orderId);
          })
        )
        .subscribe(order => {
          let orderStatus = order.order_status ?? Order.OrderStatusEnum.Active;
          let message = this.toPrettyStatus(orderStatus);

          this.status = {
            message: message,
            price: order.request?.cost ?? 0,
            distance: order.request?.distance ?? 0,
            estimatedTime: order.request?.time ?? 0,
            points: []
          };

          let onMapPoints = [this.userOnMap];
          if (this.currentPiers.length > 0) {
            onMapPoints.push(...this.currentPiers);
          }
          if (order.request?.vehicle && order.request.vehicle?.position) {
            onMapPoints.push({
              lat: order.request.vehicle.position.lat,
              lon: order.request.vehicle.position.lon,
              title: `Такси ${order.request.vehicle.name}`,
              description: `такси на ${order.request.vehicle.capacity} человек`,
              type: 'taxi'
            });
          }
          this.drawOnMapPoints = onMapPoints;
          this.isBooked = true

          if ([
            Order.OrderStatusEnum.NoVehicles,
            Order.OrderStatusEnum.RouteError,
            Order.OrderStatusEnum.Cancelled,
            Order.OrderStatusEnum.Finished,
          ].includes(orderStatus)) {
            this.statusSubscription.unsubscribe();
            setTimeout(() => {
              const dialogRef = this.dialog.open(CancelDialogComponent, {
                data: {
                  title: 'Уведомление',
                  question: `"${message}" - отслеживание статуса будет закрыто`,
                  ok: 'Закрыть'
                },
              });

              dialogRef.afterClosed().subscribe(result => {
                this.stopStatusWatch();
              });
            }, 3000);
          }
        });
    }
  }

  stopStatusWatch() {
    this.isBooked = false;
    this.drawOnMapPoints = [];
    this.statusSubscription.unsubscribe();
    localStorage.removeItem('order_id');
    location.href = '/book';
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CancelDialogComponent, {
      data: {
        title: 'Отмена заказа',
        question: 'Вы уверены, что хотите отменить заказ?',
        cancel: 'Продолжить',
        ok: 'Да, отменить'
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (localStorage.getItem('order_id')) {
          this.orderService.orderDelete(localStorage.getItem('order_id') ?? '').subscribe();
        }
        this.stopStatusWatch();
      }
    });
  }

  toPrettyStatus(status: Order.OrderStatusEnum): string {
    let message = 'Обрабатываем...';
    switch (status) {
      case Order.OrderStatusEnum.Active:
        message = 'Заказ принят';
        break;
      case Order.OrderStatusEnum.InSearch:
        message = 'Ищем для вас такси';
        break;
      case Order.OrderStatusEnum.Waiting:
        message = 'Ожидайте такси на пирсе';
        break;
      case Order.OrderStatusEnum.Finished:
        message = 'Заказ завершен';
        break;
      case Order.OrderStatusEnum.Cancelled:
        message = 'Заказ отменен';
        break;
      case Order.OrderStatusEnum.RouteError:
        message = 'Отсутсвие маршрута';
        break;
      case Order.OrderStatusEnum.NoVehicles:
        message = 'Нет доступных такси';
        break;
    }

    return message;
  }

  haversineDistance(lat1
                    :
                    number, lon1
                    :
                    number, lat2
                    :
                    number, lon2
                    :
                    number
  ):
    number {
    const toRadians = (degree: number) => degree * (Math.PI / 180);

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
  }
}
