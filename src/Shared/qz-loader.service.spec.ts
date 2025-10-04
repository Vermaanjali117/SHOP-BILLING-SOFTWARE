import { TestBed } from '@angular/core/testing';

import { QzLoaderService } from './qz-loader.service';

describe('QzLoaderService', () => {
  let service: QzLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QzLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
