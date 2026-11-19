import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Producto } from './producto';
import { ProductoService } from '../Services/producto.service';

describe('Producto', () => {
  let fixture: ComponentFixture<Producto>;

  beforeEach(async () => {
    // Se usa un servicio falso para no conectarse a Firestore durante las pruebas.
    const servicioFalso = {
      productos: signal([]),
      cargando: signal(false),
      error: signal(null),
      crear: () => Promise.resolve('id-prueba'),
      actualizar: () => Promise.resolve(),
      eliminar: () => Promise.resolve(),
    };

    await TestBed.configureTestingModule({
      imports: [Producto],
      providers: [{ provide: ProductoService, useValue: servicioFalso }],
    }).compileComponents();

    fixture = TestBed.createComponent(Producto);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
