import { Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ProductoData, ProductoItem } from '../producto/producto.model';

const COLECCION = 'productos';
const COLECCION_CONTADORES = 'contadores';
const PREFIJO_ID = 'productito';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly referencia = collection(db, COLECCION);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  // Observable que emite la lista completa cada vez que cambia algo en Firestore.
  // onSnapshot abre la escucha; el teardown la cierra cuando nadie se suscribe.
  readonly productos$: Observable<ProductoItem[]> = new Observable<ProductoItem[]>(
    (subscriber) => {
      const detener = onSnapshot(
        this.referencia,
        (snapshot) => {
          const lista = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as ProductoData) }));
          lista.sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? ''));
          subscriber.next(lista);
        },
        (err) => subscriber.error(err),
      );
      return () => detener();
    },
  ).pipe(
    tap(() => {
      this.cargando.set(false);
      this.error.set(null);
    }),
    catchError((err) => {
      this.cargando.set(false);
      this.error.set(`No se pudo leer la colección: ${err.message}`);
      return EMPTY;
    }),
  );

  // Señal para la plantilla. toSignal se suscribe al observable y se desuscribe solo al destruir el servicio.
  readonly productos = toSignal(this.productos$, { initialValue: [] as ProductoItem[] });

  // CREAR: el ID sigue la forma productito-001, productito-002, ...
  // La transacción lee el último número, lo incrementa y guarda el producto de forma atómica.
  crear(datos: ProductoData): Promise<string> {
    const contadorRef = doc(db, COLECCION_CONTADORES, COLECCION);

    return runTransaction(db, async (transaccion) => {
      const contador = await transaccion.get(contadorRef);
      const ultimo = (contador.data()?.['ultimo'] as number | undefined) ?? 0;
      const siguiente = ultimo + 1;
      const id = `${PREFIJO_ID}-${String(siguiente).padStart(3, '0')}`;

      transaccion.set(contadorRef, { ultimo: siguiente });
      transaccion.set(doc(db, COLECCION, id), datos);
      return id;
    });
  }

  // ACTUALIZAR
  actualizar(id: string, datos: ProductoData): Promise<void> {
    return updateDoc(doc(db, COLECCION, id), { ...datos });
  }

  // ELIMINAR
  eliminar(id: string): Promise<void> {
    return deleteDoc(doc(db, COLECCION, id));
  }
}
