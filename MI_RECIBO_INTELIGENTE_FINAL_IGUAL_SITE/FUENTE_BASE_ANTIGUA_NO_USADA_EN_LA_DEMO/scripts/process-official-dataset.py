from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "backend" / "data" / "raw"
PROCESSED = ROOT / "backend" / "data" / "processed"
PROCESSED.mkdir(parents=True, exist_ok=True)

FILES = {
    "billing": "FACTURACION-CLIENTES.csv",
    "orders": "Ordenes.csv",
    "proration": "BRAINY_PRORRATEO_ALTASV3.csv",
    "reconnection": "BRAINY_RECONEXIONESV3.csv",
    "discounts": "BRAINY_DESCUENTOS_CUOTAS.csv",
    "credit_notes": "NOTAS_CREDITO.csv",
    "customers": "PLANTA CLIENTES",
}


def decode(path: Path) -> tuple[str, str]:
    raw = path.read_bytes()
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            return raw.decode(encoding), encoding
        except UnicodeDecodeError:
            pass
    return raw.decode("latin-1", errors="replace"), "latin-1-replace"


def sniff(text: str) -> str:
    sample = text[:10000]
    try:
        return csv.Sniffer().sniff(sample, delimiters=",;\t|").delimiter
    except csv.Error:
        return ";" if sample.count(";") > sample.count(",") else ","


def inspect_file(path: Path) -> dict:
    text, encoding = decode(path)
    delimiter = sniff(text)
    reader = csv.DictReader(text.splitlines(), delimiter=delimiter)
    columns = reader.fieldnames or []
    count = 0
    samples = []
    for row in reader:
        count += 1
        if len(samples) < 3:
            samples.append({k: row.get(k) for k in columns[:10]})
    return {
        "filename": path.name,
        "bytes": path.stat().st_size,
        "encoding": encoding,
        "delimiter": delimiter,
        "rows": count,
        "columns": columns,
        "sample": samples,
    }


def normalized_rows(path: Path):
    text, _ = decode(path)
    delimiter = sniff(text)
    yield from csv.DictReader(text.splitlines(), delimiter=delimiter)


def first_value(row: dict, *keys: str):
    lookup = {str(k).strip().lower(): v for k, v in row.items()}
    for key in keys:
        value = lookup.get(key.lower())
        if value not in (None, ""):
            return str(value).strip()
    return None


def build_indexes(available: dict[str, Path]) -> dict:
    result = {}

    if "proration" in available:
        rows = list(normalized_rows(available["proration"]))
        result["proration"] = {
            "rows": len(rows),
            "receipt_examples": [first_value(r, "NumeroRecibo") for r in rows[:10]],
            "amount_examples": [first_value(r, "suma_prorrateo") for r in rows[:10]],
            "join_keys": ["BA", "CuentaFinanciera", "NumeroRecibo"],
        }

    if "reconnection" in available:
        rows = list(normalized_rows(available["reconnection"]))
        descriptions = Counter(first_value(r, "Descripcion") or "SIN_DESCRIPCION" for r in rows)
        result["reconnection"] = {
            "rows": len(rows),
            "top_descriptions": descriptions.most_common(8),
            "receipt_examples": [first_value(r, "NumeroRecibo") for r in rows[:10]],
            "amount_examples": [first_value(r, "Monto") for r in rows[:10]],
            "join_keys": ["BA", "CuentaFinanciera", "Codigo", "NumeroRecibo"],
        }

    if "discounts" in available:
        rows = list(normalized_rows(available["discounts"]))
        translations = Counter(first_value(r, "Traduccion") or "SIN_TIPO" for r in rows)
        result["discounts"] = {
            "rows": len(rows),
            "top_types": translations.most_common(10),
            "examples": [
                {
                    "billing_arrangement": first_value(r, "BillingArrangement"),
                    "financial_account": first_value(r, "cuentafinanciera"),
                    "end": first_value(r, "FechaFin"),
                    "amount": first_value(r, "Monto_Descuento"),
                    "description": first_value(r, "Descripcion"),
                }
                for r in rows[:10]
            ],
            "join_keys": ["BillingArrangement", "cuentafinanciera", "chargecode"],
        }

    if "credit_notes" in available:
        rows = list(normalized_rows(available["credit_notes"]))
        result["credit_notes"] = {
            "rows": len(rows),
            "join_keys": ["RECEIVER_CUSTOMER", "BA_NO", "SERVICE_RECEIVER_ID", "CHARGE_CODE"],
        }

    if "orders" in available:
        rows = list(normalized_rows(available["orders"]))
        result["orders"] = {
            "rows": len(rows),
            "join_keys": ["CUSTOMER_KEY", "SUBSCRIBER_KEY"],
            "reason_examples": [first_value(r, "ORDER_ACTION_REASON_DESC") for r in rows[:10]],
        }

    if "billing" in available:
        # FACTURACION-CLIENTES puede ser grande: no lo cargamos completo en memoria.
        count = 0
        charge_groups = Counter()
        invoice_examples = []
        for row in normalized_rows(available["billing"]):
            count += 1
            group = first_value(row, "GRUPO")
            if group:
                charge_groups[group] += 1
            if len(invoice_examples) < 10:
                invoice_examples.append(first_value(row, "LEGAL_INVOICE_NUMBER"))
        result["billing"] = {
            "rows": count,
            "top_groups": charge_groups.most_common(12),
            "invoice_examples": invoice_examples,
            "join_keys": ["FINANCIAL_ACCOUNT_KEY", "CUSTOMER_KEY", "SUBSCRIBER_KEY", "LEGAL_INVOICE_NUMBER"],
        }

    return result


def main():
    available = {key: RAW / name for key, name in FILES.items() if (RAW / name).exists()}
    missing = [name for key, name in FILES.items() if key not in available]

    inspection = {key: inspect_file(path) for key, path in available.items()}
    indexes = build_indexes(available)
    payload = {
        "purpose": "Resumen técnico local del dataset oficial. No contiene API keys ni se usa para publicar datos personales.",
        "available_files": sorted(path.name for path in available.values()),
        "missing_files": missing,
        "inspection": inspection,
        "indexes": indexes,
        "recommended_flow": [
            "Identificar cliente/cuenta/suscripción",
            "Obtener recibo actual y anterior de FACTURACION-CLIENTES",
            "Comparar cargos y total",
            "Cruzar órdenes y tablas especializadas",
            "Construir evidencia VERIFIED/PARTIAL/NONE",
            "Entregar solo hechos estructurados a LucIA/Gemini",
        ],
    }
    output = PROCESSED / "official_dataset_summary.json"
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Resumen generado: {output}")
    if missing:
        print("Faltan archivos en backend/data/raw:")
        for item in missing:
            print(f"  - {item}")


if __name__ == "__main__":
    main()
