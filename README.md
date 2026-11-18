# Health Diagnosis: Multi-Modal Medical AI Diagnostic Platform

An advanced clinical decision-support and computer-aided diagnosis (CAD) platform integrating state-of-the-art Deep Learning and Computer Vision architectures across **Cranial Oncology (Brain MRI)**, **Retinal Pathology (Eye Fundus)**, and **Skeletal Radiography (Bone Fractures)**.

---

## 🌟 Clinical AI Diagnostic Suites

### 1. 🧠 NeuroScan AI — Brain Tumor MRI Detection & Classification
* **Architecture**: EfficientNet-B0 (PyTorch / timm transfer learning)
* **Target Classes (4 Categories)**:
  - `Glioma` (Astrocytoma / Oligodendroglioma)
  - `Meningioma` (Dural Base Neoplasm)
  - `Pituitary Adenoma` (Sellar / Parasellar Mass)
  - `Healthy / Normal` (Intact Parenchyma)
* **Features**: Automated MRI preprocessing (224x224), softmax calibrated probability breakdown, safety confidence gating, and clinical neuro-oncology report generation.

### 2. 👁️ OphthaScan AI — Eye Disease Retinal Diagnostics
* **Architecture**: Deep Convolutional Neural Network (VGG-16 / Keras)
* **Target Categories (4 Conditions)**:
  - `Cataracts` (Lens Opacification)
  - `Glaucoma` (Optic Neuropathy & Cupping)
  - `Diabetic Retinopathy` (Microvascular Exudates / Hemorrhages)
  - `Normal Retinal Fundus` (Healthy Macula & Vasculature)
* **Features**: Color fundus analysis, low-confidence anomaly rejection, disease pathology overview, and automated clinical impression summaries.

### 3. 🦴 OsteoVision AI — Bone Fracture Radiography Detection
* **Architectures**: Multi-Model Suite with YOLOv8 Object Detection, Faster R-CNN (ResNet-50 Backbone), and SSD (VGG-16)
* **Target Anatomical Regions (7 Clinical Categories)**:
  - `Elbow Joint Fracture` (Olecranon / Supracondylar)
  - `Phalangeal Finger Fracture`
  - `Forearm Fracture` (Radius & Ulna Diaphysis)
  - `Humerus Mid-Shaft Fracture`
  - `Normal Humerus` (Intact Anatomy)
  - `Shoulder Fracture` (Clavicle / Proximal Humerus)
  - `Wrist Fracture` (Distal Radius / Colles' Fracture)
* **Features**: Real-time cortical discontinuity detection, bounding box localization, dynamic confidence threshold slider (0.00 – 1.00), and radiology report export.

---

## 🔐 Authentication & Clinical Security
* **Google OAuth2 Authentication**: One-click "Sign in with Google" and "Sign up with Google" powered by OAuth2 tokens.
* **Credential Authentication**: User & Doctor role registration with encrypted password hashing (Bcrypt).
* **JWT Access Management**: Stateless token authentication with role-based clinical permissions.

---

## 🏗️ Technology Architecture

### Backend & Machine Learning
* **Framework**: Python Flask API & FastAPI
* **Deep Learning Frameworks**: PyTorch, Torchvision, TensorFlow / Keras, timm, Ultralytics YOLO
* **Computer Vision**: OpenCV (`cv2`), PIL (`Pillow`), NumPy, Matplotlib
* **Database**: SQLite with SQLAlchemy ORM (`health_diagnosis.db`)
* **Security**: Flask-JWT-Extended, Flask-Bcrypt, CORS

### Frontend
* **Framework**: React 18
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Routing**: React Router v6
* **Client**: Axios with JWT interceptors
* **PDF Export**: jsPDF & jsPDF-AutoTable

---

## 📓 Jupyter Notebooks (`notebooks/`)

The repository includes ready-to-run Jupyter Notebooks:
1. `notebooks/1_Brain_Tumor_Detection_EfficientNet_B0.ipynb`: Brain MRI training, transfer learning, and evaluation pipeline.
2. `notebooks/2_Eye_Disease_Detection_VGG16.ipynb`: Retinal disease dataset training and classification.
3. `notebooks/3_Bone_Fracture_Faster_RCNN_ResNet.ipynb`: Faster R-CNN bone fracture detection with bounding boxes.
4. `notebooks/4_Bone_Fracture_VGG16_Transfer_Learning.ipynb`: VGG-16 transfer learning for radiographic classification.
5. `notebooks/5_Health_Diagnosis_MultiModal_Inference_Pipeline.ipynb`: Master multi-modal inference pipeline evaluating all 3 models.

---

## 🚀 Getting Started

### 1. Prerequisites
* Python 3.10+
* Node.js 18+ and npm
* Git

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/donthireddyharini/Health-Diagnosis.git
cd Health-Diagnosis

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask API Gateway
python app.py
```
*Backend runs on `http://localhost:5000`.*

### 3. Frontend Setup
```bash
cd frontend

# Install Node modules
npm install

# Start the React development server
npm start
```
*Frontend runs on `http://localhost:3000`.*

---

## 📄 License & Medical Disclaimer
This software is intended for educational, research, and computer-assisted decision support purposes. It is not an autonomous medical device. All clinical interpretations should be confirmed by certified medical professionals.
