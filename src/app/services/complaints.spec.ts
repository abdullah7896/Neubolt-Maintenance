import { TestBed } from '@angular/core/testing';

import { Complaints } from './complaints.service';

describe('Complaints', () => {
  let service: Complaints;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Complaints);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
