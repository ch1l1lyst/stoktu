## 🧮 Fórmulas de los 7 Indicadores Clave

---

### 1️⃣ Ingresos Totales por Ventas

**Objetivo:** Saber cuánto dinero está generando el negocio.

**Fórmula:**

```
Ingresos Totales = Σ (Cantidad Vendida × Precio Unitario)
```

**Condición:** Solo ventas con estado = "completado".

---

### 2️⃣ Margen Bruto de Ganancia

**Objetivo:** Saber la ganancia real después de cubrir el costo del producto.

**Fórmula:**

```
Margen Bruto = Σ [ (Precio Unitario - Costo del Producto) × Cantidad Vendida ]
```

**Condición:** Solo ventas completadas, uniendo cada venta con su producto.

---

### 3️⃣ Eficiencia de Proveedores (% Cumplimiento)

**Objetivo:** Medir qué tan confiables son tus proveedores.

**Fórmula:**

```
% Cumplimiento = (Suma de Cantidad Recibida / Suma de Cantidad Solicitada) × 100
```

**Condición:** Solo reposiciones con estado = "recibido".

---

### 4️⃣ Alerta de Stock Bajo

**Objetivo:** Identificar productos que están a punto de agotarse.

**Fórmula:**

```
Stock Bajo = Productos donde Stock Actual ≤ Umbral (ej. 30 unidades)
```

**Opcional:** Puedes ajustar el umbral según el producto (si es de alta rotación, umbral más alto).

---

### 5️⃣ Productividad por Vendedor

**Objetivo:** Evaluar desempeño de cada vendedor.

**Monto Vendido:**

```
Monto Vendido = Σ (Cantidad Vendida × Precio Unitario)
```

**Pedidos Completados:**

```
Pedidos Completados = Conteo de ventas completadas
```

**Condición:** Solo vendedores con rol = "personal" y ventas completadas.

---

### 6️⃣ Rotación de Inventario

**Objetivo:** Saber qué tan rápido se vende el inventario.

**Fórmula:**

```
Rotación = Costo de Productos Vendidos / Valor Actual del Inventario
```

**Donde:**

- **Costo de Productos Vendidos:** Σ (Cantidad Vendida × Costo del Producto) en ventas completadas.
- **Valor Actual del Inventario:** Σ (Stock Actual × Costo del Producto) de todos los productos.

---

### 7️⃣ Días de Inventario

**Objetivo:** Saber en cuántos días se vendería todo el inventario actual.

**Fórmula:**

```
Días de Inventario = 365 / Rotación de Inventario
```

**Alternativa según período:** Si usas un período de 30 días, cambia 365 por 30. Si usas 12 meses, usa 365.

---

## 📊 Resumen de Fórmulas

| Indicador               | Fórmula                           |
| ----------------------- | --------------------------------- |
| **Ingresos Totales**    | Σ(Cantidad × Precio)              |
| **Margen Bruto**        | Σ[(Precio - Costo) × Cantidad]    |
| **% Cumplimiento**      | (Σ Recibido / Σ Solicitado) × 100 |
| **Stock Bajo**          | Productos con Stock ≤ Umbral      |
| **Monto Vendido**       | Σ(Cantidad × Precio)              |
| **Pedidos Completados** | Conteo de ventas completadas      |
| **Rotación**            | Costo Vendido / Valor Inventario  |
| **Días Inventario**     | 365 / Rotación                    |
