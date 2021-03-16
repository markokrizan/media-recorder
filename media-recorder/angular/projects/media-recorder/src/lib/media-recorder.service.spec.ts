import { TestBed } from '@angular/core/testing';

import { MediaRecorderService } from './media-recorder.service';

describe('MediaRecorderService', () => {
  let service: MediaRecorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaRecorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
