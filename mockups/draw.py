#!/usr/bin/env python3
"""NetKit UI mockups — 3 phone screens, 780x1688 (390x844 @2x)."""
from PIL import Image, ImageDraw, ImageFont

W, H = 780, 1688
FONT = "/home/hatch/workspace/your_files/banners/simanis-tabungan/fonts/PlusJakartaSans.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
OUTDIR = "/home/hatch/workspace/projects/active/netkit/mockups"

BG = (15, 30, 61)
SURFACE = (26, 44, 82)
SURFACE2 = (34, 54, 94)
TEXT = (255, 255, 255)
TEXT2 = (159, 178, 216)
LINE = (44, 68, 112)
PRIMARY = (46, 155, 214)
OK = (34, 197, 94)
WARN = (245, 158, 11)
FAIL = (239, 68, 68)
GREY = (100, 116, 139)
M = 40  # margin

def f(size, weight=700, mono=False):
    fo = ImageFont.truetype(MONO if mono else FONT, size)
    if not mono:
        fo.set_variation_by_axes([weight])
    return fo

def statusbar(d):
    d.text((M, 28), "10:41", font=f(28, 600), fill=TEXT)
    # signal bars
    for i in range(4):
        h = 12 + i * 8
        d.rectangle([W - 170 + i * 14, 52 - h, W - 170 + i * 14 + 9, 52], fill=TEXT)
    # battery
    d.rounded_rectangle([W - M - 56, 30, W - M - 6, 58], radius=8, outline=TEXT, width=4)
    d.rectangle([W - M - 48, 36, W - M - 20, 52], fill=OK)
    d.rectangle([W - M - 4, 38, W - M, 50], fill=TEXT)

def header(d, title, sub=None, back=False, right_icon=None):
    y = 110
    if back:
        d.text((M, y + 6), "‹", font=f(56, 700), fill=TEXT2)
    tx = M + 56 if back else M
    d.text((tx, y), title, font=f(40, 800), fill=TEXT)
    if right_icon == "edit":
        d.rounded_rectangle([W - M - 56, y + 8, W - M, y + 64], radius=12, outline=LINE, width=3)
        d.text((W - M - 40, y + 12), "⋮", font=f(32, 700), fill=TEXT2)
    if sub:
        d.text((tx, y + 58), sub, font=f(24, 500), fill=TEXT2)
    return y + (110 if sub else 70)

def section(d, y, text):
    d.text((M, y), text, font=f(25, 700), fill=TEXT2)
    return y + 48

def card(d, y, h, fill=SURFACE, radius=24):
    d.rounded_rectangle([M, y, W - M, y + h], radius=radius, fill=fill, outline=LINE, width=2)
    return y + h

def dot(d, x, y, color, r=11):
    d.ellipse([x - r, y - r, x + r, y + r], fill=color)

def btn_primary(d, y, text, h=96):
    d.rounded_rectangle([M, y, W - M, y + h], radius=20, fill=PRIMARY)
    tw = d.textlength(text, font=f(30, 700))
    d.text(((W - tw) / 2, y + (h - 38) / 2), text, font=f(30, 700), fill=(255, 255, 255))
    return y + h

def btn_outline(d, y, text, h=88):
    d.rounded_rectangle([M, y, W - M, y + h], radius=20, outline=PRIMARY, width=4)
    tw = d.textlength(text, font=f(29, 700))
    d.text(((W - tw) / 2, y + (h - 36) / 2), text, font=f(29, 700), fill=PRIMARY)
    return y + h

def bottom_nav(d, active="Klien"):
    y0 = H - 140
    d.rectangle([0, y0, W, H], fill=(10, 20, 42))
    d.line([0, y0, W, y0], fill=LINE, width=2)
    items = ["Klien", "Riwayat", "Tentang"]
    icons = {"Klien": "▤", "Riwayat": "◷", "Tentang": "ⓘ"}
    cw = W / 3
    for i, it in enumerate(items):
        cx = cw * i + cw / 2
        col = PRIMARY if it == active else TEXT2
        d.text((cx - 14, y0 + 22), icons[it], font=f(34, 700), fill=col)
        tw = d.textlength(it, font=f(24, 600))
        d.text((cx - tw / 2, y0 + 70), it, font=f(24, 600), fill=col)

def fab(d):
    x, y, r = W - M - 52, H - 140 - 110, 52
    d.ellipse([x - r, y - r, x + r, y + r], fill=PRIMARY)
    d.text((x - 20, y - 34), "+", font=f(56, 700), fill=(255, 255, 255))

def copy_icon(d, x, y, s=26):
    d.rounded_rectangle([x, y, x + s, y + s], radius=6, outline=TEXT2, width=3)
    d.rounded_rectangle([x + 8, y - 8, x + s + 8, y + s - 8], radius=6, fill=SURFACE, outline=TEXT2, width=3)

# ================= SCREEN 1: client list =================
img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
statusbar(d)
y = header(d, "NetKit", "Network Toolkit • DFS Support")
y += 18
# search
d.rounded_rectangle([M, y, W - M, y + 84], radius=20, fill=SURFACE2)
d.text((M + 28, y + 22), "⌕  Cari nama BPR / IP…", font=f(27, 500), fill=TEXT2)
y += 108
y = btn_outline(d, y, "Cek Semua") + 28
clients = [
    (OK, "BPR Artha Prima", "Jl. Merdeka No. 88, Bandung", "192.168.10.5:8080"),
    (FAIL, "BPR Mitra Usaha", "Jl. Ahmad Yani No. 12, Surabaya", "10.20.30.40:9090"),
    (GREY, "Koperasi Sejahtera", "Jl. Pahlawan No. 5, Semarang", "172.16.0.12:8080"),
]
for color, name, addr, ip in clients:
    d.rounded_rectangle([M, y, W - M, y + 168], radius=24, fill=SURFACE, outline=LINE, width=2)
    dot(d, M + 40, y + 44, color)
    d.text((M + 72, y + 22), name, font=f(30, 700), fill=TEXT)
    d.text((M + 40, y + 66), addr, font=f(24, 500), fill=TEXT2)
    d.text((M + 40, y + 104), ip, font=f(25, 700, mono=True), fill=PRIMARY)
    d.text((W - M - 34, y + 64), "›", font=f(44, 700), fill=TEXT2)
    y += 192
fab(d)
bottom_nav(d, "Klien")
img.save(f"{OUTDIR}/01-daftar-klien.png")
print("saved 01")

# ================= SCREEN 2: detail + results =================
img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
statusbar(d)
y = header(d, "BPR Artha Prima", back=True, right_icon="edit")
y += 6
# info card
yh = y
card(d, y, 300)
rows = [("Alamat", "Jl. Merdeka No. 88, Bandung", False),
        ("IP Gateway", "192.168.10.5", True),
        ("Port", "8080", True),
        ("IP VPN", "10.8.0.14", True)]
ry = yh + 26
for label, val, mono in rows:
    d.text((M + 32, ry), label, font=f(24, 600), fill=TEXT2)
    d.text((M + 240, ry), val, font=f(26, 700, mono=mono), fill=TEXT)
    copy_icon(d, W - M - 58, ry + 2)
    ry += 68
y = yh + 300 + 30
y = section(d, y, "DIAGNOSTIK")
# 2x2 grid
gw, gh, gap = (W - 2 * M - 24) / 2, 104, 24
labels = ["TCP Port", "DNS", "HTTP/SSL", "Whois"]
for i, lab in enumerate(labels):
    gx = M + (i % 2) * (gw + gap)
    gy = y + (i // 2) * (gh + gap)
    d.rounded_rectangle([gx, gy, gx + gw, gy + gh], radius=18, fill=SURFACE2, outline=LINE, width=2)
    tw = d.textlength(lab, font=f(28, 700))
    d.text((gx + (gw - tw) / 2, gy + 32), lab, font=f(28, 700), fill=TEXT)
y += 2 * (gh + gap) + 20
y = btn_primary(d, y, "Jalankan Semua") + 30
y = section(d, y, "HASIL • 10:41:22")
# TCP result
d.rounded_rectangle([M, y, W - M, y + 118], radius=20, fill=SURFACE, outline=LINE, width=2)
d.rectangle([M, y + 16, M + 10, y + 102], fill=OK)
d.text((M + 36, y + 18), "TCP PORT", font=f(23, 700), fill=TEXT2)
d.text((M + 36, y + 52), "OPEN  •  42 ms", font=f(30, 800), fill=OK)
y += 134
# SSL result (warning)
d.rounded_rectangle([M, y, W - M, y + 190], radius=20, fill=SURFACE, outline=LINE, width=2)
d.rectangle([M, y + 16, M + 10, y + 174], fill=WARN)
d.text((M + 36, y + 18), "SSL", font=f(23, 700), fill=TEXT2)
d.text((M + 36, y + 52), "WARNING", font=f(30, 800), fill=WARN)
d.text((M + 36, y + 96), "Valid hingga 24 Nov 2026", font=f(25, 500), fill=TEXT)
d.text((M + 36, y + 132), "Sisa 18 hari  •  Let's Encrypt", font=f(25, 500), fill=TEXT2)
y += 206
btn_outline(d, y, "⤴  Bagikan Hasil")
bottom_nav(d, "Klien")
img.save(f"{OUTDIR}/02-detail-hasil.png")
print("saved 02")

# ================= SCREEN 3: form =================
img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
statusbar(d)
y = header(d, "Tambah Client", back=True)
y += 10
fields = [
    ("Nama BPR *", "BPR Artha Prima", False, 96),
    ("Alamat *", "Jl. Merdeka No. 88, Bandung", False, 96),
    ("IP Gateway (Mini PC) *", "192.168.10.5", True, 96),
    ("Port *", "8080", True, 96),
    ("IP VPN *", "10.8.0.14", True, 96),
    ("Catatan (opsional)", "PIC: Pak Dedi — 0812…", False, 140),
]
for label, val, mono, hh in fields:
    d.text((M, y), label, font=f(25, 600), fill=TEXT2)
    y += 44
    d.rounded_rectangle([M, y, W - M, y + hh], radius=18, fill=SURFACE2, outline=LINE, width=2)
    d.text((M + 28, y + (hh - 34) / 2 if hh < 120 else y + 26), val,
           font=f(28, 500, mono=mono), fill=TEXT if val else TEXT2)
    y += hh + 26
    if y > H - 320:
        break
btn_primary(d, H - 140 - 120, "Simpan")
bottom_nav(d, "Klien")
img.save(f"{OUTDIR}/03-form-client.png")
print("saved 03")
