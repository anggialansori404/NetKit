#!/usr/bin/env python3
"""NetKit mockups v4 — light mode 'buku log' (work order). Paper, ink, tabular. 780x1688."""
import math
from PIL import Image, ImageDraw, ImageFont

W, H = 780, 1688
FONT = "/home/hatch/workspace/your_files/banners/simanis-tabungan/fonts/PlusJakartaSans.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
OUTDIR = "/home/hatch/workspace/projects/active/netkit/mockups"

BG = (246, 246, 243)       # paper
PANEL = (255, 255, 255)     # white surfaces
HAIR = (224, 226, 232)      # hairline
TEXT = (25, 28, 32)         # ink
DIM = (92, 100, 112)
FAINT = (154, 161, 173)
ACCENT = (11, 95, 255)      # deep blue, single accent
ACCENT_DIM = (226, 238, 255)
SEG_BG = (233, 235, 239)
OK = (21, 128, 61)
WARN = (180, 83, 9)
FAIL = (220, 38, 38)
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

def led(d, x, y, color, r=11):
    # antislop-ui R-31/R-13: status dot marks a REAL state — no decorative glow, no pulse
    d.ellipse([x - r, y - r, x + r, y + r], fill=color)

def hairline(d, y, x0=M, x1=W - M):
    d.line([x0, y, x1, y], fill=HAIR, width=2)

def micro(d, y, text, color=FAINT):
    tracked(d, (M, y), text, f(22, 700), color, ls=8)
    return y + 40

def chunky_btn(d, y, text, h=80, outline=None):
    if outline:
        d.rounded_rectangle([M, y, W - M, y + h], radius=10, outline=outline, width=3)
        tc = outline
    else:
        d.rounded_rectangle([M, y, W - M, y + h], radius=10, fill=ACCENT)
        tc = (255, 255, 255)
    tw = d.textlength(text, font=f(29, 700))
    d.text(((W - tw) / 2, y + (h - 37) / 2), text, font=f(29, 700), fill=tc)
    return y + h

# ---------- nav icons (48 box) ----------
def nic_building(d, x, y, c, sw=4):
    d.polygon([(x + 8, y + 22), (x + 24, y + 10), (x + 40, y + 22)], outline=c, width=sw)
    d.rectangle([x + 13, y + 22, x + 35, y + 40], outline=c, width=sw)
    d.line([(x + 24, y + 28), (x + 24, y + 40)], fill=c, width=sw)

def nic_clock(d, x, y, c, sw=4):
    d.ellipse([x + 8, y + 8, x + 40, y + 40], outline=c, width=sw)
    d.line([(x + 24, y + 24), (x + 24, y + 14)], fill=c, width=sw)
    d.line([(x + 24, y + 24), (x + 32, y + 28)], fill=c, width=sw)

def nic_gear(d, x, y, c, sw=4):
    cx, cy = x + 24, y + 24
    for a in range(8):
        ang = math.pi / 4 * a + math.pi / 8
        x1, y1 = cx + 19 * math.cos(ang), cy + 19 * math.sin(ang)
        x2, y2 = cx + 29 * math.cos(ang), cy + 29 * math.sin(ang)
        d.line([(x1, y1), (x2, y2)], fill=c, width=sw + 2)
    d.ellipse([cx - 15, cy - 15, cx + 15, cy + 15], outline=c, width=sw)
    d.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], outline=c, width=sw)

def nic_info(d, x, y, c, sw=4):
    d.ellipse([x + 8, y + 8, x + 40, y + 40], outline=c, width=sw)
    d.ellipse([x + 21, y + 15, x + 27, y + 21], fill=c)
    d.line([(x + 24, y + 25), (x + 24, y + 34)], fill=c, width=sw)

def wavy_navbar(d, active="Klien"):
    y0 = H - 172
    depth, spread = 48, 135
    cx = W / 2
    pts = []
    x = 0
    while x <= W:
        t = (x - cx) / spread
        pts.append((x, y0 + depth * math.exp(-t * t)))
        x += 4
    d.polygon(pts + [(W, H), (0, H)], fill=PANEL)
    for i in range(len(pts) - 1):
        d.line([pts[i], pts[i + 1]], fill=HAIR, width=3)
    # center FAB in the notch
    fx, fy, fr = cx, y0 + 2, 62
    d.ellipse([fx - fr, fy - fr, fx + fr, fy + fr], fill=ACCENT)
    d.line([(fx - 26, fy), (fx + 26, fy)], fill=(255, 255, 255), width=9)
    d.line([(fx, fy - 26), (fx, fy + 26)], fill=(255, 255, 255), width=9)
    # 4 destinations
    items = [("Klien", nic_building), ("Riwayat", nic_clock),
             ("Pengaturan", nic_gear), ("Info", nic_info)]
    for i, (name, ic) in enumerate(items):
        ix = W * (1 / 8 + i / 4)
        c = ACCENT if name == active else DIM
        ic(d, ix - 24, y0 + 66, c)
        tw = d.textlength(name, font=f(22, 600))
        d.text((ix - tw / 2, y0 + 122), name, font=f(22, 600), fill=c)

# ================= SCREEN 1 (dua varian: VPN terhubung / terputus) =================
def is_private(ip):
    if ip.startswith("10.") or ip.startswith("192.168.") or ip.startswith("169.254."):
        return True
    if ip.startswith("172."):
        try:
            return 16 <= int(ip.split(".")[1]) <= 31
        except Exception:
            return False
    return False

def vpn_strip(d, y, connected, skipped=0):
    d.rounded_rectangle([M, y, W - M, y + 64], radius=10, fill=PANEL, outline=HAIR, width=2)
    if connected:
        led(d, M + 30, y + 32, OK)
        d.text((M + 62, y + 16), "VPN TERHUBUNG", font=f(25, 700), fill=TEXT)
        t = "10.8.0.1"
        tw = d.textlength(t, font=f(24, 500, mono=True))
        d.text((W - M - 28 - tw, y + 18), t, font=f(24, 500, mono=True), fill=DIM)
    else:
        led(d, M + 30, y + 32, FAIL)
        d.text((M + 62, y + 16), "VPN TERPUTUS", font=f(25, 700), fill=FAIL)
        t = f"{skipped} klien lokal tak terjangkau"
        tw = d.textlength(t, font=f(23, 500))
        d.text((W - M - 28 - tw, y + 19), t, font=f(23, 500), fill=DIM)
    return y + 64

def screen1(vpn_connected, fname):
    img = Image.new("RGBA", (W, H), BG + (255,))
    d = ImageDraw.Draw(img)
    statusbar(d)
    y = 84
    tracked(d, (M, y), "NETKIT", f(24, 700), FAINT, ls=10)
    d.text((W - M - 90, y - 2), "v0.1", font=f(22, 500, mono=True), fill=FAINT)
    y += 44
    oks = "2" if vpn_connected else "0"
    stats = [("3", "KLIEN", TEXT), ("1", "DOWN", FAIL), (oks, "OK", OK)]
    cw = (W - 2 * M) / 3
    for i, (num, lab, col) in enumerate(stats):
        cx = M + cw * i + 28
        d.text((cx, y), num, font=f(64, 700, mono=True), fill=col)
        tracked(d, (cx + 76, y + 34), lab, f(20, 700), FAINT, ls=6)
        if i < 2:
            d.line([M + cw * (i + 1), y + 8, M + cw * (i + 1), y + 68], fill=HAIR, width=2)
    y += 108
    y = vpn_strip(d, y, vpn_connected, skipped=2) + 24
    # command search
    d.rounded_rectangle([M, y, W - M, y + 80], radius=10, fill=PANEL, outline=HAIR, width=2)
    d.text((M + 28, y + 22), ">", font=f(30, 700, mono=True), fill=ACCENT)
    d.text((M + 62, y + 22), "cari bpr / ip_", font=f(28, 400, mono=True), fill=DIM)
    y += 104
    y = chunky_btn(d, y, "Cek semua") + 16
    clients = [
        ("BPR Artha Prima", "Jl. Merdeka No. 88, Bandung", "192.168.10.5", "8080"),
        ("BPR Mitra Usaha", "Jl. Ahmad Yani No. 12, Surabaya", "103.147.8.20", "9090"),
        ("Koperasi Sejahtera", "Jl. Pahlawan No. 5, Semarang", "172.16.0.12", "8080"),
    ]
    if vpn_connected:
        results = [("42 ms", OK, OK), ("TIMEOUT", FAIL, FAIL), ("--", FAINT, FAINT)]
    else:
        results = [("SKIP", DIM, FAINT), ("TIMEOUT", FAIL, FAIL), ("SKIP", DIM, FAINT)]
    for (name, addr, ip, port), (stat, scol, dot) in zip(clients, results):
        priv = is_private(ip)
        led(d, M + 24, y + 56, dot)
        d.text((M + 64, y + 22), name, font=f(30, 600), fill=TEXT)
        d.text((M + 64, y + 62), addr, font=f(24, 400), fill=DIM)
        ipport = f"{ip}:{port}"
        tw = d.textlength(ipport, font=f(25, 500, mono=True))
        d.text((W - M - tw, y + 22), ipport, font=f(25, 500, mono=True), fill=TEXT)
        st = stat + (" \u00b7VPN" if priv else "")
        sw = d.textlength(st, font=f(24, 700, mono=True))
        d.text((W - M - sw, y + 60), st, font=f(24, 700, mono=True), fill=scol)
        y += 112
        hairline(d, y)
    wavy_navbar(d, "Klien")
    img.convert("RGB").save(f"{OUTDIR}/{fname}")
    print("saved", fname)

screen1(True, "01-daftar-klien-light-v6.png")
screen1(False, "01b-daftar-klien-vpn-putus-light-v6.png")

# ================= SCREEN 2 =================
img = Image.new("RGBA", (W, H), BG + (255,))
d = ImageDraw.Draw(img)
statusbar(d)
d.text((M, 108), "<", font=f(40, 700, mono=True), fill=DIM)
d.text((M + 56, 106), "BPR Artha Prima", font=f(36, 700), fill=TEXT)
led(d, W - M - 24, 140, OK)
y = 190
d.rounded_rectangle([M, y, W - M, y + 372], radius=10, fill=PANEL, outline=HAIR, width=2)
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
    d.rounded_rectangle([gx, gy, gx + gw, gy + 104], radius=10, fill=PANEL, outline=HAIR, width=2)
    tw = d.textlength(lab, font=f(27, 700, mono=True))
    d.text((gx + (gw - tw) / 2, gy + 34), lab, font=f(27, 700, mono=True),
           fill=TEXT if en else FAINT)
y += 2 * (104 + gap) + 24
y = chunky_btn(d, y, "Jalankan semua") + 32
y = micro(d, y, "HASIL • 10:41")
d.rounded_rectangle([M, y, W - M, y + 264], radius=10, fill=PANEL, outline=HAIR, width=2)
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
    tracked(d, (M + 4, y), lab, f(20, 700), ACCENT if foc else FAINT, ls=6)
    y += 36
    d.rounded_rectangle([M, y, W - M, y + 88], radius=10, fill=PANEL,
                        outline=ACCENT if foc else HAIR, width=3 if foc else 2)
    d.text((M + 28, y + 26), val, font=f(29, 400, mono=mono), fill=TEXT)
    y += 88 + 26
chunky_btn(d, H - 40 - 80, "Simpan")
img.convert("RGB").save(f"{OUTDIR}/03-form-client.png"); print("saved 03")
