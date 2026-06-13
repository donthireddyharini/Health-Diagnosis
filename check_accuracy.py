import requests
import random
import os

# Register a test user
username = f'acc{random.randint(10000,99999)}'
r = requests.post('http://localhost:5000/api/register', json={
    'username': username,
    'email': f'{username}@test.com',
    'password': 'test123'
})
token = r.json()['access_token']

print('ACCURACY CHECK - Testing if model detects correct diseases\n')

# Test cases
tests = [
    ('melanoma', 'ISIC_0000139.jpg'),
    ('melanoma', 'ISIC_0000141.jpg'),
    ('basal cell carcinoma', 'ISIC_0024504.jpg'),
    ('basal cell carcinoma', 'ISIC_0024515.jpg'),
    ('nevus', 'ISIC_0000019.jpg'),
    ('nevus', 'ISIC_0000020.jpg'),
]

correct = 0
total = 0

for folder, image in tests:
    path = f'Skin cancer ISIC The International Skin Imaging Collaboration\\Train\\{folder}\\{image}'
    
    if not os.path.exists(path):
        continue
    
    total += 1
    files = {'image': open(path, 'rb')}
    r = requests.post('http://localhost:5000/api/predict', 
                     files=files, 
                     headers={'Authorization': f'Bearer {token}'})
    
    result = r.json()
    
    if r.status_code != 200:
        print(f'ERROR: {image} - {result}')
        continue
    
    predicted = result['predicted_class']
    confidence = result['confidence'] * 100
    
    match = predicted.lower() == folder.lower()
    if match:
        correct += 1
        symbol = 'CORRECT'
    else:
        symbol = 'WRONG'
    
    print(f'{symbol}: {image}')
    print(f'  Expected: {folder.upper()}')
    print(f'  Got: {predicted.upper()} ({confidence:.1f}%)')
    
    # Show top 3
    top3 = sorted(result['all_predictions'].items(), key=lambda x: x[1], reverse=True)[:3]
    for i, (d, c) in enumerate(top3, 1):
        print(f'    {i}. {d}: {c*100:.1f}%')
    print()

print(f'\nRESULTS: {correct}/{total} correct = {(correct/total)*100:.1f}% accuracy')
