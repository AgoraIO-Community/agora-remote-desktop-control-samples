import { Injectable, NgModule } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, map, mergeMap, Observable, Subject } from 'rxjs';
import { ControlledOptions, HostOptions, Options, RTCEngineType } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
@NgModule()
export class ParametersService {

  async getUserId(activeRoute: ActivatedRoute): Promise<string> {
    const params = await firstValueFrom(activeRoute.params);
    return params['userId'] as string;
  }

  async getOptions<T extends Options>(activeRoute: ActivatedRoute): Promise<T> {
    const queryParams = await firstValueFrom(activeRoute.queryParams);
    return JSON.parse(window.atob(queryParams['opts'] as string)) as T;
  }
}
