from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_mail import Mail, Message
from datetime import datetime, timedelta
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import json
import os
from werkzeug.utils import secure_filename
from disease_info import get_disease_info, get_all_diseases
import ollama

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///skin_disease.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-change-this-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Email configuration (optional - configure with your SMTP settings)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your-email@gmail.com'
app.config['MAIL_PASSWORD'] = 'your-app-password'

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)
mail = Mail(app)

# Create upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load ML model
MODEL_PATH = 'models/skin_disease_model_final.keras'
CLASS_INDICES_PATH = 'models/class_indices.json'

try:
    model = keras.models.load_model(MODEL_PATH)
    with open(CLASS_INDICES_PATH, 'r') as f:
        class_indices = json.load(f)
    print("[OK] Model loaded successfully!")
    print(f"[OK] Detecting {len(class_indices)} skin diseases")
except Exception as e:
    print(f"[ERROR] Error loading model: {e}")
    model = None
    class_indices = {}

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_doctor = db.Column(db.Boolean, default=False)
    specialization = db.Column(db.String(100))
    license_number = db.Column(db.String(50))
    
    predictions = db.relationship('Prediction', backref='user', lazy=True, cascade='all, delete-orphan')
    consultations_as_patient = db.relationship('Consultation', foreign_keys='Consultation.patient_id', 
                                               backref='patient', lazy=True, cascade='all, delete-orphan')
    consultations_as_doctor = db.relationship('Consultation', foreign_keys='Consultation.doctor_id', 
                                              backref='doctor', lazy=True)

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    image_path = db.Column(db.String(200), nullable=False)
    predicted_class = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    all_predictions = db.Column(db.Text)  # JSON string of all class probabilities
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    
    consultation = db.relationship('Consultation', backref='prediction', uselist=False, cascade='all, delete-orphan')

class Consultation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    prediction_id = db.Column(db.Integer, db.ForeignKey('prediction.id'))
    status = db.Column(db.String(20), default='pending')  # pending, accepted, completed, cancelled
    symptoms = db.Column(db.Text)
    doctor_notes = db.Column(db.Text)
    prescription = db.Column(db.Text)
    appointment_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create database tables
with app.app_context():
    db.create_all()

# Helper Functions
def preprocess_image(image_file):
    """Preprocess image for model prediction"""
    img = Image.open(image_file).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict_disease(image_file):
    """Predict disease from image"""
    if model is None:
        return None, "Model not loaded"
    
    try:
        img_array = preprocess_image(image_file)
        predictions = model.predict(img_array)[0]
        
        # Get top prediction
        predicted_idx = np.argmax(predictions)
        predicted_class = class_indices[str(predicted_idx)]
        confidence = float(predictions[predicted_idx])
        
        # Get all predictions
        all_preds = {}
        for idx, prob in enumerate(predictions):
            class_name = class_indices[str(idx)]
            all_preds[class_name] = float(prob)
        
        # Check if model is uncertain (possible normal skin or unclear image)
        CONFIDENCE_THRESHOLD = 0.65  # 65% minimum confidence for certainty
        max_confidence = confidence
        
        # Calculate entropy to detect uniform distribution (uncertainty)
        entropy = -sum([p * np.log(p + 1e-10) for p in predictions if p > 0])
        max_entropy = np.log(len(predictions))  # Maximum possible entropy
        normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0
        
        # Get top 3 predictions to check if they're close
        top_3_probs = sorted(predictions, reverse=True)[:3]
        top_3_spread = top_3_probs[0] - top_3_probs[2] if len(top_3_probs) >= 3 else 1.0
        
        # Uncertain if:
        # 1. Low confidence (<65%)
        # 2. High entropy (>0.80) - predictions spread out
        # 3. Top predictions are close (<0.25 difference) - model is confused
        is_uncertain = (
            (max_confidence < CONFIDENCE_THRESHOLD) or 
            (normalized_entropy > 0.80) or
            (top_3_spread < 0.25)
        )
        
        result = {
            'predicted_class': predicted_class,
            'confidence': confidence,
            'all_predictions': all_preds,
            'is_uncertain': is_uncertain,
            'entropy': float(normalized_entropy)
        }
        
        # If uncertain, suggest it might be normal skin or unclear image
        if is_uncertain:
            result['warning'] = 'Low confidence detection. This may be normal skin or the image quality is unclear.'
            result['suggestion'] = 'If you believe there is a skin condition, please consult a dermatologist for proper examination.'
        
        return result, None
    except Exception as e:
        return None, str(e)

# Routes

@app.route('/')
def index():
    return jsonify({
        'message': 'Skin Disease Detection API',
        'version': '1.0',
        'endpoints': {
            'auth': ['/api/register', '/api/login', '/api/profile'],
            'prediction': ['/api/predict', '/api/predictions', '/api/predictions/<id>'],
            'consultation': ['/api/consultations', '/api/consultations/<id>', '/api/doctors'],
            'info': ['/api/diseases', '/api/diseases/<name>']
        }
    })

# Authentication Routes

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Username, email, and password are required'}), 400
        
        # Check if user exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Hash password
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Create user
        user = User(
            username=data['username'],
            email=data['email'],
            password=hashed_password,
            full_name=data.get('full_name'),
            phone=data.get('phone'),
            gender=data.get('gender'),
            is_doctor=data.get('is_doctor', False),
            specialization=data.get('specialization'),
            license_number=data.get('license_number')
        )
        
        if data.get('date_of_birth'):
            user.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'is_doctor': user.is_doctor
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not bcrypt.check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Create access token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'is_doctor': user.is_doctor,
                'specialization': user.specialization
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if request.method == 'GET':
            return jsonify({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'phone': user.phone,
                'date_of_birth': user.date_of_birth.isoformat() if user.date_of_birth else None,
                'gender': user.gender,
                'is_doctor': user.is_doctor,
                'specialization': user.specialization,
                'license_number': user.license_number,
                'created_at': user.created_at.isoformat()
            }), 200
        
        elif request.method == 'PUT':
            data = request.get_json()
            
            # Update fields
            if data.get('full_name'):
                user.full_name = data['full_name']
            if data.get('phone'):
                user.phone = data['phone']
            if data.get('gender'):
                user.gender = data['gender']
            if data.get('date_of_birth'):
                user.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            
            db.session.commit()
            
            return jsonify({'message': 'Profile updated successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Prediction Routes

@app.route('/api/predict', methods=['POST'])
@jwt_required()
def predict():
    try:
        user_id = int(get_jwt_identity())
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Save image
        filename = secure_filename(f"{user_id}_{datetime.now().timestamp()}_{image_file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(filepath)
        
        # Predict
        result, error = predict_disease(filepath)
        
        if error:
            return jsonify({'error': error}), 500
        
        # Save prediction to database
        prediction = Prediction(
            user_id=user_id,
            image_path=filepath,
            predicted_class=result['predicted_class'],
            confidence=result['confidence'],
            all_predictions=json.dumps(result['all_predictions']),
            notes=request.form.get('notes')
        )
        
        db.session.add(prediction)
        db.session.commit()
        
        # Get disease information
        disease_info = get_disease_info(result['predicted_class'])
        
        return jsonify({
            'prediction_id': prediction.id,
            'predicted_class': result['predicted_class'],
            'confidence': result['confidence'],
            'all_predictions': result['all_predictions'],
            'disease_info': disease_info,
            'created_at': prediction.created_at.isoformat()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/predictions', methods=['GET'])
@jwt_required()
def get_predictions():
    try:
        user_id = int(get_jwt_identity())
        predictions = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.created_at.desc()).all()
        
        result = []
        for pred in predictions:
            result.append({
                'id': pred.id,
                'predicted_class': pred.predicted_class,
                'confidence': pred.confidence,
                'created_at': pred.created_at.isoformat(),
                'notes': pred.notes,
                'has_consultation': pred.consultation is not None
            })
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predictions/<int:prediction_id>', methods=['GET', 'DELETE'])
@jwt_required()
def get_prediction(prediction_id):
    try:
        user_id = int(get_jwt_identity())
        prediction = Prediction.query.filter_by(id=prediction_id, user_id=user_id).first()
        
        if not prediction:
            return jsonify({'error': 'Prediction not found'}), 404
        
        if request.method == 'GET':
            disease_info = get_disease_info(prediction.predicted_class)
            all_preds = json.loads(prediction.all_predictions) if prediction.all_predictions else {}
            
            return jsonify({
                'id': prediction.id,
                'predicted_class': prediction.predicted_class,
                'confidence': prediction.confidence,
                'all_predictions': all_preds,
                'disease_info': disease_info,
                'created_at': prediction.created_at.isoformat(),
                'notes': prediction.notes,
                'image_url': f'/api/images/{os.path.basename(prediction.image_path)}'
            }), 200
        
        elif request.method == 'DELETE':
            # Delete image file
            if os.path.exists(prediction.image_path):
                os.remove(prediction.image_path)
            
            db.session.delete(prediction)
            db.session.commit()
            
            return jsonify({'message': 'Prediction deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/images/<filename>')
@jwt_required()
def get_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Disease Information Routes

@app.route('/api/diseases', methods=['GET'])
def get_diseases():
    diseases = get_all_diseases()
    result = []
    for disease in diseases:
        info = get_disease_info(disease)
        result.append({
            'name': info['name'],
            'key': disease,
            'severity': info['severity'],
            'requires_doctor': info['requires_doctor']
        })
    return jsonify(result), 200

@app.route('/api/diseases/<disease_name>', methods=['GET'])
def get_disease_details(disease_name):
    info = get_disease_info(disease_name)
    if not info:
        return jsonify({'error': 'Disease not found'}), 404
    return jsonify(info), 200

# Consultation Routes

@app.route('/api/consultations', methods=['GET', 'POST'])
@jwt_required()
def consultations():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if request.method == 'GET':
            if user.is_doctor:
                # Get consultations for doctor
                consults = Consultation.query.filter_by(doctor_id=user_id).order_by(Consultation.created_at.desc()).all()
            else:
                # Get consultations for patient
                consults = Consultation.query.filter_by(patient_id=user_id).order_by(Consultation.created_at.desc()).all()
            
            result = []
            for consult in consults:
                result.append({
                    'id': consult.id,
                    'patient_name': consult.patient.full_name or consult.patient.username,
                    'doctor_name': consult.doctor.full_name if consult.doctor else 'Not assigned',
                    'status': consult.status,
                    'symptoms': consult.symptoms,
                    'appointment_date': consult.appointment_date.isoformat() if consult.appointment_date else None,
                    'created_at': consult.created_at.isoformat()
                })
            
            return jsonify(result), 200
        
        elif request.method == 'POST':
            data = request.get_json()
            
            consultation = Consultation(
                patient_id=user_id,
                prediction_id=data.get('prediction_id'),
                symptoms=data.get('symptoms'),
                doctor_id=data.get('doctor_id')
            )
            
            db.session.add(consultation)
            db.session.commit()
            
            return jsonify({
                'message': 'Consultation request created successfully',
                'consultation_id': consultation.id
            }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/consultations/<int:consultation_id>', methods=['GET', 'PUT'])
@jwt_required()
def consultation_detail(consultation_id):
    try:
        user_id = int(get_jwt_identity())
        consultation = Consultation.query.get(consultation_id)
        
        if not consultation:
            return jsonify({'error': 'Consultation not found'}), 404
        
        # Check authorization
        if consultation.patient_id != user_id and consultation.doctor_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        if request.method == 'GET':
            result = {
                'id': consultation.id,
                'patient': {
                    'id': consultation.patient.id,
                    'name': consultation.patient.full_name or consultation.patient.username,
                    'email': consultation.patient.email
                },
                'doctor': {
                    'id': consultation.doctor.id,
                    'name': consultation.doctor.full_name,
                    'specialization': consultation.doctor.specialization
                } if consultation.doctor else None,
                'status': consultation.status,
                'symptoms': consultation.symptoms,
                'doctor_notes': consultation.doctor_notes,
                'prescription': consultation.prescription,
                'appointment_date': consultation.appointment_date.isoformat() if consultation.appointment_date else None,
                'created_at': consultation.created_at.isoformat(),
                'updated_at': consultation.updated_at.isoformat()
            }
            
            if consultation.prediction:
                result['prediction'] = {
                    'id': consultation.prediction.id,
                    'predicted_class': consultation.prediction.predicted_class,
                    'confidence': consultation.prediction.confidence
                }
            
            return jsonify(result), 200
        
        elif request.method == 'PUT':
            data = request.get_json()
            user = User.query.get(user_id)
            
            # Update consultation
            if user.is_doctor and consultation.doctor_id == user_id:
                if data.get('status'):
                    consultation.status = data['status']
                if data.get('doctor_notes'):
                    consultation.doctor_notes = data['doctor_notes']
                if data.get('prescription'):
                    consultation.prescription = data['prescription']
                if data.get('appointment_date'):
                    consultation.appointment_date = datetime.fromisoformat(data['appointment_date'])
            else:
                if data.get('symptoms'):
                    consultation.symptoms = data['symptoms']
            
            db.session.commit()
            
            return jsonify({'message': 'Consultation updated successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctors', methods=['GET'])
@jwt_required()
def get_doctors():
    try:
        doctors = User.query.filter_by(is_doctor=True).all()
        
        result = []
        for doctor in doctors:
            result.append({
                'id': doctor.id,
                'name': doctor.full_name or doctor.username,
                'specialization': doctor.specialization,
                'email': doctor.email
            })
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Medical Chatbot Route
@app.route('/api/chat', methods=['POST'])
@jwt_required()
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Medical-only system prompt
        system_prompt = """You are a professional medical assistant specializing in dermatology and skin health. 

STRICT RULES:
1. ONLY answer questions related to:
   - Skin conditions, diseases, and disorders
   - Dermatology and skin health
   - Symptoms, causes, treatments of skin issues
   - Skin care advice and prevention
   - Medical prescriptions and medications for skin
   
2. If the question is NOT about medical/skin topics, respond EXACTLY with:
   "I'm a medical assistant specialized in skin health. I can only answer questions about skin conditions, symptoms, and treatments. Please ask a skin-related question."

3. For SHORT questions like "medicine", "treatment", "cure" - assume they are follow-up questions about skin conditions and provide relevant information about medications/treatments for common skin conditions.

4. Always include a disclaimer: "This is general medical information. Please consult a dermatologist for proper diagnosis and treatment."

5. Be professional, accurate, and helpful.
6. Keep responses concise but informative (2-4 paragraphs max).
7. Never provide information on non-medical topics like weather, jokes, recipes, etc.

Now answer the user's question:"""

        # Check if question is medical-related (improved keyword filter)
        medical_keywords = [
            'skin', 'rash', 'acne', 'mole', 'lesion', 'melanoma', 'cancer', 'dermatitis',
            'eczema', 'psoriasis', 'treatment', 'symptom', 'disease', 'condition', 'itching',
            'burning', 'prescription', 'medication', 'doctor', 'dermatologist', 'diagnosis',
            'keratosis', 'nevus', 'carcinoma', 'biopsy', 'sunscreen', 'uv', 'pigmentation',
            'medicine', 'drug', 'cream', 'ointment', 'therapy', 'cure', 'heal', 'remedy',
            'dose', 'tablet', 'pill', 'antibiotic', 'steroid', 'lotion', 'gel', 'apply'
        ]
        
        # Also allow short follow-up medical terms
        short_medical_terms = ['medicine', 'treatment', 'cure', 'drug', 'cream', 'remedy', 'dose']
        
        is_medical = any(keyword in user_message.lower() for keyword in medical_keywords)
        is_short_medical = any(term == user_message.lower().strip() for term in short_medical_terms)
        
        if not is_medical and not is_short_medical:
            # Check if it's clearly non-medical
            non_medical_keywords = [
                'weather', 'joke', 'recipe', 'movie', 'music', 'sport', 'game',
                'politics', 'news', 'stock', 'math', 'calculate', 'translate', 'hello', 'hi'
            ]
            if any(keyword in user_message.lower() for keyword in non_medical_keywords):
                return jsonify({
                    'response': "I'm a medical assistant specialized in skin health. I can only answer questions about skin conditions, symptoms, and treatments. Please ask a skin-related question.",
                    'is_medical': False
                }), 200
        
        # Call Ollama API
        response = ollama.chat(
            model='llama3.2',
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_message}
            ]
        )
        
        bot_response = response['message']['content']
        
        # Add disclaimer if not already present
        if 'consult' not in bot_response.lower() and 'disclaimer' not in bot_response.lower():
            bot_response += "\n\n⚕️ Disclaimer: This is general medical information. Please consult a dermatologist for proper diagnosis and treatment."
        
        return jsonify({
            'response': bot_response,
            'is_medical': True
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Chat error: {str(e)}'}), 500

# Error handlers

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
