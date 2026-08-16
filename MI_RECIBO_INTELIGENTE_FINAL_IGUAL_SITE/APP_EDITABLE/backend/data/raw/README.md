# Dataset oficial — solo local

Coloca aquí los archivos descargados del Drive oficial. **No los modifiques ni los subas al repositorio público**; esta carpeta está protegida por `.gitignore`.

Nombres esperados:

- `FACTURACION-CLIENTES.csv`
- `Ordenes.csv`
- `BRAINY_PRORRATEO_ALTASV3.csv`
- `BRAINY_RECONEXIONESV3.csv`
- `BRAINY_DESCUENTOS_CUOTAS.csv`
- `NOTAS_CREDITO.csv`
- `PLANTA CLIENTES`

Luego, desde la raíz del proyecto fuente, ejecuta:

```bash
python scripts/process-official-dataset.py
```

El script detecta delimitador y encoding, inspecciona columnas, cuenta registros y genera un resumen local en:

`backend/data/processed/official_dataset_summary.json`

La demo de cuatro escenarios utiliza datos anonimizados y patrones/montos derivados de la estructura oficial; no envía la base completa al navegador ni a Gemini.
