from PIL import Image, ImageDraw
import os

ASSETS_DIR = "src/assets/icons"
os.makedirs(ASSETS_DIR, exist_ok=True)

SIZE = 48
NORMAL = "#8A8A8A"
ACTIVE = "#2B8CFF"

def save_icon(name, draw_fn, color):
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    draw_fn(draw, color)
    path = os.path.join(ASSETS_DIR, name)
    img.save(path, "PNG")
    print(f"Generated {path}")

def draw_home(draw, color):
    # house shape
    draw.polygon([(24, 8), (6, 24), (10, 24), (10, 38), (20, 38), (20, 30), (28, 30), (28, 38), (38, 38), (38, 24), (42, 24)], fill=color, outline=None)

def draw_cart(draw, color):
    # shopping cart
    draw.rounded_rectangle([6, 10, 38, 34], radius=4, outline=color, width=3)
    draw.line([(10, 10), (14, 6), (30, 6), (34, 10)], fill=color, width=3)
    draw.ellipse([12, 36, 18, 42], fill=color)
    draw.ellipse([30, 36, 36, 42], fill=color)

def draw_publish(draw, color):
    # plus circle
    r = 18
    draw.ellipse([SIZE//2-r, SIZE//2-r, SIZE//2+r, SIZE//2+r], outline=color, width=3)
    draw.rectangle([SIZE//2-8, SIZE//2-2, SIZE//2+8, SIZE//2+2], fill=color)
    draw.rectangle([SIZE//2-2, SIZE//2-8, SIZE//2+2, SIZE//2+8], fill=color)

def draw_chat(draw, color):
    # speech bubble
    draw.rounded_rectangle([6, 8, 42, 36], radius=6, fill=color)
    draw.polygon([(18, 36), (24, 44), (30, 36)], fill=color)

def draw_me(draw, color):
    # person
    draw.ellipse([SIZE//2-8, 8, SIZE//2+8, 24], fill=color)
    draw.rounded_rectangle([8, 26, 40, 42], radius=8, fill=color)

icons = [
    ("home", draw_home),
    ("cart", draw_cart),
    ("publish", draw_publish),
    ("chat", draw_chat),
    ("me", draw_me),
]

for name, fn in icons:
    save_icon(f"tab-{name}.png", fn, NORMAL)
    save_icon(f"tab-{name}-active.png", fn, ACTIVE)

print("All tab bar icons generated.")
