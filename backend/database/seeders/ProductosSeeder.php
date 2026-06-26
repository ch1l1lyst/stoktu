<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;

class ProductosSeeder extends Seeder
{
    public function run()
    {
        $productos = [
            // ========== SANITIZANTES (29) ==========
            ['codigo' => 'PT006', 'nombre' => 'SANIPER 100', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.95, 'precio' => 2.00, 'proveedor_id' => 'PROV002', 'imagen' => '/src/assets/productos/sanitizantes/DID_SANIPER.PNG'],
            ['codigo' => 'PT007', 'nombre' => 'SANIGEL', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.75, 'precio' => 2.80, 'proveedor_id' => 'PROV008', 'imagen' => '/src/assets/productos/sanitizantes/DID_SANIGEL.PNG'],
            ['codigo' => 'PT013', 'nombre' => 'DIDIQUAT', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 0.77, 'precio' => 1.25, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/sanitizantes/DID_DIDIQUAT.PNG'],
            ['codigo' => 'PT019', 'nombre' => 'CLORO DE ALTA PUREZA', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 0.52, 'precio' => 0.70, 'proveedor_id' => 'PROV001', 'imagen' => '/src/assets/productos/sanitizantes/DID_CLORODEALTAPUREZA.PNG'],
            ['codigo' => 'PT020', 'nombre' => 'SANIMAN', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.09, 'precio' => 1.55, 'proveedor_id' => 'PROV008', 'imagen' => '/src/assets/productos/sanitizantes/DID_SANIMAN.PNG'],
            ['codigo' => 'PT022', 'nombre' => 'BACTER KAT', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 0.78, 'precio' => 1.20, 'proveedor_id' => 'PROV007', 'imagen' => '/src/assets/productos/sanitizantes/DID_BACTERKAT.PNG'],
            ['codigo' => 'PT025', 'nombre' => 'SANIPER', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 2.44, 'precio' => 3.30, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/sanitizantes/DID_SANIPER.PNG'],
            ['codigo' => 'PT033', 'nombre' => 'CATOX', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 2.58, 'precio' => 3.75, 'proveedor_id' => 'PROV005', 'imagen' => '/src/assets/productos/sanitizantes/DID_CATOX.PNG'],
            ['codigo' => 'PT035', 'nombre' => 'IODOSAN', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 2.48, 'precio' => 3.35, 'proveedor_id' => 'PROV002', 'imagen' => '/src/assets/productos/sanitizantes/DID_IODOSAN.PNG'],
            ['codigo' => 'PT039', 'nombre' => 'CLORO LIQUIDO', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 0.41, 'precio' => 0.55, 'proveedor_id' => 'PROV008', 'imagen' => '/src/assets/productos/sanitizantes/DID_CLOROLIQUIDO.PNG'],
            ['codigo' => 'PT045', 'nombre' => 'DESINFEC', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 0.93, 'precio' => 1.40, 'proveedor_id' => 'PROV001', 'imagen' => '/src/assets/productos/sanitizantes/DID_DESINFEC.PNG'],
            ['codigo' => 'PT047', 'nombre' => 'IODO LIQUIDO PURO', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 14.80, 'precio' => 16.30, 'proveedor_id' => 'PROV006', 'imagen' => '/src/assets/productos/sanitizantes/DID_IODOLIQUIDOPURO.PNG'],
            ['codigo' => 'PT048', 'nombre' => 'CREOLINA', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.70, 'precio' => 2.25, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/sanitizantes/DID_CREOLINA.PNG'],
            ['codigo' => 'PT064', 'nombre' => 'CLOTON', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 2.20, 'precio' => 3.00, 'proveedor_id' => 'PROV003', 'imagen' => '/src/assets/productos/sanitizantes/DID_CLOTON.PNG'],
            ['codigo' => 'PT066', 'nombre' => 'SANIPERSON', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.90, 'precio' => 2.75, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/sanitizantes/DID_SANIPERSON.PNG'],
            ['codigo' => 'PT074', 'nombre' => 'BACTER F', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.16, 'precio' => 1.90, 'proveedor_id' => 'PROV005', 'imagen' => '/src/assets/productos/sanitizantes/DID_BACTERF.PNG'],
            ['codigo' => 'PT075', 'nombre' => 'CLIOSAN', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.75, 'precio' => 2.37, 'proveedor_id' => 'PROV002', 'imagen' => '/src/assets/productos/sanitizantes/DID_CLIOSAN.PNG'],
            ['codigo' => 'PT083', 'nombre' => 'BACTER ST / LAVAVAJILLAS', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.16, 'precio' => 1.68, 'proveedor_id' => 'PROV008', 'imagen' => '/src/assets/productos/sanitizantes/DID_BACTERSTLAVAVAJILLAS.PNG'],
            ['codigo' => 'PTDC80', 'nombre' => 'DIOXIDO DE CLORO', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.75, 'precio' => 2.37, 'proveedor_id' => 'PROV005', 'imagen' => '/src/assets/productos/sanitizantes/DID_DIOXIDODECLORO.PNG'],
            ['codigo' => 'PT106', 'nombre' => 'SANIMAN 100', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.20, 'precio' => 1.76, 'proveedor_id' => 'PROV006', 'imagen' => '/src/assets/productos/sanitizantes/DID_SANIMAN.PNG'],
            ['codigo' => 'PTAP11', 'nombre' => 'ALCOHOL SANITIZANTE 70', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.23, 'precio' => 1.78, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/sanitizantes/DID_ALCOHOLSANITIZANTE.PNG'],
            ['codigo' => 'PT111', 'nombre' => 'SANIMAN 200', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.11, 'precio' => 1.62, 'proveedor_id' => 'PROV003', 'imagen' => '/src/assets/productos/sanitizantes/DID_SANIMAN.PNG'],
            ['codigo' => 'PT112', 'nombre' => 'CLORO GRANULADO', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.55, 'precio' => 2.47, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/sanitizantes/DID_CLOROGRANULADO.PNG'],
            ['codigo' => 'PT113', 'nombre' => 'CLORO EN PASTILLAS', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.95, 'precio' => 3.05, 'proveedor_id' => 'PROV005', 'imagen' => '/src/assets/productos/sanitizantes/DID_CLOROPASTILLAS.PNG'],
            ['codigo' => 'PT129', 'nombre' => 'PEROPAX', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.22, 'precio' => 1.78, 'proveedor_id' => 'PROV002', 'imagen' => '/src/assets/productos/sanitizantes/DID_PEROPAX.PNG'],
            ['codigo' => 'PT134', 'nombre' => 'OSIMBAL', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 0.68, 'precio' => 0.92, 'proveedor_id' => 'PROV008', 'imagen' => '/src/assets/productos/sanitizantes/DID_OSIMBAL.PNG'],
            ['codigo' => 'PT135', 'nombre' => 'ACIMBAC', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 0.77, 'precio' => 1.12, 'proveedor_id' => 'PROV001', 'imagen' => '/src/assets/productos/sanitizantes/DID_ACIMBAC.PNG'],
            ['codigo' => 'PT136', 'nombre' => 'SANIMAN 1000', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.47, 'precio' => 2.15, 'proveedor_id' => 'PROV006', 'imagen' => '/src/assets/productos/sanitizantes/DID_SANIMAN.PNG'],
            ['codigo' => 'PT137', 'nombre' => 'SANI QUICK', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 2.65, 'precio' => 3.84, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/sanitizantes/DID_SANIQUICK.PNG'],
            ['codigo' => 'PT996', 'nombre' => 'NEUTRALIZADOR DE OLORES', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 1.90, 'precio' => 3.10, 'proveedor_id' => 'PROV002', 'imagen' => '/src/assets/productos/sanitizantes/DID_NEUTRALIZADOR.PNG'],  // No hay stock  
            ['codigo' => 'PT999', 'nombre' => 'ECO CLEAN', 'categoria' => 'Sanitizantes', 'stock_actual' => 0, 'costo' => 2.10, 'precio' => 3.50, 'proveedor_id' => 'PROV003', 'imagen' => '/src/assets/productos/sanitizantes/DID_ECOCLEAN.PNG'], // No hay stock

            // ========== DESENGRASANTES (35) ==========
            ['codigo' => 'PT004', 'nombre' => 'GARANTY CLEANER', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 4.38, 'precio' => 5.90, 'proveedor_id' => 'PROV006', 'imagen' => '/src/assets/productos/desengrasantes/DID_GARANTYCLEANER.PNG'],
            ['codigo' => 'PT005', 'nombre' => 'MULTICLEAR', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 2.00, 'precio' => 2.70, 'proveedor_id' => 'PROV002', 'imagen' => '/src/assets/productos/desengrasantes/DID_MULTICLEAR.PNG'],
            ['codigo' => 'PT009', 'nombre' => 'ETER FOAM', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.16, 'precio' => 1.90, 'proveedor_id' => 'PROV008', 'imagen' => '/src/assets/productos/desengrasantes/DID_DETERFOAM.PNG'],
            ['codigo' => 'PT015', 'nombre' => 'METALUM', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.55, 'precio' => 2.10, 'proveedor_id' => 'PROV001', 'imagen' => '/src/assets/productos/desengrasantes/DID_METALUM.PNG'],
            ['codigo' => 'PT016', 'nombre' => 'ACTIVALUM', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 3.23, 'precio' => 4.35, 'proveedor_id' => 'PROV005', 'imagen' => '/src/assets/productos/desengrasantes/DID_ACTIVALUM.PNG'],
            ['codigo' => 'PT017', 'nombre' => 'FOAM OFF', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 2.53, 'precio' => 3.40, 'proveedor_id' => 'PROV003', 'imagen' => '/src/assets/productos/desengrasantes/DID_FOAMOFF.PNG'],
            ['codigo' => 'PT021', 'nombre' => 'ALKAFOAM OFF', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.50, 'precio' => 2.20, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/desengrasantes/DID_ALKAFOAMOFF.PNG'],
            ['codigo' => 'PT029', 'nombre' => 'ACEROX', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 0.87, 'precio' => 1.20, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/desengrasantes/DID_ACEROX.PNG'],
            ['codigo' => 'PT030', 'nombre' => 'DETAL FORCE', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 0.75, 'precio' => 1.00, 'proveedor_id' => 'PROV006', 'imagen' => '/src/assets/productos/desengrasantes/DID_DETALFORCE.PNG'],
            ['codigo' => 'PT031', 'nombre' => 'LIMALAK', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.19, 'precio' => 1.60, 'proveedor_id' => 'PROV002', 'imagen' => '/src/assets/productos/desengrasantes/DID_LIMALAK.PNG'],
            ['codigo' => 'PT032', 'nombre' => 'DUCAP', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.35, 'precio' => 1.80, 'proveedor_id' => 'PROV008', 'imagen' => '/src/assets/productos/desengrasantes/DID_DUPAC.PNG'],
            ['codigo' => 'PT034', 'nombre' => 'DETER GROF', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.33, 'precio' => 1.90, 'proveedor_id' => 'PROV001', 'imagen' => '/src/assets/productos/desengrasantes/DID_DETERGROF.PNG'],
            ['codigo' => 'PT038', 'nombre' => 'ACIDO PARA PISCINAS', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 0.97, 'precio' => 1.28, 'proveedor_id' => 'PROV005', 'imagen' => '/src/assets/productos/desengrasantes/DID_ACIDOPISCINAS.PNG'],
            ['codigo' => 'PTCW76', 'nombre' => 'CARWASH', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 0.80, 'precio' => 1.30, 'proveedor_id' => 'PROV003', 'imagen' => '/src/assets/productos/desengrasantes/DID_CARWASH.PNG'],
            ['codigo' => 'PT043', 'nombre' => 'DETER GAD', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 0.88, 'precio' => 1.20, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/desengrasantes/DID_DETERGAD.PNG'],
            ['codigo' => 'PT050', 'nombre' => 'MULTIDET', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 0.68, 'precio' => 1.00, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/desengrasantes/DID_MULTIDET.PNG'],
            ['codigo' => 'PT056', 'nombre' => 'SERVIGUIN', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.30, 'precio' => 1.90, 'proveedor_id' => 'PROV006', 'imagen' => '/src/assets/productos/desengrasantes/DID_SERVIGUIN.PNG'],
            ['codigo' => 'PT057', 'nombre' => 'CALIM', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.25, 'precio' => 1.82, 'proveedor_id' => 'PROV007', 'imagen' => '/src/assets/productos/desengrasantes/DID_CALIM.PNG'],
            ['codigo' => 'PT080', 'nombre' => 'SERVIGIN 500', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.25, 'precio' => 1.82, 'proveedor_id' => 'PROV008', 'imagen' => '/src/assets/productos/desengrasantes/DID_SERVIGIN.PNG'],
            ['codigo' => 'PT059', 'nombre' => 'JABONET-1', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 0.94, 'precio' => 1.25, 'proveedor_id' => 'PROV001', 'imagen' => '/src/assets/productos/desengrasantes/DID_JABONET.PNG'],
            ['codigo' => 'PT076', 'nombre' => 'DETER PREMIUM', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.52, 'precio' => 2.20, 'proveedor_id' => 'PROV005', 'imagen' => '/src/assets/productos/desengrasantes/DID_DETERPREMIUN.PNG'],
            ['codigo' => 'PT086', 'nombre' => 'ALKAFOAM', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 0.70, 'precio' => 0.95, 'proveedor_id' => 'PROV003', 'imagen' => '/src/assets/productos/desengrasantes/DID_ALKAFOAM.PNG'],
            ['codigo' => 'PT100', 'nombre' => 'ACI HEVI', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.80, 'precio' => 2.42, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/desengrasantes/DID_ACIHEVI.PNG'],
            ['codigo' => 'PT102', 'nombre' => 'DETERTIN', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 2.25, 'precio' => 3.28, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/desengrasantes/DID_DETERTIN.PNG'],
            ['codigo' => 'PT104', 'nombre' => 'DETER SHINE BRILLO', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.82, 'precio' => 2.65, 'proveedor_id' => 'PROV008', 'imagen' => '/src/assets/productos/desengrasantes/DID_SHINEBRILLO.PNG'],
            ['codigo' => 'PT107', 'nombre' => 'DETER MAX', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 2.00, 'precio' => 2.92, 'proveedor_id' => 'PROV002', 'imagen' => '/src/assets/productos/desengrasantes/DID_DETERMAX.PNG'],
            ['codigo' => 'PT109', 'nombre' => 'DETERLIQ', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.17, 'precio' => 1.70, 'proveedor_id' => 'PROV008', 'imagen' => '/src/assets/productos/desengrasantes/DID_DETERLIQ.PNG'],
            ['codigo' => 'PT117', 'nombre' => 'REMOX 12', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 2.26, 'precio' => 3.28, 'proveedor_id' => 'PROV001', 'imagen' => '/src/assets/productos/desengrasantes/DID_REMOX12.PNG'],
            ['codigo' => 'PT121', 'nombre' => 'CALTOP', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 0.73, 'precio' => 0.98, 'proveedor_id' => 'PROV002', 'imagen' => '/src/assets/productos/desengrasantes/DID_CALTOP.PNG'],
            ['codigo' => 'PT122', 'nombre' => 'ACIDO FOSFORICO 50%', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.80, 'precio' => 2.80, 'proveedor_id' => 'PROV003', 'imagen' => '/src/assets/productos/desengrasantes/DID_ACIDOFOSFORICO.PNG'],
            ['codigo' => 'PT126', 'nombre' => 'DETER MEC', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.62, 'precio' => 2.66, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/desengrasantes/DID_DETERMEC.PNG'],
            ['codigo' => 'PT128', 'nombre' => 'DETERLAV', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.30, 'precio' => 1.84, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/desengrasantes/DID_DETERLAV.PNG'],
            ['codigo' => 'PT132', 'nombre' => 'DETERLAV 100', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 2.28, 'precio' => 3.08, 'proveedor_id' => 'PROV008', 'imagen' => '/src/assets/productos/desengrasantes/DID_DETERLAV.PNG'],
            ['codigo' => 'PT133', 'nombre' => 'DETER GREEN', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 2.08, 'precio' => 2.90, 'proveedor_id' => 'PROV002', 'imagen' => '/src/assets/productos/desengrasantes/DID_DETERGREEN.PNG'],
            ['codigo' => 'PT138', 'nombre' => 'SOLOF', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.74, 'precio' => 2.52, 'proveedor_id' => 'PROV003', 'imagen' => '/src/assets/productos/desengrasantes/DID_SOLOF.PNG'],
            ['codigo' => 'PT995', 'nombre' => 'LAVAVAJILLAS PROFESIONAL', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 1.75, 'precio' => 2.95, 'proveedor_id' => 'PROV005', 'imagen' => '/src/assets/productos/desengrasantes/DID_LAVAVAJILLASPRO.PNG'], // No hay stock
            ['codigo' => 'PT998', 'nombre' => 'DESENGRASE TOTAL', 'categoria' => 'Desengrasantes', 'stock_actual' => 0, 'costo' => 2.45, 'precio' => 4.10, 'proveedor_id' => 'PROV006', 'imagen' => '/src/assets/productos/desengrasantes/DID_DESENGRASETOTAL.PNG'], // No hay stock

            // ========== OTROS PRODUCTOS (9) ==========
            ['codigo' => 'PT002', 'nombre' => 'MULTYLUBE', 'categoria' => 'Otros', 'stock_actual' => 0, 'costo' => 1.55, 'precio' => 2.00, 'proveedor_id' => 'PROV008', 'imagen' => '/src/assets/productos/otros/DID_MULTILUBE.PNG'],
            ['codigo' => 'PT008', 'nombre' => 'MULTILUBE', 'categoria' => 'Otros', 'stock_actual' => 0, 'costo' => 1.50, 'precio' => 2.25, 'proveedor_id' => 'PROV001', 'imagen' => '/src/assets/productos/otros/DID_MULTILUBE.PNG'],
            ['codigo' => 'PT011', 'nombre' => 'METABOT', 'categoria' => 'Otros', 'stock_actual' => 0, 'costo' => 2.40, 'precio' => 3.30, 'proveedor_id' => 'PROV002', 'imagen' => '/src/assets/productos/otros/DID_METABOT.PNG'],
            ['codigo' => 'PT018', 'nombre' => 'LUBE DRY', 'categoria' => 'Otros', 'stock_actual' => 0, 'costo' => 1.53, 'precio' => 2.10, 'proveedor_id' => 'PROV002', 'imagen' => '/src/assets/productos/otros/DID_LUBEDRY.PNG'],
            ['codigo' => 'PT061', 'nombre' => 'PROHAIR', 'categoria' => 'Otros', 'stock_actual' => 0, 'costo' => 1.37, 'precio' => 1.98, 'proveedor_id' => 'PROV004', 'imagen' => '/src/assets/productos/otros/DID_PROHAIR.PNG'],
            ['codigo' => 'PT082', 'nombre' => 'AGUA DESTILADA', 'categoria' => 'Otros', 'stock_actual' => 0, 'costo' => 0.40, 'precio' => 1.00, 'proveedor_id' => 'PROV005', 'imagen' => '/src/assets/productos/otros/DID_AGUADESTILADA.PNG'],
            ['codigo' => 'PT089', 'nombre' => 'PISER', 'categoria' => 'Otros', 'stock_actual' => 0, 'costo' => 1.65, 'precio' => 2.22, 'proveedor_id' => 'PROV006', 'imagen' => '/src/assets/productos/otros/DID_PISER.PNG'],
            ['codigo' => 'PT088', 'nombre' => 'SUAVIZANTE', 'categoria' => 'Otros', 'stock_actual' => 0, 'costo' => 0.56, 'precio' => 0.82, 'proveedor_id' => 'PROV007', 'imagen' => '/src/assets/productos/otros/DID_SUAVISANTE.PNG'],
            ['codigo' => 'PTAP96', 'nombre' => 'ALCOHOL POTABLE PURO', 'categoria' => 'Otros', 'stock_actual' => 0, 'costo' => 1.81, 'precio' => 2.45, 'proveedor_id' => 'PROV005', 'imagen' => '/src/assets/productos/otros/DID_ALCOHOLPOTABLEPURO.PNG'],
            ['codigo' => 'PT997', 'nombre' => 'PERFUME INDUSTRIAL', 'categoria' => 'Otros', 'stock_actual' => 0, 'costo' => 3.80, 'precio' => 6.25, 'proveedor_id' => 'PROV007', 'imagen' => '/src/assets/productos/otros/DID_PERFUMEINDUSTRIAL.PNG'], // No hay stock
            
            
        ];

        foreach ($productos as $p) {
            Producto::create($p);
        }
    }
}