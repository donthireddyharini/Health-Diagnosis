import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import json
import os

# Load model and class indices
model = keras.models.load_model('models/skin_disease_model_final.keras')
with open('models/class_indices.json', 'r') as f:
    class_indices = json.load(f)

output_file = open('test_results.txt', 'w', encoding='utf-8')

def log(msg):
    print(msg)
    output_file.write(msg + '\n')

log('='*70)
log('DIRECT MODEL ACCURACY TEST')
log('='*70)
log('')

def predict_image(image_path):
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    predictions = model.predict(img_array, verbose=0)[0]
    predicted_idx = np.argmax(predictions)
    predicted_class = class_indices[str(predicted_idx)]
    confidence = float(predictions[predicted_idx])
    
    return predicted_class, confidence, predictions

# Test cases
tests = [
    ('melanoma', 'ISIC_0000139.jpg'),
    ('melanoma', 'ISIC_0000141.jpg'),
    ('melanoma', 'ISIC_0000142.jpg'),
    ('basal cell carcinoma', 'ISIC_0024504.jpg'),
    ('basal cell carcinoma', 'ISIC_0024515.jpg'),
    ('nevus', 'ISIC_0000019.jpg'),
    ('nevus', 'ISIC_0000020.jpg'),
    ('dermatofibroma', 'ISIC_0025594.jpg'),
]

correct = 0
total = 0
base_path = r'Skin cancer ISIC The International Skin Imaging Collaboration\Train'

for expected_disease, image_file in tests:
    image_path = os.path.join(base_path, expected_disease, image_file)
    
    if not os.path.exists(image_path):
        log(f'⚠️  SKIPPED: {image_file} (not found)')
        continue
    
    total += 1
    predicted, confidence, all_preds = predict_image(image_path)
    
    is_correct = predicted.lower() == expected_disease.lower()
    if is_correct:
        correct += 1
        status = '✅ CORRECT'
    else:
        status = '❌ WRONG'
    
    log(f'{status}')
    log(f'  Image: {image_file}')
    log(f'  Expected: {expected_disease.upper()}')
    log(f'  Predicted: {predicted.upper()}')
    log(f'  Confidence: {confidence*100:.2f}%')
    log(f'  Top 3:')
    
    # Get top 3
    top_indices = np.argsort(all_preds)[-3:][::-1]
    for i, idx in enumerate(top_indices, 1):
        disease = class_indices[str(idx)]
        conf = all_preds[idx]
        marker = '→' if disease.lower() == expected_disease.lower() else ' '
        log(f'    {marker} {i}. {disease.title()}: {conf*100:.2f}%')
    log('')

log('='*70)
log('FINAL RESULTS')
log('='*70)
log(f'Total Tests: {total}')
log(f'Correct: {correct}')
log(f'Wrong: {total - correct}')
if total > 0:
    accuracy = (correct / total) * 100
    log(f'Accuracy: {accuracy:.2f}%')
    log('')
    if accuracy >= 70:
        log('✅ Model is performing well!')
    elif accuracy >= 50:
        log('⚠️  Model has moderate accuracy')
    else:
        log('❌ Model needs improvement')
else:
    log('No tests completed')
log('='*70)
output_file.close()
