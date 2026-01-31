import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NouveauxProduitsComponent } from './nouveaux-produits.component';

describe('NouveauxProduitsComponent', () => {
  let component: NouveauxProduitsComponent;
  let fixture: ComponentFixture<NouveauxProduitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NouveauxProduitsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NouveauxProduitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
