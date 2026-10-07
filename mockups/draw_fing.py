#!/usr/bin/env python3
"""NetKit mockups v3 — 'konsol montir' ala Fing. Dense, LED, mono, log. 780x1688."""
from PIL import Image, ImageDraw, ImageFont

W, H = 780, 1688
FONT = "/home/hatch/workspace/your_files/banners/simanis-tabungan/fonts/PlusJakartaSans.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
OUTDIR = "/home/hatch/workspace/projects/active/netkit/mockups"

BG = (10, 14, 26)        # near-black navy
PANEL = (16, 22, 38)     # panel
TERM = (7, 11, 20)        # terminal block
HAIR = (28, 38, 62)       # hairline
TEXT = (235, 240, 250)
DIM = (130, 145, 175)
FAINT = (88, 102, 132)
ACCENT = (59, 158, 255)
ACCENT_DIM = (20, 45, 80)
OK = (52, 211, 153)
WARN = (251, 191, 36)
FAIL = (248, 113, 113)
M = 32

def f(size, weight=500, mono=False):
    fo = ImageFont.truetype(MONO if mono else FONT, size)
    if not mono:
        fo.set_variation_by_axes([weight])
    return fo

def tracked(d, xy, text, font, fill, ls=6):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += d.textlength(ch, font=font) + ls
    return x

def statusbar(d):
    d.text((M, 28), "10:41", font=f(28, 600, mono=True), fill=TEXT)
    for i in range(4):
        h = 12 + i * 8
        d.rectangle([W - 170 + i * 14, 52 - h, W - 170 + i * 14 + 9, 52], fill=TEXT)
    d.rounded_rectangle([W - M - 56, 30, W - M - 6, 58], radius=8, outline=TEXT, width=4)
    d.rectangle([W - M - 48, 36, W - M - 20, 52], fill=OK)
    d.rectangle([W - M - 4, 38, W - M, 50], fill=TEXT)

def led(d, x, y, color, r=11, glow=True):
    if glow:
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(ov)
        od.ellipse([x - r * 2.6, y - r * 2.6, x + r * 2.6, y + r * 2.6],
                   fill=color + (46,))
        d._image.alpha_composite(ov)
    d.ellipse([x - r, y - r, x + r, y + r], fill=color)

def hairline(d, y, x0=M, x1=W - M):
    d.line([x0, y, x1, y], fill=HAIR, width=2)

def micro(d, y, text):
    tracked(d, (M, y), text, f(22, 700), FAINT, ls=8)
    return y + 40

def chunky_btn(d, y, text, fill=ACCENT, tcolor=(6, 12, 24), h=80, outline=None):
    if outline:
        d.rounded_rectangle([M, y, W - M, y + h], radius=10, outline=outline, width=3)
        tc = outline
    else:
        d.rounded_rectangle([M, y, W - M, y + h], radius=10, fill=fill)
        tc = tcolor
    tw = d.textlength(text, font=f(29, 700))
    d.text(((W - tw) / 2, y + (h - 37) / 2), text, font=f(29, 700), fill=tc)
    return y + h

# ================= SCREEN 1 =================
img = Image.new("RGBA", (W, H), BG + (255,))
d = ImageDraw.Draw(img)
statusbar(d)
# instrument header
y = 84
tracked(d, (M, y), "NETKIT", f(24, 700), FAINT, ls=10)
d.text((W - M - 90, y - 2), "v0.1", font=f(22, 500, mono=True), fill=FAINT)
y += 44
stats = [("3", "KLIEN", TEXT), ("1", "DOWN", FAIL), ("2", "OK", OK)]
cw = (W - 2 * M) / 3
for i, (num, lab, col) in enumerate(stats):
    cx = M + cw * i + 28
    d.text((cx, y), num, font=f(64, 700, mono=True), fill=col)
    tracked(d, (cx + 76, y + 34), lab, f(20, 700), FAINT, ls=6)
    if i < 2:
        d.line([M + cw * (i + 1), y + 8, M + cw * (i + 1), y + 68], fill=HAIR, width=2)
y += 108
# segmented control
d.rounded_rectangle([M, y, W - M, y + 64], radius=10, fill=PANEL)
segw = (W - 2 * M) / 3
for i, s in enumerate(["Klien", "Riwayat", "Info"]):
    if i == 0:
        d.rounded_rectangle([M + 6, y + 6, M + segw - 6, y + 58], radius=8, fill=ACCENT_DIM)
        c = ACCENT
    else:
        c = DIM
    tw = d.textlength(s, font=f(26, 600))
    d.text((M + segw * i + (segw - tw) / 2, y + 16), s, font=f(26, 600), fill=c)
y += 88
# terminal search
d.rounded_rectangle([M, y, W - M, y + 80], radius=10, fill=TERM, outline=HAIR, width=2)
d.text((M + 28, y + 22), ">", font=f(30, 700, mono=True), fill=ACCENT)
d.text((M + 62, y + 22), "cari bpr / ip_", font=f(28, 400, mono=True), fill=DIM)
y += 104
y = chunky_btn(d, y, "Cek semua") + 8
# dense rows
clients = [
    (OK, "BPR Artha Prima", "Jl. Merdeka No. 88, Bandung", "192.168.10.5:8080", "42 ms", OK),
    (FAIL, "BPR Mitra Usaha", "Jl. Ahmad Yani No. 12, Surabaya", "10.20.30.40:9090", "TIMEOUT", FAIL),
    (FAINT, "Koperasi Sejahtera", "Jl. Pahlawan No. 5, Semarang", "172.16.0.12:8080", "--", FAINT),
]
y += 8
for color, name, addr, ip, stat, scol in clients:
    led(d, M + 24, y + 56, color)
    d.text((M + 64, y + 22), name, font=f(30, 600), fill=TEXT)
    d.text((M + 64, y + 62), addr, font=f(24, 400), fill=DIM)
    tw = d.textlength(ip, font=f(25, 500, mono=True))
    d.text((W - M - tw, y + 22), ip, font=f(25, 500, mono=True), fill=TEXT)
    sw = d.textlength(stat, font=f(24, 700, mono=True))
    d.text((W - M - sw, y + 60), stat, font=f(24, 700, mono=True), fill=scol)
    y += 112
    hairline(d, y)
d.text((W / 2 - 70, H - 90), "- 3 klien -", font=f(24, 400, mono=True), fill=FAINT)
img.convert("RGB").save(f"{OUTDIR}/01-daftar-klien.png"); print("saved 01")

# ================= SCREEN 2 =================
img = Image.new("RGBA", (W, H), BG + (255,))
d = ImageDraw.Draw(img)
statusbar(d)
# top bar
d.text((M, 108), "<", font=f(40, 700, mono=True), fill=DIM)
d.text((M + 56, 106), "BPR Artha Prima", font=f(36, 700), fill=TEXT)
led(d, W - M - 24, 140, OK)
y = 190
# spec sheet
d.rounded_rectangle([M, y, W - M, y + 372], radius=10, fill=PANEL)
rows = [("ALAMAT", "Jl. Merdeka No. 88, Bandung", False),
        ("IP GATEWAY", "192.168.10.5", True),
        ("PORT", "8080", True),
        ("IP VPN", "10.8.0.14", True)]
ry = y + 24
for lab, val, mono in rows:
    tracked(d, (M + 28, ry), lab, f(20, 700), FAINT, ls=6)
    vw = d.textlength(val, font=f(28, 500, mono=mono))
    d.text((W - M - 28 - vw, ry + 26), val, font=f(28, 500, mono=mono), fill=TEXT)
    ry += 88
    if lab != "IP VPN":
        hairline(d, ry - 6, M + 28, W - M - 28)
y += 372 + 32
y = micro(d, y, "DIAGNOSTIK")
gw, gap = (W - 2 * M - 24) / 2, 24
btns = [("TCP PORT", True), ("DNS", True), ("HTTP/SSL", True), ("WHOIS", False)]
for i, (lab, en) in enumerate(btns):
    gx = M + (i % 2) * (gw + gap)
    gy = y + (i // 2) * (104 + gap)
    d.rounded_rectangle([gx, gy, gx + gw, gy + 104], radius=10, fill=PANEL,
                        outline=HAIR if en else None, width=2)
    tw = d.textlength(lab, font=f(27, 700, mono=True))
    d.text((gx + (gw - tw) / 2, gy + 34), lab, font=f(27, 700, mono=True),
           fill=TEXT if en else FAINT)
y += 2 * (104 + gap) + 24
y = chunky_btn(d, y, "Jalankan semua") + 32
y = micro(d, y, "HASIL • 10:41")
# terminal log
d.rounded_rectangle([M, y, W - M, y + 264], radius=10, fill=TERM)
logs = [
    ("10:41:22", "TCP ", OK, "OPEN  192.168.10.5:8080  42ms"),
    ("10:41:23", "DNS ", OK, "OK    gw-bprartha.ussi.id"),
    ("10:41:24", "HTTP", OK, "200   310ms  https"),
    ("10:41:25", "SSL ", WARN, "WARN  cert habis 18 hari"),
]
ly = y + 26
for ts, chk, col, msg in logs:
    d.text((M + 28, ly), ts, font=f(24, 400, mono=True), fill=FAINT)
    d.text((M + 168, ly), chk, font=f(24, 700, mono=True), fill=col)
    d.text((M + 238, ly), msg, font=f(24, 500, mono=True), fill=TEXT)
    ly += 58
y += 264 + 28
chunky_btn(d, y, "Bagikan hasil", outline=ACCENT)
img.convert("RGB").save(f"{OUTDIR}/02-detail-hasil.png"); print("saved 02")

# ================= SCREEN 3 =================
img = Image.new("RGBA", (W, H), BG + (255,))
d = ImageDraw.Draw(img)
statusbar(d)
d.text((M, 108), "<", font=f(40, 700, mono=True), fill=DIM)
d.text((M + 56, 106), "Tambah klien", font=f(36, 700), fill=TEXT)
y = 210
fields = [
    ("NAMA BPR", "BPR Artha Prima", False, True),
    ("ALAMAT", "Jl. Merdeka No. 88, Bandung", False, False),
    ("IP GATEWAY (MINI PC)", "192.168.10.5", True, False),
    ("PORT", "8080", True, False),
    ("IP VPN", "10.8.0.14", True, False),
    ("CATATAN", "PIC: Pak Dedi — 0812…", False, False),
]
for lab, val, mono, foc in fields:
    tracked(d, (M + 4, y), lab, f(20, 700), FAINT if not foc else ACCENT, ls=6)
    y += 36
    d.rounded_rectangle([M, y, W - M, y + 88], radius=10, fill=PANEL,
                        outline=ACCENT if foc else HAIR, width=3 if foc else 2)
    d.text((M + 28, y + 26), val, font=f(29, 400, mono=mono), fill=TEXT)
    y += 88 + 26
chunky_btn(d, H - 40 - 80, "Simpan")
img.convert("RGB").save(f"{OUTDIR}/03-form-client.png"); print("saved 03")
