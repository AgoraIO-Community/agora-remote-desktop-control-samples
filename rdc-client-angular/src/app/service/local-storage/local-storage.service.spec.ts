import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';

describe('LocalStoragaeServiceService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
