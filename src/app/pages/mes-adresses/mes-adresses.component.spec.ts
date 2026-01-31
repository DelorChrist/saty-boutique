import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesAdressesComponent } from './mes-adresses.component';

describe('MesAdressesComponent', () => {
  let component: MesAdressesComponent;
  let fixture: ComponentFixture<MesAdressesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesAdressesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MesAdressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
