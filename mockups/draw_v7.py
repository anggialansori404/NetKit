#!/usr/bin/env python3
"""NetKit mockups v7 — pivot: direktori klien + tools + ssh + sftp. Light. 780x1688."""
import math
from PIL import Image, ImageDraw, ImageFont

W, H = 780, 1688
FONT = "/home/hatch/workspace/your_files/banners/simanis-tabungan/fonts/PlusJakartaSans.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
OUTDIR = "/home/hatch/workspace/projects/active/netkit/mockups"

BG = (246, 246, 243); PANEL = (255, 255, 255); HAIR = (224, 226, 232)
TEXT = (25, 28, 32); DIM = (92, 100, 112); FAINT = (154, 161, 173)
ACCENT = (11, 95, 255); ACCENT_DIM = (226, 238, 255)
OK = (21, 128, 61); WARN = (180, 83, 9); FAIL = (220, 38, 38)
TERM_BG = (13, 17, 23); TERM_TX = (215, 222, 230); TERM_GR = (74, 222, 128)
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

def statusbar(d):
    d.text((M, 28), "10:41", font=f(28, 600, mono=True), fill=TEXT)
    for i in range(4):
        h = 12 + i * 8
        d.rectangle([W - 170 + i * 14, 52 - h, W - 170 + i * 14 + 9, 52], fill=TEXT)
    d.rounded_rectangle([W - M - 56, 30, W - M - 6, 58], radius=8, outline=TEXT, width=4)
    d.rectangle([W - M - 48, 36, W - M - 20, 52], fill=OK)
    d.rectangle([W - M - 4, 38, W - M, 50], fill=TEXT)

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

def is_private(ip):
    if ip.startswith("10.") or ip.startswith("192.168.") or ip.startswith("169.254."):
        return True
    if ip.startswith("172."):
        try:
            return 16 <= int(ip.split(".")[1]) <= 31
        except Exception:
            return False
    return False

# nav icons
def nic_building(d, x, y, c, sw=4):
    d.polygon([(x + 8, y + 22), (x + 24, y + 10), (x + 40, y + 22)], outline=c, width=sw)
    d.rectangle([x + 13, y + 22, x + 35, y + 40], outline=c, width=sw)
    d.line([(x + 24, y + 28), (x + 24, y + 40)], fill=c, width=sw)

def nic_wrench(d, x, y, c, sw=4):
    d.line([(x + 14, y + 34), (x + 30, y + 18)], fill=c, width=sw + 2)
    d.arc([x + 24, y + 6, x + 42, y + 24], start=300, end=60, fill=c, width=sw + 2)

def nic_term(d, x, y, c, sw=4):
    d.rounded_rectangle([x + 6, y + 10, x + 42, y + 38], radius=8, outline=c, width=sw)
    d.line([(x + 14, y + 19), (x + 22, y + 24), (x + 14, y + 29)], fill=c, width=sw)
    d.line([(x + 26, y + 29), (x + 34, y + 29)], fill=c, width=sw)

def nic_folder(d, x, y, c, sw=4):
    d.polygon([(x + 8, y + 16), (x + 20, y + 16), (x + 24, y + 21), (x + 40, y + 21),
               (x + 40, y + 38), (x + 8, y + 38)], outline=c, width=sw)

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
    fx, fy, fr = cx, y0 + 2, 62
    d.ellipse([fx - fr, fy - fr, fx + fr, fy + fr], fill=ACCENT)
    d.line([(fx - 26, fy), (fx + 26, fy)], fill=(255, 255, 255), width=9)
    d.line([(fx, fy - 26), (fx, fy + 26)], fill=(255, 255, 255), width=9)
    items = [("Klien", nic_building), ("Tools", nic_wrench), ("SSH", nic_term), ("SFTP", nic_folder)]
    for i, (name, ic) in enumerate(items):
        ix = W * (1 / 8 + i / 4)
        c = ACCENT if name == active else DIM
        ic(d, ix - 24, y0 + 66, c)
        tw = d.textlength(name, font=f(22, 600))
        d.text((ix - tw / 2, y0 + 122), name, font=f(22, 600), fill=c)

def header(d, gear=True):
    y = 84
    tracked(d, (M, y), "NETKIT", f(24, 700), FAINT, ls=10)
    if gear:
        gx, gy = W - M - 24, y - 6
        cx, cy = gx, gy + 24
        for a in range(8):
            ang = math.pi / 4 * a + math.pi / 8
            x1, y1 = cx + 15 * math.cos(ang), cy + 15 * math.sin(ang)
            x2, y2 = cx + 23 * math.cos(ang), cy + 23 * math.sin(ang)
            d.line([(x1, y1), (x2, y2)], fill=DIM, width=6)
        d.ellipse([cx - 12, cy - 12, cx + 12, cy + 12], outline=DIM, width=4)
        d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], outline=DIM, width=4)
    else:
        d.text((W - M - 90, y - 2), "v0.1", font=f(22, 500, mono=True), fill=FAINT)
    return y

def new_img():
    img = Image.new("RGBA", (W, H), BG + (255,))
    d = ImageDraw.Draw(img)
    statusbar(d)
    return img, d

# ================= 1. KLIEN (direktori) =================
img, d = new_img()
y = header(d) + 44
stats = [("3", "KLIEN", TEXT), ("2", "LOKAL", DIM), ("1", "PUBLIK", ACCENT)]
cw = (W - 2 * M) / 3
for i, (num, lab, col) in enumerate(stats):
    cx = M + cw * i + 28
    d.text((cx, y), num, font=f(64, 700, mono=True), fill=col)
    tracked(d, (cx + 76, y + 34), lab, f(20, 700), FAINT, ls=6)
    if i < 2:
        d.line([M + cw * (i + 1), y + 8, M + cw * (i + 1), y + 68], fill=HAIR, width=2)
y += 108
d.rounded_rectangle([M, y, W - M, y + 80], radius=10, fill=PANEL, outline=HAIR, width=2)
d.text((M + 28, y + 22), ">", font=f(30, 700, mono=True), fill=ACCENT)
d.text((M + 62, y + 22), "cari bpr / ip_", font=f(28, 400, mono=True), fill=DIM)
y += 104
clients = [
    ("BPR Artha Prima", "Jl. Merdeka No. 88, Bandung", "192.168.10.5", "8080"),
    ("BPR Mitra Usaha", "Jl. Ahmad Yani No. 12, Surabaya", "103.147.8.20", "9090"),
    ("Koperasi Sejahtera", "Jl. Pahlawan No. 5, Semarang", "172.16.0.12", "8080"),
]
for name, addr, ip, port in clients:
    tag = "lokal" if is_private(ip) else "publik"
    tcol = DIM if tag == "lokal" else ACCENT
    d.text((M + 24, y + 22), name, font=f(30, 600), fill=TEXT)
    d.text((M + 24, y + 62), addr, font=f(24, 400), fill=DIM)
    ipport = f"{ip}:{port}"
    tw = d.textlength(ipport, font=f(25, 500, mono=True))
    d.text((W - M - tw, y + 22), ipport, font=f(25, 500, mono=True), fill=TEXT)
    tg = f"·{tag}"
    gw = d.textlength(tg, font=f(23, 500, mono=True))
    d.text((W - M - gw, y + 60), tg, font=f(23, 500, mono=True), fill=tcol)
    y += 112
    hairline(d, y)
wavy_navbar(d, "Klien")
img.convert("RGB").save(f"{OUTDIR}/01-klien-light-v7.png"); print("saved 01")

# ================= 2. TOOLS HUB =================
img, d = new_img()
y = header(d) + 44
y = micro(d, y, "DIAGNOSTIK")
tools = [("PING", "ip / hostname custom"), ("TELNET", "tcp host:port"),
         ("DNS", "lookup & reverse"), ("HTTP/SSL", "status + sertifikat")]
gw, gap = (W - 2 * M - 24) / 2, 24
for i, (t, sub) in enumerate(tools):
    gx = M + (i % 2) * (gw + gap)
    gy = y + (i // 2) * (132 + gap)
    d.rounded_rectangle([gx, gy, gx + gw, gy + 132], radius=10, fill=PANEL, outline=HAIR, width=2)
    tw = d.textlength(t, font=f(28, 700, mono=True))
    d.text((gx + (gw - tw) / 2, gy + 30), t, font=f(28, 700, mono=True), fill=TEXT)
    sw = d.textlength(sub, font=f(22, 400))
    d.text((gx + (gw - sw) / 2, gy + 72), sub, font=f(22, 400), fill=DIM)
y += 2 * (132 + gap) + 28
y = micro(d, y, "TERAKHIR")
d.rounded_rectangle([M, y, W - M, y + 208], radius=10, fill=PANEL, outline=HAIR, width=2)
logs = [
    ("10:38:02", "PING", OK, "8.8.8.8  avg 14ms"),
    ("10:31:47", "TELNET", OK, "103.147.8.20:9090  OPEN 61ms"),
    ("09:58:13", "DNS", OK, "gw-bpr.ussi.id -> 103.147.8.20"),
]
ly = y + 26
for ts, tool, col, msg in logs:
    d.text((M + 28, ly), ts, font=f(24, 400, mono=True), fill=FAINT)
    d.text((M + 168, ly), tool, font=f(24, 700, mono=True), fill=col)
    d.text((M + 268, ly), msg, font=f(24, 500, mono=True), fill=TEXT)
    ly += 58
wavy_navbar(d, "Tools")
img.convert("RGB").save(f"{OUTDIR}/02-tools-light-v7.png"); print("saved 02")

# ================= 3. PING =================
img, d = new_img()
d.text((M, 108), "<", font=f(40, 700, mono=True), fill=DIM)
d.text((M + 56, 106), "Ping", font=f(36, 700), fill=TEXT)
y = 210
tracked(d, (M + 4, y), "TARGET", f(20, 700), FAINT, ls=6)
y += 36
d.rounded_rectangle([M, y, W - M, y + 88], radius=10, fill=PANEL, outline=ACCENT, width=3)
d.text((M + 28, y + 26), "8.8.8.8", font=f(29, 400, mono=True), fill=TEXT)
y += 88 + 24
y = chunky_btn(d, y, "Mulai ping") + 32
y = micro(d, y, "HASIL")
d.rounded_rectangle([M, y, W - M, y + 320], radius=10, fill=TERM_BG)
out = [
    ("PING 8.8.8.8: 56 data bytes", TERM_TX),
    ("64B from 8.8.8.8: seq=0 ttl=117 time=12.4ms", TERM_TX),
    ("64B from 8.8.8.8: seq=1 ttl=117 time=11.8ms", TERM_TX),
    ("64B from 8.8.8.8: seq=2 ttl=117 time=13.1ms", TERM_TX),
    ("--- 8.8.8.8 ping statistics ---", TERM_GR),
    ("3 sent, 3 received, 0% loss, avg 12.4ms", TERM_GR),
]
ly = y + 26
for line, col in out:
    d.text((M + 28, ly), line, font=f(23, 400, mono=True), fill=col)
    ly += 46
y += 320 + 28
chunky_btn(d, y, "Salin hasil", outline=ACCENT)
wavy_navbar(d, "Tools")
img.convert("RGB").save(f"{OUTDIR}/03-ping-light-v7.png"); print("saved 03")

# ================= 4. SSH TERMINAL =================
img, d = new_img()
d.text((M, 108), "<", font=f(40, 700, mono=True), fill=DIM)
d.text((M + 56, 106), "root@103.147.8.20", font=f(30, 700, mono=True), fill=TEXT)
d.ellipse([W - M - 44, 118, W - M - 20, 142], fill=OK)
y = 190
d.rounded_rectangle([M, y, W - M, 1290], radius=10, fill=TERM_BG)
term = [
    (f"{'root@gw-bpr'}:~# ", TERM_GR, "uptime"),
    (" 10:42 up 23 days, load 0.08", TERM_TX, None),
    (f"{'root@gw-bpr'}:~# ", TERM_GR, "df -h /"),
    (" Filesystem  Size Used Avail Use%", TERM_TX, None),
    (" /dev/sda1    20G 8.1G   12G  41%", TERM_TX, None),
    (f"{'root@gw-bpr'}:~# ", TERM_GR, "systemctl status ibs-gw"),
    (" Active: active (running)", TERM_TX, None),
    (f"{'root@gw-bpr'}:~# ", TERM_GR, None),
]
ly = y + 28
for prompt, pcol, cmd in term:
    if cmd is None:
        d.text((M + 28, ly), prompt + "_", font=f(25, 500, mono=True), fill=pcol)
    elif prompt.startswith(" "):
        d.text((M + 28, ly), prompt, font=f(25, 400, mono=True), fill=pcol)
    else:
        d.text((M + 28, ly), prompt, font=f(25, 700, mono=True), fill=pcol)
        pw = d.textlength(prompt, font=f(25, 700, mono=True))
        d.text((M + 28 + pw, ly), cmd, font=f(25, 400, mono=True), fill=TERM_TX)
    ly += 48
# input bar
d.rounded_rectangle([M, 1314, W - M, 1402], radius=10, fill=TERM_BG)
d.text((M + 28, 1338), ">", font=f(28, 700, mono=True), fill=TERM_GR)
d.text((M + 62, 1338), "ketik perintah_", font=f(26, 400, mono=True), fill=(120, 130, 145))
wavy_navbar(d, "SSH")
img.convert("RGB").save(f"{OUTDIR}/04-ssh-light-v7.png"); print("saved 04")

# ================= 5. SFTP =================
img, d = new_img()
d.text((M, 108), "<", font=f(40, 700, mono=True), fill=DIM)
d.text((M + 56, 106), "SFTP · gw-bpr", font=f(32, 700), fill=TEXT)
y = 190
d.rounded_rectangle([M, y, W - M, y + 72], radius=10, fill=PANEL, outline=HAIR, width=2)
d.text((M + 28, y + 20), "/home/bpr/", font=f(26, 500, mono=True), fill=TEXT)
d.text((W - M - 60, y + 20), "^", font=f(28, 700, mono=True), fill=DIM)
y += 96
files = [
    (True, "logs", "4,1 MB", "10:12"),
    (True, "backup", "812 MB", "kemarin"),
    (False, "app.conf", "2,4 KB", "10:05"),
    (False, "gw.log", "18 MB", "10:41"),
    (False, "restart.sh", "1,1 KB", "09:20"),
]
for isdir, name, size, when in files:
    if isdir:
        d.polygon([(M + 28, y + 26), (M + 44, y + 26), (M + 50, y + 33), (M + 76, y + 33),
                   (M + 76, y + 62), (M + 28, y + 62)], outline=ACCENT, width=4)
    else:
        d.rounded_rectangle([M + 32, y + 22, M + 68, y + 62], radius=6, outline=DIM, width=4)
        d.line([(M + 32, y + 34), (M + 68, y + 34)], fill=DIM, width=3)
    d.text((M + 96, y + 28), name, font=f(29, 500, mono=isdir), fill=TEXT)
    sw = d.textlength(size, font=f(24, 500, mono=True))
    d.text((W - M - 28 - sw, y + 26), size, font=f(24, 500, mono=True), fill=TEXT)
    ww = d.textlength(when, font=f(22, 400))
    d.text((W - M - 28 - ww, y + 56), when, font=f(22, 400), fill=DIM)
    y += 96
    hairline(d, y)
y += 24
d.rounded_rectangle([M, y, M + (W - 2 * M - 24) / 2, y + 80], radius=10, outline=ACCENT, width=3)
t = "Download"
tw = d.textlength(t, font=f(28, 700))
d.text((M + ((W - 2 * M - 24) / 2 - tw) / 2, y + 22), t, font=f(28, 700), fill=ACCENT)
bx = M + (W - 2 * M - 24) / 2 + 24
d.rounded_rectangle([bx, y, W - M, y + 80], radius=10, fill=ACCENT)
t2 = "Upload"
tw2 = d.textlength(t2, font=f(28, 700))
d.text((bx + ((W - M - bx) - tw2) / 2, y + 22), t2, font=f(28, 700), fill=(255, 255, 255))
wavy_navbar(d, "SFTP")
img.convert("RGB").save(f"{OUTDIR}/05-sftp-light-v7.png"); print("saved 05")

# ================= 6. PENGATURAN =================
img, d = new_img()
d.text((M, 108), "<", font=f(40, 700, mono=True), fill=DIM)
d.text((M + 56, 106), "Pengaturan", font=f(36, 700), fill=TEXT)
y = 210
y = micro(d, y, "APLIKASI")
d.rounded_rectangle([M, y, W - M, y + 288], radius=10, fill=PANEL, outline=HAIR, width=2)
rows = [("Versi", "0.1.0-proto"), ("Mode", "offline · tanpa backend"),
        ("Kredensial SSH", "Keychain / Keystore")]
ry = y
for i, (lab, val) in enumerate(rows):
    d.text((M + 28, ry + 22), lab, font=f(28, 500), fill=TEXT)
    vw = d.textlength(val, font=f(25, 500, mono=True))
    d.text((W - M - 28 - vw, ry + 24), val, font=f(25, 500, mono=True), fill=DIM)
    if i < len(rows) - 1:
        d.line([M + 28, ry + 92, W - M - 28, ry + 92], fill=HAIR, width=2)
    ry += 96
y += 288 + 32
y = micro(d, y, "TERMINAL SSH")
d.rounded_rectangle([M, y, W - M, y + 128], radius=10, fill=ACCENT_DIM)
d.text((M + 28, y + 22), "Full pty (xterm.js).", font=f(26, 700), fill=TEXT)
d.text((M + 28, y + 60), "Extra key: Esc · Ctrl · Tab · panah.", font=f(25, 400), fill=DIM)
d.text((M + 28, y + 92), "vim / htop jalan.", font=f(25, 400), fill=DIM)
y += 128 + 32
y = micro(d, y, "DATA")
d.rounded_rectangle([M, y, W - M, y + 96], radius=10, fill=PANEL, outline=HAIR, width=2)
d.text((M + 28, y + 30), "Hapus semua data", font=f(28, 600), fill=FAIL)
d.text((W - M - 60, y + 28), ">", font=f(32, 700, mono=True), fill=FAINT)
wavy_navbar(d, "Klien")
img.convert("RGB").save(f"{OUTDIR}/06-pengaturan-light-v7.png"); print("saved 06")
