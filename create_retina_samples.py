import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import os

def create_retina_base():
    # 512x512 circular fundus
    size = (512, 512)
    img = Image.new('RGB', size, (0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Fundus orange-red background gradient
    for r in range(230, 0, -2):
        shade = int(180 + 40 * (r / 230))
        g = int(60 + 20 * (r / 230))
        b = int(20 + 10 * (r / 230))
        draw.ellipse((256 - r, 256 - r, 256 + r, 256 + r), fill=(shade, g, b))
        
    return img

def create_normal():
    img = create_retina_base()
    draw = ImageDraw.Draw(img)
    # Optic disc on right
    draw.ellipse((350, 220, 420, 290), fill=(255, 230, 160))
    draw.ellipse((365, 235, 405, 275), fill=(255, 245, 200))
    # Macula on left
    draw.ellipse((190, 235, 235, 280), fill=(140, 40, 15))
    draw.ellipse((210, 255, 215, 260), fill=(100, 20, 10))
    
    # Vessels branching from optic disc
    for dx, dy in [(-80, -120), (-140, -90), (-180, -30), (-170, 70), (-110, 120), (-60, 150)]:
        draw.line([(385, 255), (385 + dx // 2, 255 + dy // 2), (385 + dx, 255 + dy)], fill=(120, 15, 15), width=3)
    
    img = img.filter(ImageFilter.GaussianBlur(1.5))
    return img

def create_dr():
    img = create_normal()
    draw = ImageDraw.Draw(img)
    np.random.seed(42)
    # Microaneurysms / hemorrhages (red dots)
    for _ in range(60):
        x = int(np.random.uniform(150, 360))
        y = int(np.random.uniform(150, 360))
        rad = np.random.randint(2, 6)
        draw.ellipse((x, y, x + rad, y + rad), fill=(100, 5, 5))
    # Hard exudates (yellow flecks)
    for _ in range(35):
        x = int(np.random.uniform(170, 340))
        y = int(np.random.uniform(180, 320))
        rad = np.random.randint(3, 7)
        draw.ellipse((x, y, x + rad, y + rad), fill=(255, 240, 130))
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    return img

def create_glaucoma():
    img = create_retina_base()
    draw = ImageDraw.Draw(img)
    # Optic disc with extensive optic cup enlargement
    draw.ellipse((340, 210, 430, 300), fill=(255, 215, 140))
    # Deep, pale optic cup occupying >80% disc area
    draw.ellipse((350, 220, 420, 290), fill=(255, 255, 230))
    # Bayoneting vessels bending sharply over cup edge
    for dx, dy in [(-90, -130), (-150, -80), (-190, -10), (-160, 80), (-90, 130)]:
        draw.line([(385, 255), (385 + dx // 3, 255 + dy // 3), (385 + dx, 255 + dy)], fill=(130, 20, 20), width=3)
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    return img

def create_cataract():
    img = create_normal()
    # Cataract lens opacification / diffuse milky blur and yellowing
    cataract_overlay = Image.new('RGB', (512, 512), (210, 180, 100))
    img = Image.blend(img, cataract_overlay, 0.45)
    img = img.filter(ImageFilter.GaussianBlur(6.0))
    return img

out_dir = os.path.join('frontend', 'public', 'samples', 'eye')
os.makedirs(out_dir, exist_ok=True)
create_normal().save(os.path.join(out_dir, 'normal.jpg'), quality=95)
create_dr().save(os.path.join(out_dir, 'diabetic_retinopathy.jpg'), quality=95)
create_glaucoma().save(os.path.join(out_dir, 'glaucoma.jpg'), quality=95)
create_cataract().save(os.path.join(out_dir, 'cataract.jpg'), quality=95)
print("Samples generated successfully!")
