"""Genera public/og.png (1200x630) con la identidad v3. Uso: python3 scripts/make-og.py
Las zonas del instrumento son las de la clase de riesgo alto con parámetros congelados
(b=1, c=4, k=0,2, r=0,646): p_a = 0,548 y p* = 0,938. Imagen ilustrativa, sin datos."""
import math
from PIL import Image, ImageDraw, ImageFont

S = 2  # supermuestreo
W, H = 1200 * S, 630 * S
img = Image.new("RGB", (W, H), "#0A0A0A")
d = ImageDraw.Draw(img)
serif = lambda px: ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", px * S)
mono = lambda px: ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", px * S)

d.text((72 * S, 64 * S), "Calibrated Agent", font=serif(30), fill="#F5F5F5")
for i, line in enumerate(["Un agente capaz", "no siempre", "debería actuar."]):
    d.text((72 * S, (170 + i * 92) * S), line, font=serif(80), fill="#F5F5F5")
d.text((72 * S, 500 * S), "Propuesta de investigación · preprint v4.2", font=mono(21), fill="#8F8F8F")
d.text((72 * S, 534 * S), "sin revisión por pares · experimentos no ejecutados", font=mono(21), fill="#8F8F8F")

cx, cy, R, T = 905 * S, 400 * S, 210 * S, 30 * S
b, c, k, r = 1, 4, 0.2, 0.646
p_a = 1 - (b - k) / ((b + c) * (1 - r))
p_s = 1 - k / (r * (b + c))
zones = [(0, p_a, "#FF5A4F"), (p_a, p_s, "#FFB84D"), (p_s, 1, "#3DDC84")]
box = [cx - R, cy - R, cx + R, cy + R]
gap = 0.6
for a0, a1, col in zones:
    d.arc(box, 180 + a0 * 180 + gap, 180 + a1 * 180 - gap, fill=col, width=T)
p = 0.70
ang = math.pi + p * math.pi
tx, ty = cx + math.cos(ang) * (R - T - 18 * S), cy + math.sin(ang) * (R - T - 18 * S)
d.line([cx, cy, tx, ty], fill="#FFFFFF", width=5 * S)
d.ellipse([cx - 11 * S, cy - 11 * S, cx + 11 * S, cy + 11 * S], fill="#FFFFFF")
d.ellipse([tx - 8 * S, ty - 8 * S, tx + 8 * S, ty + 8 * S], fill="#FFFFFF")
d.text((cx - R - 6 * S, cy + 16 * S), "0", font=mono(20), fill="#8F8F8F")
d.text((cx + R - 8 * S, cy + 16 * S), "1", font=mono(20), fill="#8F8F8F")
label = "ilustrativo"
w = d.textlength(label, font=mono(18))
d.text((cx - w / 2, cy + 52 * S), label, font=mono(18), fill="#8F8F8F")

img.resize((1200, 630), Image.LANCZOS).save("public/og.png", optimize=True)
print("public/og.png listo")
