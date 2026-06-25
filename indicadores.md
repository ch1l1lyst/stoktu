### 1. Ingresos Totales por Ventas

**Fórmula:**  
Suma de (`ventas.cantidad` × `ventas.precio_unitario`)  
Solo ventas con `ventas.estado_pedido` = `'completado'` en el período.

**Ayuda a decidir:**  
Ves si el negocio está facturando bien, si las metas se cumplen y en qué meses flojea.

---

### 2. Margen Bruto de Ganancia

**Fórmula:**  
Suma de (`ventas.precio_unitario` − `productos.costo`) × `ventas.cantidad`  
Uniendo cada venta completada con su producto.

**Ayuda a decidir:**  
Te muestra la ganancia real después de pagar lo vendido. Si es bajo, toca subir precios, bajar costos o quitar productos que dejan poco.

---

### 3. Eficiencia de Proveedores

**Incluye dos métricas:**

- **% Cumplimiento:**  
  (Suma de `reposiciones.cantidad_recibida` / Suma de `reposiciones.cantidad_solicitada`) × 100  
  Solo reposiciones con estado `'recibido'`.
- **Plazo promedio de entrega:**  
  Promedio de (`reposiciones.fecha_recepcion` − `reposiciones.fecha_pedido`) en días, mismas reposiciones.

**Ayuda a decidir:**  
Identifica proveedores confiables y los que fallan. Así negocias condiciones, diversificas o ajustas tu inventario de seguridad.

---

### 4. Alerta de Stock Bajo

**Fórmula:**  
Productos donde `productos.stock_actual` ≤ 5 (umbral ajustable).  
Para más precisión:  
**Cobertura en días** = `stock_actual` / (Promedio diario de ventas de ese producto en los últimos 30 días).

**Ayuda a decidir:**  
Evita que te quedes sin los productos estrella, previene pérdida de ventas y clientes molestos.

---

### 5. Productividad por Vendedor

**Fórmula (para cada vendedor con `users.rol = 'personal'`):**

- **Monto vendido:** Suma de (`ventas.cantidad` × `ventas.precio_unitario`) en ventas completadas.
- **Pedidos completados:** Conteo de esas mismas ventas.

**Ayuda a decidir:**  
Sabes quién vende más, quién necesita ayuda, y te sirve para comisiones o premios.

---

### 6. Rotación de Inventario

**Fórmula:**  
Costo total de productos vendidos (período) / Valor actual del inventario a costo

- **Numerador:** Suma de (`ventas.cantidad` × `productos.costo`) de ventas completadas.
- **Denominador:** Suma de (`productos.stock_actual` × `productos.costo`) de todos los productos.

**Ayuda a decidir:**  
Te dice cuántas veces renovaste el inventario en el período. Si el número es bajo, tienes dinero estancado en bodega y hay que liquidar o dejar de comprar.

---

### 7. Días de Inventario

**Fórmula:**  
365 / Rotación de inventario (la del indicador 6).

**Ayuda a decidir:**  
Traduce la rotación a días promedio que tarda en venderse todo el inventario. Si son 500 días, la alarma suena; si son 30 días, estás muy ágil pero cuidado con quiebres de stock.

---

**Resumen:**  
Con estos 7 indicadores tienes control total de ventas, rentabilidad, proveedores, stock crítico, fuerza de ventas y salud del inventario. Es justo lo que una gerencia necesita para tomar decisiones rápidas y basadas en datos reales.
