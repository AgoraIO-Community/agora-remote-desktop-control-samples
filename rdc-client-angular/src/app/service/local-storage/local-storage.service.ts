import { Injectable, NgModule } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
@NgModule()
export class LocalStorageService {
  constructor() {}

  get<T = any>(key: string): T | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  set(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
