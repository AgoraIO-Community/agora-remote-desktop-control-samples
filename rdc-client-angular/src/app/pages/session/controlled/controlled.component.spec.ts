import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlledComponent } from './controlled.component';

describe('ControlledComponent', () => {
  let component: ControlledComponent;
  let fixture: ComponentFixture<ControlledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlledComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
