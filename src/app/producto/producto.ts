import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoItem } from './producto.model';
import { ProductoService } from '../Services/producto.service';

type Mensaje = { tipo: 'ok' | 'error'; texto: string };

const FORMULARIO_VACIO = { nombre: '', precio: 0, stock: 0, categoria: '' };

@Component({
  selector: 'app-producto',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './producto.html',
  styleUrl: './producto.css',
})
export class Producto {
  private readonly servicio = inject(ProductoService);
  private readonly fb = inject(FormBuilder);

  protected readonly productos = this.servicio.productos;
  protected readonly cargando = this.servicio.cargando;
  protected readonly error = this.servicio.error;

  protected readonly idEditando = signal<string | null>(null);
  protected readonly editando = computed(() => this.idEditando() !== null);
  protected readonly guardando = signal(false);
  protected readonly mensaje = signal<Mensaje | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoria: ['', Validators.required],
  });

  protected async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    const id = this.idEditando();

    this.guardando.set(true);
    try {
      if (id) {
        await this.servicio.actualizar(id, datos);
        this.informar('ok', 'Producto actualizado correctamente.');
      } else {
        await this.servicio.crear(datos);
        this.informar('ok', 'Producto creado correctamente.');
      }
      this.cancelar();
    } catch (err) {
      this.informar('error', `No se pudo guardar: ${this.descripcion(err)}`);
    } finally {
      this.guardando.set(false);
    }
  }

  protected editar(producto: ProductoItem): void {
    this.idEditando.set(producto.id);
    this.form.setValue({
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria,
    });
  }

  protected cancelar(): void {
    this.idEditando.set(null);
    this.form.reset(FORMULARIO_VACIO);
  }

  protected async eliminar(producto: ProductoItem): Promise<void> {
    if (!confirm(`¿Eliminar el producto "${producto.nombre}"?`)) {
      return;
    }
    try {
      await this.servicio.eliminar(producto.id);
      if (this.idEditando() === producto.id) {
        this.cancelar();
      }
      this.informar('ok', 'Producto eliminado correctamente.');
    } catch (err) {
      this.informar('error', `No se pudo eliminar: ${this.descripcion(err)}`);
    }
  }

  private informar(tipo: Mensaje['tipo'], texto: string): void {
    this.mensaje.set({ tipo, texto });
  }

  private descripcion(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }
}
