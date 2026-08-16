from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
PUBLIC = ROOT / "public" / "recibos"
OUTPUT.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

BLUE = colors.HexColor("#0877D1")
BLUE_DARK = colors.HexColor("#064F91")
CYAN = colors.HexColor("#13A9E3")
INK = colors.HexColor("#142A43")
MUTED = colors.HexColor("#667A8D")
LINE = colors.HexColor("#DDE7EF")
PALE = colors.HexColor("#F3F8FC")
GREEN = colors.HexColor("#0B936C")
ORANGE = colors.HexColor("#B76500")


RECEIPTS = [
    {
        "slug": "marzo",
        "month": "MARZO 2026",
        "period": "16 feb 2026 - 15 mar 2026",
        "issued": "31 mar 2026",
        "due": "15 abr 2026",
        "code": "F001-003842",
        "amount": 59.90,
        "previous": 59.90,
        "status": "PAGADO",
        "usage": 24.8,
        "charges": [("Plan Móvil 40 GB", 59.90)],
        "explanation": "El total se mantuvo en S/59.90. No hubo cargos adicionales ni cambios en tu plan.",
        "evidence": "Detalle del recibo de marzo y plan vigente.",
    },
    {
        "slug": "abril",
        "month": "ABRIL 2026",
        "period": "16 mar 2026 - 15 abr 2026",
        "issued": "30 abr 2026",
        "due": "15 may 2026",
        "code": "F001-004216",
        "amount": 59.90,
        "previous": 59.90,
        "status": "PAGADO",
        "usage": 26.4,
        "charges": [("Plan Móvil 40 GB", 59.90)],
        "explanation": "El monto se mantuvo igual al mes anterior. No se registraron paquetes, servicios ni ajustes adicionales.",
        "evidence": "Plan vigente y detalle de cargos del ciclo.",
    },
    {
        "slug": "mayo",
        "month": "MAYO 2026",
        "period": "16 abr 2026 - 15 may 2026",
        "issued": "31 may 2026",
        "due": "15 jun 2026",
        "code": "F001-004589",
        "amount": 62.40,
        "previous": 59.90,
        "status": "PAGADO",
        "usage": 28.1,
        "charges": [("Plan Móvil 40 GB", 59.90), ("Protección Móvil - prorrateo 5 días", 2.50)],
        "explanation": "El servicio Protección Móvil estuvo activo del 11 al 15 de mayo. Solo se cobraron esos cinco días: S/2.50.",
        "evidence": "Orden PRO-1105 y regla de prorrateo del servicio.",
    },
    {
        "slug": "junio",
        "month": "JUNIO 2026",
        "period": "16 may 2026 - 15 jun 2026",
        "issued": "30 jun 2026",
        "due": "15 jul 2026",
        "code": "F001-004954",
        "amount": 59.90,
        "previous": 62.40,
        "status": "PAGADO",
        "usage": 30.7,
        "charges": [("Plan Móvil 40 GB", 59.90)],
        "explanation": "El monto volvió a S/59.90 porque el cargo prorrateado de mayo no se repitió. Tu plan no cambió.",
        "evidence": "Plan vigente y ausencia de servicios adicionales.",
    },
    {
        "slug": "julio",
        "month": "JULIO 2026",
        "period": "16 jun 2026 - 15 jul 2026",
        "issued": "31 jul 2026",
        "due": "15 ago 2026",
        "code": "F001-005327",
        "amount": 59.90,
        "previous": 59.90,
        "status": "PAGADO",
        "usage": 27.2,
        "charges": [("Plan Móvil 40 GB", 59.90)],
        "explanation": "El monto se mantuvo estable. No encontramos variaciones frente a junio.",
        "evidence": "Comparación entre los recibos de junio y julio.",
    },
    {
        "slug": "agosto",
        "month": "AGOSTO 2026",
        "period": "16 jul 2026 - 15 ago 2026",
        "issued": "10 ago 2026",
        "due": "15 ago 2026",
        "code": "F001-005701",
        "amount": 82.90,
        "previous": 59.90,
        "status": "PENDIENTE",
        "usage": 34.8,
        "charges": [("Plan Móvil 40 GB", 59.90), ("Paquete adicional 10 GB", 15.00), ("Movistar Música", 8.00)],
        "explanation": "El aumento de S/23.00 viene de dos conceptos: un paquete de 10 GB por S/15.00 y Movistar Música por S/8.00. El precio del plan no cambió.",
        "evidence": "Orden PAQ-0810, alta MUS-0731 y detalle del recibo.",
    },
]


def money(value):
    return f"S/{value:,.2f}"


def draw_brand(c, x, y):
    c.setFillColor(CYAN)
    c.roundRect(x, y - 11 * mm, 11 * mm, 11 * mm, 3 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-BoldOblique", 16)
    c.drawCentredString(x + 5.5 * mm, y - 8.2 * mm, "M")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(x + 15 * mm, y - 5.2 * mm, "Mi Movistar")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(x + 15 * mm, y - 9.2 * mm, "Recibo móvil - documento simulado")


def draw_label_value(c, x, y, label, value, right=False):
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    draw = c.drawRightString if right else c.drawString
    draw(x, y, label.upper())
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 9)
    draw(x, y - 4.5 * mm, value)


def build_receipt(data):
    path = OUTPUT / f"recibo-{data['slug']}-2026.pdf"
    c = canvas.Canvas(str(path), pagesize=A4)
    width, height = A4
    margin = 18 * mm

    c.setTitle(f"Recibo simulado {data['month'].title()}")
    c.setAuthor("Mi Recibo Inteligente - prototipo academico")
    draw_brand(c, margin, height - 18 * mm)

    c.setFillColor(colors.HexColor("#EAF5FD"))
    c.roundRect(width - margin - 41 * mm, height - 28 * mm, 41 * mm, 13 * mm, 6.5 * mm, fill=1, stroke=0)
    c.setFillColor(BLUE_DARK)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawCentredString(width - margin - 20.5 * mm, height - 23 * mm, "SIMULACION ACADEMICA")

    y = height - 42 * mm
    c.setFillColor(MUTED)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(margin, y, "CLIENTE")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y - 5.5 * mm, "Sebastián Alexis Euribe Zambrano")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(margin, y - 10 * mm, "Linea 968 821 435  |  Cuenta simulada 000968821435")

    box_y = height - 91 * mm
    c.setFillColor(BLUE_DARK)
    c.roundRect(margin, box_y, width - 2 * margin, 31 * mm, 6 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 8)
    c.drawString(margin + 8 * mm, box_y + 21 * mm, f"RECIBO {data['month']}")
    c.setFont("Helvetica-Bold", 25)
    c.drawString(margin + 8 * mm, box_y + 9 * mm, money(data["amount"]))
    c.setFont("Helvetica", 7)
    c.drawRightString(width - margin - 8 * mm, box_y + 21 * mm, "ESTADO")
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(width - margin - 8 * mm, box_y + 15.5 * mm, data["status"])
    c.setFont("Helvetica", 7)
    c.drawRightString(width - margin - 8 * mm, box_y + 8 * mm, f"Vence: {data['due']}")

    info_y = box_y - 13 * mm
    draw_label_value(c, margin + 2 * mm, info_y, "Período facturado", data["period"])
    draw_label_value(c, width / 2, info_y, "Fecha de emisión", data["issued"])
    draw_label_value(c, width - margin - 2 * mm, info_y, "Numero de recibo", data["code"], right=True)

    section_y = info_y - 17 * mm
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(margin, section_y, "Detalle de tu recibo")

    rows = [["Concepto", "Periodo", "Importe"]]
    for label, value in data["charges"]:
        rows.append([label, data["period"], money(value)])
    taxable = round(data["amount"] / 1.18, 2)
    tax = round(data["amount"] - taxable, 2)
    rows.append(["Operación gravada", "", money(taxable)])
    rows.append(["IGV 18%", "", money(tax)])
    rows.append(["IMPORTE TOTAL", "", money(data["amount"])])
    charge_count = len(data["charges"])
    row_heights = [8 * mm] + [8 * mm] * charge_count + [6 * mm, 6 * mm, 8 * mm]
    table = Table(rows, colWidths=[79 * mm, 54 * mm, 36 * mm], rowHeights=row_heights)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALE),
        ("TEXTCOLOR", (0, 0), (-1, 0), MUTED),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 7),
        ("FONT", (0, 1), (-1, -2), "Helvetica", 8),
        ("FONT", (0, -3), (-1, -1), "Helvetica-Bold", 8.5),
        ("TEXTCOLOR", (0, 1), (-1, -1), INK),
        ("ALIGN", (2, 0), (2, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (0, 0), (-1, -2), .45, LINE),
        ("LINEABOVE", (0, -3), (-1, -3), .8, LINE),
        ("LINEABOVE", (0, -1), (-1, -1), 1, BLUE),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    table_height = sum(row_heights)
    table_y = section_y - 6 * mm - table_height
    table.wrapOn(c, width, height)
    table.drawOn(c, margin, table_y)

    explain_y = table_y - 36 * mm
    c.setFillColor(colors.HexColor("#EAF6FE"))
    c.roundRect(margin, explain_y, width - 2 * margin, 34 * mm, 5 * mm, fill=1, stroke=0)
    c.setFillColor(BLUE)
    c.circle(margin + 9 * mm, explain_y + 23.5 * mm, 4.5 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(margin + 9 * mm, explain_y + 21.5 * mm, "i")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(margin + 17 * mm, explain_y + 24.5 * mm, "Qué pasó este mes")
    style = ParagraphStyle("body", fontName="Helvetica", fontSize=8, leading=11, textColor=MUTED)
    p = Paragraph(data["explanation"], style)
    p.wrap(width - 50 * mm, 17 * mm)
    p.drawOn(c, margin + 17 * mm, explain_y + 8.5 * mm)
    c.setFillColor(BLUE_DARK)
    c.setFont("Helvetica", 6.7)
    c.drawString(margin + 17 * mm, explain_y + 4.5 * mm, f"Evidencia usada: {data['evidence']}")

    usage_y = explain_y - 45 * mm
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, usage_y + 39 * mm, "Tu uso del plan")
    c.setFillColor(PALE)
    c.roundRect(margin, usage_y, 78 * mm, 31 * mm, 4 * mm, fill=1, stroke=0)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawString(margin + 7 * mm, usage_y + 22 * mm, "DATOS MOVILES")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 17)
    c.drawString(margin + 7 * mm, usage_y + 12 * mm, f"{data['usage']:.1f} GB")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawString(margin + 7 * mm, usage_y + 6 * mm, "de 40 GB incluidos")

    bar_x = margin + 91 * mm
    bar_w = width - margin - bar_x
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawString(bar_x, usage_y + 24 * mm, "Consumo del ciclo")
    c.setFillColor(colors.HexColor("#DFE9F1"))
    c.roundRect(bar_x, usage_y + 14 * mm, bar_w, 5 * mm, 2.5 * mm, fill=1, stroke=0)
    c.setFillColor(GREEN if data["usage"] < 36 else ORANGE)
    c.roundRect(bar_x, usage_y + 14 * mm, bar_w * min(data["usage"] / 40, 1), 5 * mm, 2.5 * mm, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(bar_x, usage_y + 6 * mm, f"Quedan {max(0, 40 - data['usage']):.1f} GB")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawRightString(width - margin, usage_y + 6 * mm, "Plan 40 GB")

    footer_y = 20 * mm
    c.setStrokeColor(LINE)
    c.line(margin, footer_y + 12 * mm, width - margin, footer_y + 12 * mm)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 6.5)
    c.drawString(margin, footer_y + 6 * mm, "Documento ficticio para demostración. No corresponde a una cuenta real ni genera obligación de pago.")
    c.drawString(margin, footer_y + 1.5 * mm, "Mi Recibo Inteligente - Reto 1: atención inteligente y explicación de recibos.")
    c.drawRightString(width - margin, footer_y + 1.5 * mm, "Pagina 1 de 1")

    c.save()
    public_path = PUBLIC / path.name
    public_path.write_bytes(path.read_bytes())
    return path


if __name__ == "__main__":
    for receipt in RECEIPTS:
        generated = build_receipt(receipt)
        print(generated)
