import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreBadgeComponent } from './store-badge.component';

describe('StoreBadgeComponent', () => {
  let component: StoreBadgeComponent;
  let fixture: ComponentFixture<StoreBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreBadgeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
