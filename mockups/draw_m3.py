#!/usr/bin/env python3
"""NetKit UI mockups v2 — Material Design 3 dark theme. 780x1688 (390x844 @2x)."""
from PIL import Image, ImageDraw, ImageFont

W, H = 780, 1688
FONT = "/home/hatch/workspace/your_files/banners/simanis-tabungan/fonts/PlusJakartaSans.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
OUTDIR = "/home/hatch/workspace/projects/active/netkit/mockups"

# M3 dark scheme (blue seed)
PRIMARY = (171, 199, 255); ON_PRIMARY = (0, 47, 101)
PRIMARY_CONTAINER = (0, 75, 141); ON_PRIMARY_CONTAINER = (215, 227, 255)
SECONDARY_CONTAINER = (62, 71, 89); ON_SECONDARY_CONTAINER = (220, 226, 249)
ERROR = (255, 180, 171); ERROR_CONTAINER = (147, 0, 10); ON_ERROR_CONTAINER = (255, 218, 214)
SURFACE = (19, 19, 24); ON_SURFACE = (228, 226, 230); ON_SURFACE_VARIANT = (202, 196, 208)
SC_LOW = (27, 27, 31); SC = (31, 31, 37); SC_HIGH = (42, 42, 49); SC_HIGHEST = (53, 53, 60)
OUTLINE = (148, 143, 153); OUTLINE_VARIANT = (73, 69, 79)
SUCCESS = (126, 217, 154); SUCCESS_CONTAINER = (20, 83, 45); ON_SUCCESS_CONTAINER = (185, 240, 198)
WARN = (255, 196, 107); WARN_CONTAINER = (107, 68, 0); ON_WARN_CONTAINER = (255, 223, 168)
M = 32  # 16dp margin

def f(size, weight=500, mono=False):
    fo = ImageFont.truetype(MONO if mono else FONT, size)
    if not mono:
        fo.set_variation_by_axes([weight])
    return fo

# ---------- icons (stroke icons, 48 box) ----------
def _ic(d, x, y, draw_fn, color, sw=5):
    draw_fn(d, x, y, color, sw)

def ic_search(d, x, y, c, sw=5):
    d.ellipse([x + 8, y + 8, x + 30, y + 30], outline=c, width=sw)
    d.line([x + 26, y + 26, x + 42, y + 42], fill=c, width=sw)

def ic_back(d, x, y, c, sw=5):
    d.line([(x + 32, y + 12), (x + 16, y + 24), (x + 32, y + 36)], fill=c, width=sw)

def ic_more(d, x, y, c, sw=5):
    for yy in (12, 24, 36):
        d.ellipse([x + 20, y + yy - 4, x + 28, y + yy + 4], fill=c)

def ic_edit(d, x, y, c, sw=5):
    d.line([(x + 14, y + 34), (x + 32, y + 16)], fill=c, width=sw + 1)
    d.polygon([(x + 10, y + 38), (x + 16, y + 28), (x + 22, y + 34)], fill=c)

def ic_copy(d, x, y, c, sw=4):
    d.rounded_rectangle([x + 12, y + 16, x + 32, y + 38], radius=5, outline=c, width=sw)
    d.rounded_rectangle([x + 18, y + 10, x + 38, y + 32], radius=5, outline=c, width=sw)

def ic_chev(d, x, y, c, sw=5):
    d.line([(x + 18, y + 12), (x + 32, y + 24), (x + 18, y + 36)], fill=c, width=sw)

def ic_share(d, x, y, c, sw=4):
    for cx, cy in ((16, 26), (34, 14), (34, 38)):
        d.ellipse([x + cx - 7, y + cy - 7, x + cx + 7, y + cy + 7], outline=c, width=sw)
    d.line([(x + 22, y + 22), (x + 29, y + 17)], fill=c, width=sw)
    d.line([(x + 22, y + 30), (x + 29, y + 35)], fill=c, width=sw)

def ic_check(d, x, y, c, sw=6):
    d.line([(x + 13, y + 25), (x + 21, y + 33), (x + 35, y + 15)], fill=c, width=sw)

def ic_warn(d, x, y, c, sw=5):
    d.polygon([(x + 24, y + 8), (x + 42, y + 38), (x + 6, y + 38)], outline=c, width=sw)
    d.line([(x + 24, y + 19), (x + 24, y + 28)], fill=c, width=sw)
    d.ellipse([x + 21, y + 31, x + 27, y + 37], fill=c)

def ic_building(d, x, y, c, sw=4):
    d.polygon([(x + 8, y + 22), (x + 24, y + 10), (x + 40, y + 22)], outline=c, width=sw)
    d.rectangle([x + 13, y + 22, x + 35, y + 40], outline=c, width=sw)
    d.line([(x + 24, y + 28), (x + 24, y + 40)], fill=c, width=sw)

def ic_clock(d, x, y, c, sw=4):
    d.ellipse([x + 8, y + 8, x + 40, y + 40], outline=c, width=sw)
    d.line([(x + 24, y + 24), (x + 24, y + 14)], fill=c, width=sw)
    d.line([(x + 24, y + 24), (x + 32, y + 28)], fill=c, width=sw)

def ic_info(d, x, y, c, sw=4):
    d.ellipse([x + 8, y + 8, x + 40, y + 40], outline=c, width=sw)
    d.ellipse([x + 21, y + 15, x + 27, y + 21], fill=c)
    d.line([(x + 24, y + 25), (x + 24, y + 34)], fill=c, width=sw)

def icon_btn(d, cx, cy, ic, color=ON_SURFACE_VARIANT, box=48):
    ic(d, cx - 24, cy - 24, color)

# ---------- M3 components ----------
def statusbar(d):
    d.text((M, 28), "10:41", font=f(28, 600), fill=ON_SURFACE)
    for i in range(4):
        h = 12 + i * 8
        d.rectangle([W - 170 + i * 14, 52 - h, W - 170 + i * 14 + 9, 52], fill=ON_SURFACE)
    d.rounded_rectangle([W - M - 56, 30, W - M - 6, 58], radius=8, outline=ON_SURFACE, width=4)
    d.rectangle([W - M - 48, 36, W - M - 20, 52], fill=SUCCESS)
    d.rectangle([W - M - 4, 38, W - M, 50], fill=ON_SURFACE)

def top_app_bar(d, title, back=False, action=None):
    y0, y1 = 70, 198
    if back:
        icon_btn(d, M + 24, (y0 + y1) / 2, ic_back)
        tx = M + 64
    else:
        tx = M
    d.text((tx, y0 + 34), title, font=f(44, 600), fill=ON_SURFACE)
    if action:
        icon_btn(d, W - M - 24, (y0 + y1) / 2, action)
    return y1

def search_bar(d, y, hint="Cari BPR atau IP"):
    d.rounded_rectangle([M, y, W - M, y + 112], radius=56, fill=SC_HIGH)
    ic_search(d, M + 32, y + 32, ON_SURFACE_VARIANT)
    d.text((M + 96, y + 38), hint, font=f(32, 400), fill=ON_SURFACE_VARIANT)
    return y + 112

def filled_button(d, y, text, h=80):
    d.rounded_rectangle([M, y, W - M, y + h], radius=h // 2, fill=PRIMARY)
    tw = d.textlength(text, font=f(28, 700))
    d.text(((W - tw) / 2, y + (h - 36) / 2), text, font=f(28, 700), fill=ON_PRIMARY)
    return y + h

def tonal_button(d, y, text, h=80):
    d.rounded_rectangle([M, y, W - M, y + h], radius=h // 2, fill=SECONDARY_CONTAINER)
    tw = d.textlength(text, font=f(28, 700))
    d.text(((W - tw) / 2, y + (h - 36) / 2), text, font=f(28, 700), fill=ON_SECONDARY_CONTAINER)
    return y + h

def outlined_button(d, y, text, icon=None, h=80):
    d.rounded_rectangle([M, y, W - M, y + h], radius=h // 2, outline=OUTLINE, width=3)
    tw = d.textlength(text, font=f(28, 700))
    ix = (W - tw) / 2 - (36 if icon else 0)
    if icon:
        icon(d, ix - 8, y + (h - 48) / 2, PRIMARY)
        ix += 56
    d.text((ix, y + (h - 36) / 2), text, font=f(28, 700), fill=PRIMARY)
    return y + h

def fab(d):
    x, y, s, r = W - M - 112, H - 160 - 32 - 112, 112, 32
    d.rounded_rectangle([x, y, x + s, y + s], radius=r, fill=PRIMARY_CONTAINER)
    d.line([(x + 38, y + 56), (x + 74, y + 56)], fill=ON_PRIMARY_CONTAINER, width=7)
    d.line([(x + 56, y + 38), (x + 56, y + 74)], fill=ON_PRIMARY_CONTAINER, width=7)

def nav_bar(d, active="Klien"):
    y0 = H - 160
    d.rectangle([0, y0, W, H], fill=SC)
    d.line([0, y0, W, y0], fill=OUTLINE_VARIANT, width=2)
    items = [("Klien", ic_building), ("Riwayat", ic_clock), ("Tentang", ic_info)]
    cw = W / 3
    icons = {"Klien": ic_building, "Riwayat": ic_clock, "Tentang": ic_info}
    for i, (name, ic) in enumerate(items):
        cx = cw * i + cw / 2
        is_act = name == active
        if is_act:
            d.rounded_rectangle([cx - 64, y0 + 18, cx + 64, y0 + 82], radius=32, fill=SECONDARY_CONTAINER)
        ic(d, cx - 24, y0 + 24, ON_SURFACE if is_act else ON_SURFACE_VARIANT)
        tw = d.textlength(name, font=f(24, 600))
        d.text((cx - tw / 2, y0 + 100), name, font=f(24, 600),
               fill=ON_SURFACE if is_act else ON_SURFACE_VARIANT)

def filled_card(d, y, h):
    d.rounded_rectangle([M, y, W - M, y + h], radius=24, fill=SC_HIGHEST)
    return y + h

def outlined_card(d, y, h):
    d.rounded_rectangle([M, y, W - M, y + h], radius=24, outline=OUTLINE_VARIANT, width=2)
    return y + h

def section_label(d, y, text):
    d.text((M + 4, y), text, font=f(28, 600), fill=ON_SURFACE_VARIANT)
    return y + 52

def status_dot(d, x, y, color, r=12):
    d.ellipse([x - r, y - r, x + r, y + r], fill=color)

def tonal_circle_icon(d, x, y, bg, ic, ic_color, r=30):
    d.ellipse([x - r, y - r, x + r, y + r], fill=bg)
    ic(d, x - 24, y - 24, ic_color)

def text_field(d, y, label, value, h=112, focused=False, mono=False):
    col, w = (PRIMARY, 3) if focused else (OUTLINE_VARIANT, 2)
    d.rounded_rectangle([M, y, W - M, y + h], radius=8, outline=col, width=w)
    lc = PRIMARY if focused else ON_SURFACE_VARIANT
    d.text((M + 28, y + 16), label, font=f(24, 500), fill=lc)
    d.text((M + 28, y + 50), value, font=f(32, 400, mono=mono), fill=ON_SURFACE)
    return y + h

# ================= SCREEN 1 =================
img = Image.new("RGB", (W, H), SURFACE)
d = ImageDraw.Draw(img)
statusbar(d)
y = top_app_bar(d, "NetKit", action=ic_more)
y = search_bar(d, y + 16) + 24
y = tonal_button(d, y, "Cek semua") + 24
clients = [
    (SUCCESS, "BPR Artha Prima", "Jl. Merdeka No. 88, Bandung", "192.168.10.5:8080"),
    (ERROR, "BPR Mitra Usaha", "Jl. Ahmad Yani No. 12, Surabaya", "10.20.30.40:9090"),
    (OUTLINE_VARIANT, "Koperasi Sejahtera", "Jl. Pahlawan No. 5, Semarang", "172.16.0.12:8080"),
]
for color, name, addr, ip in clients:
    filled_card(d, y, 184)
    status_dot(d, M + 40, y + 48, color)
    d.text((M + 72, y + 26), name, font=f(32, 600), fill=ON_SURFACE)
    d.text((M + 40, y + 70), addr, font=f(28, 400), fill=ON_SURFACE_VARIANT)
    d.text((M + 40, y + 108), ip, font=f(24, 500, mono=True), fill=ON_SURFACE_VARIANT)
    icon_btn(d, W - M - 40, y + 92, ic_chev)
    y += 204
fab(d)
nav_bar(d, "Klien")
img.save(f"{OUTDIR}/01-daftar-klien.png"); print("saved 01")

# ================= SCREEN 2 =================
img = Image.new("RGB", (W, H), SURFACE)
d = ImageDraw.Draw(img)
statusbar(d)
y = top_app_bar(d, "BPR Artha Prima", back=True, action=ic_edit)
y += 16
outlined_card(d, y, 400)
rows = [("Jl. Merdeka No. 88, Bandung", "Alamat", False),
        ("192.168.10.5", "IP gateway", True),
        ("8080", "Port", True),
        ("10.8.0.14", "IP VPN", True)]
ry = y + 28
for val, lab, mono in rows:
    d.text((M + 32, ry), val, font=f(32, 500, mono=mono), fill=ON_SURFACE)
    d.text((M + 32, ry + 40), lab, font=f(24, 400), fill=ON_SURFACE_VARIANT)
    icon_btn(d, W - M - 40, ry + 28, ic_copy)
    ry += 88
y += 400 + 28
y = section_label(d, y, "Diagnostik")
gw, gap = (W - 2 * M - 24) / 2, 24
for i, lab in enumerate(["TCP Port", "DNS", "HTTP/SSL", "Whois"]):
    gx = M + (i % 2) * (gw + gap)
    gy = y + (i // 2) * (112 + gap)
    d.rounded_rectangle([gx, gy, gx + gw, gy + 112], radius=56, fill=SECONDARY_CONTAINER)
    tw = d.textlength(lab, font=f(28, 700))
    d.text((gx + (gw - tw) / 2, gy + 38), lab, font=f(28, 700), fill=ON_SECONDARY_CONTAINER)
y += 2 * (112 + gap) + 20
y = filled_button(d, y, "Jalankan semua") + 28
y = section_label(d, y, "Hasil pemeriksaan • 10.41")
filled_card(d, y, 152)
tonal_circle_icon(d, M + 62, y + 76, SUCCESS_CONTAINER, ic_check, ON_SUCCESS_CONTAINER)
d.text((M + 112, y + 34), "Port TCP terbuka", font=f(32, 600), fill=ON_SURFACE)
d.text((M + 112, y + 76), "192.168.10.5:8080 • 42 ms", font=f(28, 400, mono=True), fill=ON_SURFACE_VARIANT)
y += 168
filled_card(d, y, 186)
tonal_circle_icon(d, M + 62, y + 93, WARN_CONTAINER, ic_warn, ON_WARN_CONTAINER)
d.text((M + 112, y + 34), "Sertifikat segera kedaluwarsa", font=f(32, 600), fill=ON_SURFACE)
d.text((M + 112, y + 76), "Valid hingga 24 Nov 2026", font=f(28, 400), fill=ON_SURFACE)
d.text((M + 112, y + 112), "Sisa 18 hari • Let's Encrypt", font=f(28, 400), fill=ON_SURFACE_VARIANT)
y += 202
outlined_button(d, y, "Bagikan hasil", icon=ic_share)
img.save(f"{OUTDIR}/02-detail-hasil.png"); print("saved 02")

# ================= SCREEN 3 =================
img = Image.new("RGB", (W, H), SURFACE)
d = ImageDraw.Draw(img)
statusbar(d)
y = top_app_bar(d, "Tambah klien", back=True)
y += 16
fields = [
    ("Nama BPR", "BPR Artha Prima", False, True),
    ("Alamat", "Jl. Merdeka No. 88, Bandung", False, False),
    ("IP gateway (mini PC)", "192.168.10.5", True, False),
    ("Port", "8080", True, False),
    ("IP VPN", "10.8.0.14", True, False),
    ("Catatan", "PIC: Pak Dedi — 0812…", False, False),
]
for label, val, mono, focused in fields:
    y = text_field(d, y, label, val, mono=mono, focused=focused) + 28
filled_button(d, H - 40 - 80, "Simpan")
img.save(f"{OUTDIR}/03-form-klien.png"); print("saved 03")
