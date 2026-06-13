import os

base = r'Skin cancer ISIC The International Skin Imaging Collaboration\Train'
classes = [
    'actinic keratosis',
    'basal cell carcinoma',
    'dermatofibroma',
    'melanoma',
    'nevus',
    'pigmented benign keratosis',
    'seborrheic keratosis',
    'squamous cell carcinoma',
    'vascular lesion'
]

print('Class Distribution in Training Set:')
print('='*50)
total = 0
for c in classes:
    path = os.path.join(base, c)
    if os.path.exists(path):
        count = len([f for f in os.listdir(path) if f.endswith('.jpg')])
        total += count
        print(f'{c:30s}: {count:4d} images')
    else:
        print(f'{c:30s}: NOT FOUND')

print('='*50)
print(f'Total: {total} images')
