import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  YMapComponent,
  YMapDefaultFeaturesLayerDirective,
  YMapDefaultMarkerDirective,
  YMapDefaultSchemeLayerDirective, YMapFeatureDirective, YMapMarkerDirective, YReadyEvent
} from "angular-yandex-maps-v3";
import {NgForOf} from "@angular/common";
import {YMapDefaultMarker, YMapDefaultMarkerProps} from "@yandex/ymaps3-types/packages/markers";
import {YMap, YMapEntity, YMapFeature, YMapFeatureProps, YMapMarkerProps, YMapProps} from "@yandex/ymaps3-types";
import type {LngLat} from "@yandex/ymaps3-types/common/types/lng-lat";
import {MatOption} from "@angular/material/core";
import {ymaps3} from "@yandex/ymaps3-types/packages/external";

export interface MapPoint {
  lat: number;
  lon: number;
  title: string;
  description: string;
  type: 'start' | 'end' | 'stop' | 'taxi' | 'you' | 'pier';
}

const MAP_DATA: YMapProps = {
  location: {
    center: [37.633044, 55.699628],
    zoom: 10,
  },
  theme: 'dark',
}

// https://www.latlong.net/
const PIERS_DATA: YMapDefaultMarkerProps[] = [
  {
    coordinates: [37.640793, 55.705039],
    title: 'Вы',
    subtitle: 'ваша текущая локация',
    color: 'red',
  },
  {
    coordinates: [37.687288, 55.671146],
    title: 'Такси',
    subtitle: 'локация такси',
    color: 'yellow',
  },
  {
    coordinates: [37.628448, 55.690413],
    title: 'Нагатинский',
    subtitle: 'пункт отправления',
    color: 'blue',
  },
  {
    coordinates: [37.675941, 55.689239],
    title: 'Южный речной вокзал',
    subtitle: 'остановка',
    color: 'orange',
  },
  {
    coordinates: [37.754406, 55.640955],
    title: 'Братеево',
    subtitle: 'пункт прибытия',
    color: 'blue',
  }
]

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    YMapComponent,
    YMapDefaultSchemeLayerDirective,
    YMapDefaultMarkerDirective,
    YMapDefaultFeaturesLayerDirective,
    NgForOf,
    YMapFeatureDirective,
    MatOption
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnChanges {
  @Input() points: MapPoint[] = [];
  mapProps = MAP_DATA;
  markers: YMapDefaultMarkerProps[] = [];
  lines: YMapFeatureProps[] = [];
  ymap: YMap | null = null;
  ymapItems: YMapEntity<any>[] = [];

  constructor(private elementRef: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['points']) {
      // Hack to remove all items from the map
      if (this.ymap) {
        this.ymapItems.forEach(child => {
          this.ymap?.removeChild(child);
        });
        this.ymapItems = [];
      }

      this.markers = this.points.map(this.toYaMapMarker);
      this.updateMapCenterAndZoom();
      let isPiers = this.points.filter(p => p.type === 'pier').length > 0;
      if (!isPiers) {
        this.addUserLine()
        this.addRouteLine()
      }
    }
  }

  addUserLine() {
    let userCoordinates: LngLat[] = [];
    this.points.forEach(p => {
      if (p.type === 'you' || p.type === 'start') {
        userCoordinates.push([p.lon, p.lat]);
      }
    })
    if (userCoordinates.length > 0) {
      this.lines.push({
        geometry: {
          type: 'LineString',
          coordinates: userCoordinates
        },
        style: {
          stroke: [
            {
              color: '#49fa34',
              opacity: 0.8,
              width: 3,
              dash: [5, 10]
            }
          ]
        }
      })
    }
  }

  addRouteLine() {
    let routeCoordinates: LngLat[] = [];
    this.points.forEach(p => {
      if (p.type === 'start' || p.type === 'stop' || p.type === 'end') {
        routeCoordinates.push([p.lon, p.lat]);
      }
    })
    if (routeCoordinates.length > 0) {
      this.lines.push({
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates
        },
        style: {
          stroke: [
            {
              color: '#fa3449',
              opacity: 0.7,
              width: 3
            }
          ]
        }
      })
    }
  }

  toYaMapMarker(point: MapPoint): YMapDefaultMarkerProps {
    let color = 'green';
    switch (point.type) {
      case 'start':
        color = 'blue';
        break;
      case 'end':
        color = 'blue';
        break;
      case 'stop':
        color = 'orange';
        break;
      case 'taxi':
        color = 'yellow';
        break;
      case 'you':
        color = 'red';
        break;
    }

    return {
      coordinates: [point.lon, point.lat],
      title: point.title,
      subtitle: point.description,
      color: color
    }
  }

  updateMapCenterAndZoom() {
    if (this.points.length === 0) {
      return;
    }

    const lats = this.points.map(p => p.lat);
    const lons = this.points.map(p => p.lon);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;

    this.mapProps = {
      ...this.mapProps,
      location: {
        center: [centerLon, centerLat],
        zoom: this.calculateZoom(minLat, maxLat, minLon, maxLon)
      }
    };
  }

  calculateZoom(minLat: number, maxLat: number, minLon: number, maxLon: number): number {
    const latDiff = maxLat - minLat;
    const lonDiff = maxLon - minLon;

    const maxDiff = Math.max(latDiff, lonDiff);

    if (maxDiff < 0.01) return 15;
    if (maxDiff < 0.1) return 14;
    if (maxDiff < 1) return 12;
    if (maxDiff < 10) return 10;
    return 8;
  }

  mapReady(ev: YReadyEvent<YMap>) {
    this.ymap = ev.entity;
  }

  markersReady(ev: YReadyEvent<YMapDefaultMarker>) {
    this.ymapItems.push(ev.entity);
  }

  linesReady(ev: YReadyEvent<YMapFeature>) {
    this.ymapItems.push(ev.entity);
  }
}
