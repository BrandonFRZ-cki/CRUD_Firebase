# CRUD de productos con Angular y Firebase

Aplicación web para administrar productos (crear, consultar, actualizar y eliminar) con datos persistidos en **Cloud Firestore**. Está desarrollada con **Angular 22** y el SDK web de Firebase (modular v9+).

- **Repositorio:** https://github.com/BrandonFRZ-cki/CRUD_Firebase
- **Aplicación desplegada (Vercel):** https://crud-firebase-tau.vercel.app

Práctica 02.2 de la asignatura Programación y Plataformas Web (Computación, UPS).

## Funciones del CRUD

| Operación | Descripción | Método del servicio |
|---|---|---|
| Crear | Registra un producto desde el formulario. El ID se genera como `productito-001`, `productito-002`, etc. | `crear()` |
| Consultar | Muestra todos los productos en una tabla, en tiempo real. | `productos` (escucha con `onSnapshot`) |
| Actualizar | Carga el producto seleccionado en el formulario y guarda los cambios en el mismo documento. | `actualizar()` |
| Eliminar | Pide confirmación y elimina el documento. Si se cancela, el producto se conserva. | `eliminar()` |

Validaciones del formulario:

- **Nombre:** obligatorio, mínimo 2 caracteres y con al menos una letra.
- **Precio:** obligatorio, numérico y mayor o igual a cero.
- **Stock:** obligatorio, entero y mayor o igual a cero.
- **Categoría:** obligatoria y con al menos una letra.

La aplicación muestra mensajes de éxito o error y un estado vacío cuando no hay productos.

## Modelo de producto

Colección `productos` en Cloud Firestore. Cada documento tiene estos campos:

| Campo | Tipo | Ejemplo |
|---|---|---|
| `nombre` | string | `"Laptop Lenovo"` |
| `precio` | number | `1200` |
| `stock` | number | `15` |
| `categoria` | string | `"Electrónica"` |

El ID del documento (por ejemplo, `productito-001`) se conserva para editarlo y eliminarlo.

Además, la colección `contadores` guarda el último número usado en el documento `productos` (campo `ultimo`), para generar los IDs de forma consecutiva dentro de una transacción.

## Estructura principal

```
src/app/
├── firebase/firebase.ts          # Inicializa Firebase y exporta la instancia de Firestore (db)
├── Services/producto.service.ts  # Todas las operaciones sobre Firestore (ProductoService)
├── producto/
│   ├── producto.model.ts         # Tipos ProductoData y ProductoItem
│   ├── producto.ts               # Componente: formulario, tabla y mensajes
│   ├── producto.html
│   └── producto.css
└── app.routes.ts                 # La ruta raíz carga el componente de productos
```

## Requisitos

- Node.js 20 o superior y npm.
- Una cuenta de Google y un proyecto en [Firebase](https://console.firebase.google.com/).

## Configuración de Firebase

1. En la consola de Firebase, crea un proyecto.
2. Ve a **Compilación → Firestore Database** y crea la base de datos. Elige una ubicación cercana.
3. En **Configuración del proyecto → Tus aplicaciones**, registra una app web con el ícono `</>`.
4. Copia el objeto `firebaseConfig` que muestra la consola y pégalo en `src/app/firebase/firebase.ts`, reemplazando el ejemplo.
5. En **Firestore → Reglas**, usa reglas de prueba para desarrollo:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2026, 12, 16);
       }
     }
   }
   ```

   Estas reglas dejan de permitir acceso después de la fecha indicada. Para un uso real, define reglas de seguridad adecuadas.

## Instalación y ejecución local

```bash
git clone https://github.com/BrandonFRZ-cki/CRUD_Firebase.git
cd CRUD_Firebase
npm install
npm start
```

Abre http://localhost:4200 en el navegador.

## Compilación

```bash
npm run build
```

Los archivos generados quedan en la carpeta `dist/`.

## Despliegue en Vercel

1. Importa el repositorio de GitHub desde [Vercel](https://vercel.com).
2. Vercel detecta el proyecto Angular. Usa `npm run build` como comando de compilación.
3. Despliega y verifica la URL pública.

## Pruebas

```bash
npm test
```

Las pruebas unitarias del componente usan un servicio falso, así que no se conectan a Firestore.

## Notas

- La configuración de Firebase para la web no es secreta por diseño, pero no se debe publicar la clave de otros proyectos. La seguridad real de los datos depende de las reglas de Firestore.
- Antes de desplegar, revisa que las reglas de Firestore permitan lectura y escritura durante la evaluación.
