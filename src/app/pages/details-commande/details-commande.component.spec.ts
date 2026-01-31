import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsCommandeComponent } from './details-commande.component';

describe('DetailsCommandeComponent', () => {
  let component: DetailsCommandeComponent;
  let fixture: ComponentFixture<DetailsCommandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsCommandeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailsCommandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
