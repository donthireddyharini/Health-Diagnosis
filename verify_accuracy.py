import requests
import random
import os

# Register a test user
username = f'testuser{random.randint(10000,99999)}'
r = requests.post('http://localhost:5000/api/register', json={
    'username': username,
    'email': f'{username}@test.com',
    'password': 'test123'
})
token = r.json()['access_token']

print('='*80)
print('SKIN DISEASE DETECTION ACCURACY VERIFICATION')
print('='*80)

# Test cases: (folder_name, expected_disease, image_file)
test_cases = [
    ('melanoma', 'melanoma', 'ISIC_0000139.jpg'),
    ('melanoma', 'melanoma', 'ISIC_0000141.jpg'),
    ('melanoma', 'melanoma', 'ISIC_0000142.jpg'),
    ('basal cell carcinoma', 'basal cell carcinoma', 'ISIC_0024504.jpg'),
    ('basal cell carcinoma', 'basal cell carcinoma', 'ISIC_0024515.jpg'),
    ('nevus', 'nevus', 'ISIC_0000019.jpg'),
    ('nevus', 'nevus', 'ISIC_0000020.jpg'),
    ('dermatofibroma', 'dermatofibroma', 'ISIC_0025594.jpg'),
    ('actinic keratosis', 'actinic keratosis', 'ISIC_0025780.jpg'),
]

correct = 0
total = 0
results = []

base_path = r'Skin cancer ISIC The International Skin Imaging Collaboration\Train'

for folder, expected, image_file in test_cases:
    image_path = os.path.join(base_path, folder, image_file)
    
    if not os.path.exists(image_path):
        print(f'\n⚠️  SKIPPED: {image_file} not found')
        continue
    
    total += 1
    
    try:
        files = {'image': open(image_path, 'rb')}
        r = requests.post('http://localhost:5000/api/predict', 
                         files=files, 
                         headers={'Authorization': f'Bearer {token}'})
        
        if r.status_code == 200:
            result = r.json()
            predicted = result['predicted_class']
            confidence = result['confidence'] * 100
            
            is_correct = predicted.lower() == expected.lower()
            if is_correct:
                correct += 1
                status = '✅ CORRECT'
            else:
                status = '❌ WRONG'
            
            print(f'\n{status}')
            print(f'  Image: {image_file}')
            print(f'  Expected: {expected.upper()}')
            print(f'  Predicted: {predicted.upper()}')
            print(f'  Confidence: {confidence:.2f}%')
            
            # Show top 3 predictions
            print(f'  Top 3 predictions:')
            for i, (disease, conf) in enumerate(sorted(result['all_predictions'].items(), 
                                                       key=lambda x: x[1], 
                                                       reverse=True)[:3], 1):
                marker = '→' if disease.lower() == expected.lower() else ' '
                print(f'    {marker} {i}. {disease.title()}: {conf*100:.2f}%')
            
            results.append({
                'image': image_file,
                'expected': expected,
                'predicted': predicted,
                'correct': is_correct,
                'confidence': confidence
            })
        else:
            print(f'\n❌ ERROR: {image_file}')
            print(f'  Status: {r.status_code}')
            print(f'  Error: {r.json()}')
    
    except Exception as e:
        print(f'\n❌ EXCEPTION: {image_file}')
        print(f'  Error: {str(e)}')

# Summary
print('\n' + '='*80)
print('ACCURACY SUMMARY')
print('='*80)
print(f'Total Tests: {total}')
print(f'Correct Predictions: {correct}')
print(f'Wrong Predictions: {total - correct}')
if total > 0:
    accuracy = (correct / total) * 100
    print(f'Accuracy: {accuracy:.2f}%')
    
    if accuracy >= 80:
        print('\n✅ EXCELLENT: Model is performing very well!')
    elif accuracy >= 60:
        print('\n⚠️  GOOD: Model is performing reasonably well.')
    else:
        print('\n❌ POOR: Model needs improvement or retraining.')
else:
    print('\n⚠️  No tests completed')

print('='*80)
