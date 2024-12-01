import {Injectable} from '@angular/core';

export interface UserLocation {
  name: string;
  lat: number;
  lon: number;
}

export interface Settings {
  points: UserLocation[];
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  points: UserLocation[] = [
    {name: 'Лужники', lat: 55.720246, lon: 37.561141},
    {name: 'Терехово', lat: 55.747836, lon: 37.459412},
    {name: 'Фили', lat: 55.744028, lon: 37.514586},
    {name: 'Полянка', lat: 55.737887, lon: 37.617231},
    {name: 'ЗИЛ', lat: 55.699868, lon: 37.643755},
    {name: 'Братеево', lat: 55.635938, lon: 37.761925},
    {name: 'Коломенское', lat: 55.663148, lon: 37.663722},
    {name: 'Павелецка', lat: 55.729707, lon: 37.642140},
    {name: 'Таганская', lat: 55.741523, lon: 37.651120},
    {name: 'Нескучный сад', lat: 55.722225, lon: 37.591618},
  ]

  constructor() {
  }

  getSettings(): Settings {
    return {
      points: this.points
    };
  }

  getCurrentLocation(): UserLocation {
    const location = localStorage.getItem('location');
    if (location) {
      let find = this.points.find(point => point.name === location);
      if (find) {
        return find;
      }
    }

    this.setLocation(this.points[0]);

    return this.points[0];
  }

  setLocation(location: UserLocation): void {
    localStorage.setItem('location', location.name);
  }
}
