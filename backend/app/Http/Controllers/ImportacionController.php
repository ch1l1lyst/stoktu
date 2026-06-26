<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\Producto;
use App\Models\Importacion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ImportacionController extends Controller
{
    public function index()
    {
        return Importacion::with('user')->orderBy('created_at', 'desc')->get();
    }

    public function destroy($id)
    {
        $importacion = Importacion::findOrFail($id);

        DB::beginTransaction();
        try {
            foreach ($importacion->ventas as $venta) {
                if ($venta->producto) {
                    $venta->producto->stock_actual += $venta->cantidad;
                    $venta->producto->save();
                }
            }

            $importacion->ventas()->delete();
            $importacion->delete();

            DB::commit();

            return response()->json(['message' => 'Importación eliminada correctamente.'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'No se pudo eliminar la importación: ' . $e->getMessage()], 500);
        }
    }

    public function validateImport(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:txt,csv|max:5120',
        ]);

        $file = $request->file('archivo');
        $result = $this->processCsv($file, false);

        if (isset($result['error'])) {
            return response()->json([
                'dry_run'      => true,
                'total_filas'  => 0,
                'valid_count'  => 0,
                'error_count'  => 1,
                'errors'       => [['linea' => 0, 'errores' => [$result['error']]]],
                'message'      => $result['error'],
            ], 200);
        }

        return response()->json($result, 200);
    }

    public function import(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:txt,csv|max:5120',
        ]);

        $file = $request->file('archivo');
        $result = $this->processCsv($file, true);

        // Si hay un error (incluyendo duplicado), devolver con el código que corresponda
        if (isset($result['error'])) {
            // Si es duplicado, usar 409; si no, 422
            $status = isset($result['importacion_id']) ? 409 : 422;
            return response()->json($result, $status);
        }

        return response()->json($result, 200);
    }

    private function processCsv($file, $importMode = false)
    {
        $contenido = file_get_contents($file->getPathname());
        if (substr($contenido, 0, 3) === "\xEF\xBB\xBF") {
            $contenido = substr($contenido, 3);
        }
        $contenido = str_replace("\r\n", "\n", $contenido);
        $hash = md5($contenido);

        if ($importMode) {
            $existing = Importacion::where('hash', $hash)->first();
            if ($existing) {
                return [
                    'error' => 'Este archivo ya fue importado anteriormente.',
                    'importacion_id' => $existing->id,
                    'fecha' => $existing->fecha_importacion ?? $existing->created_at,
                ];
            }
        }

        $handle = fopen('php://temp', 'r+');
        fwrite($handle, $contenido);
        rewind($handle);

        $rawHeader = fgetcsv($handle);
        if ($rawHeader === false) {
            fclose($handle);
            return ['error' => 'Archivo vacío o sin cabeceras'];
        }

        $header = array_map(fn($col) => strtolower(trim($col)), $rawHeader);

        $columnMapping = [
            'producto_codigo' => ['producto_codigo', 'producto_id', 'codigo_producto', 'codigo'],
            'cantidad'        => ['cantidad', 'cant', 'qty'],
            'precio_unitario' => ['precio_unitario', 'precio', 'price', 'preciounit'],
            'fecha'           => ['fecha', 'date', 'fecha_venta', 'fecha_emision'],
            'numero_pedido'   => ['numero_pedido', 'pedido', 'order_id', 'id_pedido'],
            'estado_pedido'   => ['estado_pedido', 'estado', 'status', 'estatus'],
            'observaciones'   => ['observaciones', 'comentarios', 'notes'],
            'cliente'         => ['cliente', 'client', 'nombre_cliente'],
            'cedula'          => ['cedula', 'ci', 'numero_cedula', 'ced'],
            'sector'          => ['sector', 'zona', 'area', 'region'],
            'vendedor'        => ['vendedor', 'seller', 'vendedor_nombre'],
            'forma_pago'      => ['forma_pago', 'payment', 'metodo_pago', 'pago'],
        ];

        $indices = [];
        foreach ($columnMapping as $target => $possibleNames) {
            $idx = null;
            foreach ($possibleNames as $name) {
                $idx = array_search($name, $header);
                if ($idx !== false) break;
            }
            if ($idx === false && !in_array($target, ['cliente', 'cedula', 'sector', 'vendedor', 'forma_pago'])) {
                fclose($handle);
                return ['error' => "Columna requerida no encontrada: '$target'. Cabeceras: " . implode(', ', $rawHeader)];
            }
            if ($idx !== false) {
                $indices[$target] = $idx;
            }
        }

        $rows = [];
        $lineNumber = 1;
        $totalRows = 0;

        while (($data = fgetcsv($handle)) !== false) {
            $lineNumber++;
            $totalRows++;

            $rowData = [];
            foreach ($indices as $target => $idx) {
                $rowData[$target] = trim($data[$idx] ?? '');
            }
            foreach (['cliente', 'cedula', 'sector', 'vendedor', 'forma_pago'] as $campo) {
                if (!isset($rowData[$campo])) {
                    $rowData[$campo] = null;
                }
            }

            $estadoValido = ['pendiente', 'completado', 'cancelado'];
            $esEstado = fn($val) => in_array(strtolower(trim($val)), $estadoValido);
            $esPedido = fn($val) => preg_match('/^[A-Z0-9\-]+$/i', trim($val));

            $numPedido = $rowData['numero_pedido'] ?? '';
            $estadoPedido = $rowData['estado_pedido'] ?? '';

            if ($esEstado($numPedido) && $esPedido($estadoPedido)) {
                $temp = $rowData['numero_pedido'];
                $rowData['numero_pedido'] = $rowData['estado_pedido'];
                $rowData['estado_pedido'] = $temp;
            }

            $estadoNormalizado = strtolower(trim($rowData['estado_pedido'] ?? ''));
            if (!in_array($estadoNormalizado, $estadoValido)) {
                $rowData['estado_pedido'] = null;
            } else {
                $rowData['estado_pedido'] = $estadoNormalizado;
            }

            if (empty($rowData['numero_pedido'])) {
                $rowData['numero_pedido'] = null;
            }

            $productoCodigo = $rowData['producto_codigo'];
            $cantidadRaw    = $rowData['cantidad'];
            $precioRaw      = $rowData['precio_unitario'];
            $fechaRaw       = $rowData['fecha'];
            $vendedorNombre = $rowData['vendedor'] ?? '';

            $lineErrors = [];
            $producto = null;

            if ($productoCodigo === '') {
                $lineErrors[] = 'producto_codigo vacío';
            } else {
                $producto = Producto::find($productoCodigo);
                if (!$producto) $lineErrors[] = "producto_codigo '$productoCodigo' no existe";
            }

            $cantidad = 0;
            if ($cantidadRaw === '') {
                $lineErrors[] = 'cantidad vacía';
            } elseif (!is_numeric($cantidadRaw)) {
                $lineErrors[] = 'cantidad no es numérico';
            } else {
                $cantidad = (int) $cantidadRaw;
                if ($cantidad <= 0) {
                    $lineErrors[] = 'cantidad debe ser mayor a cero';
                } elseif ($producto && $producto->stock_actual < $cantidad) {
                    $lineErrors[] = "stock insuficiente (disponible: {$producto->stock_actual})";
                }
            }

            $precio = 0;
            if ($precioRaw !== '' && !is_numeric($precioRaw)) {
                $lineErrors[] = 'precio_unitario no es numérico';
            } elseif ($precioRaw !== '') {
                $precio = (float) $precioRaw;
            }

            $fecha = null;
            if ($fechaRaw === '') {
                $lineErrors[] = 'fecha vacía';
            } elseif (!strtotime($fechaRaw)) {
                $lineErrors[] = 'fecha inválida (formato YYYY-MM-DD)';
            } else {
                $fecha = date('Y-m-d H:i:s', strtotime($fechaRaw));
            }

            $vendedorId = null;
            if (!empty($vendedorNombre)) {
                $user = User::where('name', $vendedorNombre)->first();
                if ($user) {
                    $vendedorId = $user->id;
                } else {
                    $lineErrors[] = "Vendedor '$vendedorNombre' no encontrado en usuarios";
                }
            }

            $rows[] = [
                'linea'           => $lineNumber,
                'producto'        => $producto,
                'productoCodigo'  => $productoCodigo,
                'cantidad'        => $cantidad,
                'precio'          => $precio,
                'fecha'           => $fecha,
                'numero_pedido'   => $rowData['numero_pedido'] ?? null,
                'estado_pedido'   => $rowData['estado_pedido'] ?? null,
                'observaciones'   => $rowData['observaciones'] ?? null,
                'cliente'         => $rowData['cliente'] ?? null,
                'cedula'          => $rowData['cedula'] ?? null,
                'sector'          => $rowData['sector'] ?? null,
                'vendedor_id'     => $vendedorId,
                'forma_pago'      => $rowData['forma_pago'] ?? null,
                'errores'         => $lineErrors,
            ];
        }
        fclose($handle);

        $validRows   = array_filter($rows, fn($r) => empty($r['errores']));
        $invalidRows = array_filter($rows, fn($r) => !empty($r['errores']));

        if (!$importMode) {
            $errorDetails = array_map(fn($r) => [
                'linea'   => $r['linea'],
                'errores' => $r['errores'],
                'data'    => [
                    'producto_codigo' => $r['productoCodigo'],
                    'cantidad'        => $r['cantidad'],
                    'precio_unitario' => $r['precio'],
                    'fecha'           => $r['fecha'],
                    'numero_pedido'   => $r['numero_pedido'] ?? null,
                    'estado_pedido'   => $r['estado_pedido'] ?? null,
                    'observaciones'   => $r['observaciones'] ?? null,
                    'cliente'         => $r['cliente'] ?? null,
                    'cedula'          => $r['cedula'] ?? null,
                    'sector'          => $r['sector'] ?? null,
                    'vendedor'        => $r['vendedor'] ?? null,
                    'vendedor_id'     => $r['vendedor_id'] ?? null,
                ],
            ], $invalidRows);

            return [
                'dry_run'     => true,
                'total_filas' => $totalRows,
                'valid_count' => count($validRows),
                'error_count' => count($invalidRows),
                'errors'      => array_slice($errorDetails, 0, 20),
                'message'     => "Prevalidación completada. Se encontraron " . count($invalidRows) . " errores.",
            ];
        }

        DB::beginTransaction();
        try {
            $importacion = Importacion::create([
                'nombre_archivo'    => $file->getClientOriginalName(),
                'hash'              => $hash,
                'user_id'           => auth()->id(),
                'fecha_importacion' => Carbon::now()->toDateString(),
                'total_filas'       => $totalRows,
                'insertadas'        => count($validRows),
                'errores'           => count($invalidRows),
                'detalle_errores'   => array_map(fn($r) => [
                    'linea'   => $r['linea'],
                    'errores' => $r['errores'],
                ], $invalidRows),
            ]);

            foreach ($validRows as $row) {
                Venta::create([
                    'producto_codigo' => $row['productoCodigo'],
                    'cantidad'        => $row['cantidad'],
                    'precio_unitario' => $row['precio'],
                    'fecha'           => $row['fecha'],
                    'numero_pedido'   => $row['numero_pedido'] ?? null,
                    'estado_pedido'   => $row['estado_pedido'] ?? null,
                    'observaciones'   => $row['observaciones'] ?? null,
                    'cliente'         => $row['cliente'] ?? null,
                    'cedula'          => $row['cedula'] ?? null,
                    'sector'          => $row['sector'] ?? null,
                    'vendedor_id'     => $row['vendedor_id'] ?? null,
                    'forma_pago'      => $row['forma_pago'] ?? null,
                    'importacion_id'  => $importacion->id,
                ]);

                if ($row['producto']) {
                    $row['producto']->stock_actual -= $row['cantidad'];
                    $row['producto']->save();
                }
            }

            DB::commit();

            return [
                'message'        => "Importación completada. " . count($validRows) . " filas insertadas, " . count($invalidRows) . " errores.",
                'success_count'  => count($validRows),
                'importacion_id' => $importacion->id,
                'errors_preview' => array_slice($importacion->detalle_errores, 0, 10),
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['error' => 'Error durante la importación: ' . $e->getMessage()];
        }
    }
}