export type ProductoData = {
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
};

export type ProductoItem = ProductoData & { id: string };
