"""
System Monitoring Script - Checks if all services are running properly
"""
import requests
import time
import json

def check_service(name, url, timeout=5):
    """Check if a service is responding"""
    try:
        response = requests.get(url, timeout=timeout)
        return True, response.status_code
    except requests.exceptions.ConnectionError:
        return False, "Connection refused"
    except requests.exceptions.Timeout:
        return False, "Timeout"
    except Exception as e:
        return False, str(e)

def check_api_endpoint(endpoint, expected_status=200):
    """Check specific API endpoint"""
    try:
        response = requests.get(f"http://localhost:5000{endpoint}", timeout=5)
        return response.status_code == expected_status, response.status_code
    except:
        return False, "Error"

print("="*80)
print(" "*25 + "SYSTEM HEALTH CHECK")
print("="*80)
print()

# Check Backend
print("🔧 Backend Service (Flask)")
print("-"*80)
is_running, status = check_service("Backend", "http://localhost:5000/")
if is_running:
    print(f"   ✅ Status: RUNNING (HTTP {status})")
    
    # Check API endpoints
    print(f"   📡 API Endpoints:")
    
    endpoints = [
        ("/api/diseases", 200, "Disease Information"),
        ("/api/doctors", 422, "Doctors List (requires auth)"),
    ]
    
    for endpoint, expected, description in endpoints:
        is_ok, status = check_api_endpoint(endpoint, expected)
        status_icon = "✅" if is_ok else "❌"
        print(f"      {status_icon} {description}: HTTP {status}")
    
    # Check model
    try:
        response = requests.get("http://localhost:5000/api/diseases", timeout=5)
        if response.status_code == 200:
            diseases = response.json()
            print(f"   🤖 AI Model: LOADED ({len(diseases)} diseases)")
        else:
            print(f"   ⚠️  AI Model: Status unclear")
    except:
        print(f"   ❌ AI Model: Cannot verify")
else:
    print(f"   ❌ Status: NOT RUNNING ({status})")
    print(f"   💡 Start with: py app.py")
print()

# Check Frontend
print("🌐 Frontend Service (React)")
print("-"*80)
is_running, status = check_service("Frontend", "http://localhost:3000/", timeout=10)
if is_running:
    print(f"   ✅ Status: RUNNING (HTTP {status})")
    print(f"   🌍 Access at: http://localhost:3000")
else:
    print(f"   ❌ Status: NOT RUNNING ({status})")
    print(f"   💡 Start with: cd frontend && npm start")
print()

# Check Database
print("💾 Database")
print("-"*80)
import os
db_path = "skin_disease.db"
if os.path.exists(db_path):
    db_size = os.path.getsize(db_path)
    print(f"   ✅ Database file exists")
    print(f"   📊 Size: {db_size:,} bytes ({db_size/1024:.1f} KB)")
else:
    print(f"   ⚠️  Database file not found (will be created on first run)")
print()

# Check Model Files
print("🤖 AI Model Files")
print("-"*80)
model_files = [
    "models/skin_disease_model_final.keras",
    "models/class_indices.json"
]

all_models_exist = True
for model_file in model_files:
    if os.path.exists(model_file):
        size = os.path.getsize(model_file)
        print(f"   ✅ {model_file}: {size:,} bytes ({size/1024/1024:.1f} MB)")
    else:
        print(f"   ❌ {model_file}: NOT FOUND")
        all_models_exist = False

if all_models_exist:
    print(f"   ✅ All model files present")
else:
    print(f"   ⚠️  Run 'py train_model.py' to train the model")
print()

# Overall Status
print("="*80)
print(" "*28 + "OVERALL STATUS")
print("="*80)

backend_ok, _ = check_service("Backend", "http://localhost:5000/")
frontend_ok, _ = check_service("Frontend", "http://localhost:3000/", timeout=10)

if backend_ok and frontend_ok and all_models_exist:
    print()
    print("   🎉 ALL SYSTEMS OPERATIONAL!")
    print()
    print("   🌐 Application URLs:")
    print("      • Frontend: http://localhost:3000")
    print("      • Backend:  http://localhost:5000")
    print("      • API Docs: http://localhost:5000/api/diseases")
    print()
    print("   ✅ Ready to use!")
    print()
elif backend_ok and all_models_exist:
    print()
    print("   ⚠️  Backend is running, but frontend is not")
    print()
    print("   💡 Start frontend:")
    print("      cd frontend")
    print("      npm start")
    print()
elif all_models_exist:
    print()
    print("   ⚠️  Services are not running")
    print()
    print("   💡 Start services:")
    print("      1. Backend:  py app.py")
    print("      2. Frontend: cd frontend && npm start")
    print()
else:
    print()
    print("   ❌ System not ready")
    print()
    print("   💡 Setup required:")
    if not all_models_exist:
        print("      1. Train model: py train_model.py")
    if not backend_ok:
        print("      2. Start backend: py app.py")
    if not frontend_ok:
        print("      3. Start frontend: cd frontend && npm start")
    print()

print("="*80)
print()
print("📊 Run this script anytime to check system status")
print("="*80)
