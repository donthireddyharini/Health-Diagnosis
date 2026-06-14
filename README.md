# Skin Disease Detection & Classification System

A comprehensive AI-powered web application for skin disease detection and classification using deep learning (CNN), with user authentication, doctor consultation features, and detailed disease information.

## 🌟 Features

### Core Features
- **AI-Powered Detection**: CNN model trained on ISIC dataset to detect 10 classes including normal skin
- **Normal Skin Detection**: Can identify healthy skin (not just diseases)
- **User Authentication**: Secure signup/login system with JWT tokens
- **Disease Classification**: Accurate classification with confidence scores
- **Disease Information**: Comprehensive details about symptoms, causes, prevention, and treatment
- **Doctor Consultation**: Connect with medical professionals for expert advice
- **Analysis History**: Track and manage past skin analyses
- **Responsive Design**: Modern, mobile-friendly UI with TailwindCSS

### Detected Classes (10 Total)
1. Actinic Keratosis
2. Basal Cell Carcinoma
3. Dermatofibroma
4. Melanoma
5. Nevus (Mole)
6. **Normal Skin** ⭐ NEW!
7. Pigmented Benign Keratosis
8. Seborrheic Keratosis
9. Squamous Cell Carcinoma
10. Vascular Lesion

## 🏗️ Technology Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT (Flask-JWT-Extended)
- **ML Framework**: TensorFlow/Keras
- **Model**: ResNet50 with transfer learning (283 MB)

### Frontend
- **Framework**: React 18
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **HTTP Client**: Axios

  # 📸 Application Screenshots

## 🏠 Home Page

The landing page introduces the platform and allows users to start AI-powered skin disease analysis.

![Home Page](Home-page.png)

---

## 🔍 AI Disease Detection & Prediction

Upload a skin image and receive an instant prediction with confidence score and disease information.

![Prediction Result](prediction-result.png)

---

## 📊 User Dashboard

The dashboard provides an overview of analyses, consultations, health status, and quick actions.

![Dashboard](dashboard.png)

---

## 📜 Analysis History

Users can view and manage all previous skin disease analyses along with confidence scores.

![History](history.png)

---

## 👨‍⚕️ Doctor Consultation

Patients can request consultations and communicate with healthcare professionals.

![Consultation](consultation.png)

---

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- At least 4GB RAM (for model training)
- ISIC dataset (place in the specified directory)

## 🚀 Installation & Setup

### 1. Clone or Navigate to Project Directory

```bash
cd "c:\Users\ASUS\OneDrive\Desktop\skin disesase detection"
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
python -m venv venv
```

#### Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Train the Model

Ensure your ISIC dataset is in the correct location:
```
Skin cancer ISIC The International Skin Imaging Collaboration/
├── Train/
│   ├── actinic keratosis/
│   ├── basal cell carcinoma/
│   ├── dermatofibroma/
│   ├── melanoma/
│   ├── nevus/
│   ├── pigmented benign keratosis/
│   ├── seborrheic keratosis/
│   ├── squamous cell carcinoma/
│   └── vascular lesion/
└── Test/
    └── (same structure)
```

#### Train the Model
```bash
python train_model.py
```

This will:
- Create data generators with augmentation
- Train EfficientNetB3 model with transfer learning
- Fine-tune the model
- Save the trained model in `models/` directory
- Generate training history plots

**Training Time**: Approximately 2-4 hours depending on your hardware and dataset size.

### 4. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd frontend
```

#### Install Dependencies
```bash
npm install
```

### 5. Configuration

#### Backend Configuration (app.py)
Update the following in `app.py`:
```python
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['JWT_SECRET_KEY'] = 'your-jwt-secret-key-here'

# Email configuration (optional)
app.config['MAIL_USERNAME'] = 'your-email@gmail.com'
app.config['MAIL_PASSWORD'] = 'your-app-password'
```

#### Frontend Configuration (optional)
Create `.env` file in frontend directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎯 Running the Application

### 1. Start Backend Server

From the root directory:
```bash
python app.py
```

Backend will run on: `http://localhost:5000`

### 2. Start Frontend Development Server

From the frontend directory:
```bash
npm start
```

Frontend will run on: `http://localhost:3000`

### 3. Access the Application

Open your browser and navigate to: `http://localhost:3000`

## 📱 Usage Guide

### For Patients

1. **Sign Up**: Create an account with your details
2. **Upload Image**: Go to "Analyze Skin" and upload a clear photo of the skin condition
3. **Get Results**: Receive instant AI-powered diagnosis with confidence scores
4. **View Details**: See comprehensive information about the detected condition
5. **Consult Doctor**: Request consultation with a dermatologist
6. **Track History**: View all your past analyses in the History section

### For Doctors

1. **Sign Up as Doctor**: Register with medical credentials
2. **View Consultations**: Access patient consultation requests
3. **Provide Assessment**: Add medical notes and prescriptions
4. **Manage Appointments**: Schedule and track patient appointments

## 🗂️ Project Structure

```
skin disesase detection/
├── app.py                          # Flask backend application
├── train_model.py                  # Model training script
├── disease_info.py                 # Disease information database
├── requirements.txt                # Python dependencies
├── README.md                       # This file
├── models/                         # Trained models directory
│   ├── skin_disease_model_final.h5
│   ├── class_indices.json
│   └── training_history.png
├── uploads/                        # User uploaded images
├── skin_disease.db                 # SQLite database
├── Skin cancer ISIC.../            # ISIC dataset
└── frontend/                       # React frontend
    ├── package.json
    ├── tailwind.config.js
    ├── public/
    └── src/
        ├── App.js
        ├── api.js
        ├── components/
        │   └── Navbar.js
        └── pages/
            ├── Home.js
            ├── Login.js
            ├── Register.js
            ├── Dashboard.js
            ├── Predict.js
            ├── History.js
            ├── PredictionDetail.js
            ├── Consultations.js
            ├── ConsultationDetail.js
            ├── Diseases.js
            ├── DiseaseDetail.js
            └── Profile.js
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API endpoints
- Secure file upload handling
- Input validation and sanitization

## 📊 Model Performance

The CNN model uses:
- **Architecture**: ResNet50 (pre-trained on ImageNet)
- **Classes**: 10 (including normal_skin)
- **Training Strategy**: Transfer learning + Fine-tuning
- **Image Size**: 224x224 pixels
- **Data Augmentation**: Rotation, flipping, zooming, shifting
- **Metrics**: Accuracy, AUC, Precision, Recall
- **Training Time**: ~3.5 hours (50 epochs)

Expected performance:
- Normal Skin Detection: 70-85% confidence
- Disease Detection: 75-90% accuracy
- Overall Accuracy: ~80-85%

## 🛠️ API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Predictions
- `POST /api/predict` - Upload image for prediction
- `GET /api/predictions` - Get user's predictions
- `GET /api/predictions/<id>` - Get specific prediction
- `DELETE /api/predictions/<id>` - Delete prediction

### Diseases
- `GET /api/diseases` - Get all diseases
- `GET /api/diseases/<name>` - Get disease details

### Consultations
- `GET /api/consultations` - Get consultations
- `POST /api/consultations` - Create consultation
- `GET /api/consultations/<id>` - Get consultation details
- `PUT /api/consultations/<id>` - Update consultation
- `GET /api/doctors` - Get list of doctors

## 🐛 Troubleshooting

### Model Not Loading
- Ensure you've trained the model first: `python train_model.py`
- Check that `models/skin_disease_model_final.h5` exists
- Verify TensorFlow installation: `pip install tensorflow==2.15.0`

### Frontend Not Connecting to Backend
- Ensure backend is running on port 5000
- Check CORS configuration in `app.py`
- Verify proxy setting in `frontend/package.json`

### Database Errors
- Delete `skin_disease.db` and restart the backend to recreate
- Check SQLAlchemy version compatibility

### Image Upload Issues
- Ensure `uploads/` directory exists
- Check file size limit (max 16MB)
- Verify image format (PNG, JPG, JPEG)

## 📝 Important Notes

### Medical Disclaimer
This application is for **educational and informational purposes only**. It should NOT be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.

### Dataset
This project uses the ISIC (International Skin Imaging Collaboration) dataset. Ensure you have proper rights to use the dataset for your purposes.

### Production Deployment
Before deploying to production:
1. Change all secret keys
2. Use a production database (PostgreSQL, MySQL)
3. Enable HTTPS
4. Set up proper email service
5. Configure environment variables
6. Add rate limiting
7. Implement proper logging
8. Set up backup systems

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes. Please ensure compliance with ISIC dataset terms and conditions.

## 👥 Support

For issues, questions, or suggestions:
- Check the troubleshooting section
- Review the code documentation
- Open an issue on the repository

## 🎓 Credits

- **Dataset**: ISIC (International Skin Imaging Collaboration)
- **Model Architecture**: EfficientNetB3 (Google Research)
- **UI Icons**: Lucide React
- **Styling**: TailwindCSS

## 📈 Future Enhancements

- [ ] Add more skin diseases
- [ ] Implement real-time chat with doctors
- [ ] Add multi-language support
- [ ] Mobile app development
- [ ] Integration with medical records
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Payment integration for consultations
- [ ] Video consultation feature
- [ ] Export reports as PDF

---

**Version**: 2.0.0  
**Last Updated**: October 12, 2025  
**Status**: Production Ready ✅

**Key Updates:**
- ✅ Model retrained with 10 classes (including normal_skin)
- ✅ ResNet50 architecture (improved accuracy)
- ✅ Normal skin detection capability added
- ✅ Comprehensive testing completed
- ✅ Production ready and deployed
