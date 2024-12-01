import {ApplicationConfig, importProvidersFrom, inject, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {provideYConfig, YConfig} from 'angular-yandex-maps-v3';
import {ApiModule, Configuration, ConfigurationParameters} from "../gen";
import {AuthService} from "./services/auth.service";
import {OWL_DATE_TIME_LOCALE, OwlDateTimeIntl} from "@danielmoncada/angular-datetime-picker";
import {RuOwlDateTimeIntl} from "./extensions/date-time-picker-intl.service";

const config: YConfig = {
  apikey: '050afcd0-2f74-4b94-8aba-4817b29fbf60',
};

export function apiConfigFactory(): Configuration {
  let authService = inject(AuthService);

  if (!authService.getToken()) {
    return new Configuration();
  }

  const params: ConfigurationParameters = {
    apiKeys: {
      "Authorization": "Token " + authService.getToken()
    }
  }
  return new Configuration(params);
};

export const appConfig: ApplicationConfig = {
  providers: [
    {provide: OWL_DATE_TIME_LOCALE, useValue: 'ru'},
    {provide: OwlDateTimeIntl, useClass: RuOwlDateTimeIntl},
    importProvidersFrom(ApiModule.forRoot(apiConfigFactory)),
    provideYConfig(config),
    provideHttpClient(withInterceptorsFromDi()),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideAnimationsAsync()]
};
