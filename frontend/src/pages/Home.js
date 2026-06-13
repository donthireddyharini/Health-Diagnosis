import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Users, Zap, ArrowRight, CheckCircle } from 'lucide-react';

function Home({ user }) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              AI-Powered Skin Disease Detection
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Get instant, accurate skin disease diagnosis using advanced deep learning technology. 
              Connect with expert dermatologists for personalized care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/predict" className="inline-flex items-center justify-center bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition transform hover:scale-105 shadow-lg">
                  Start Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="inline-flex items-center justify-center bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition transform hover:scale-105 shadow-lg">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link to="/diseases" className="inline-flex items-center justify-center bg-primary-500 hover:bg-primary-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition transform hover:scale-105 shadow-lg">
                    Learn About Diseases
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose SkinCare AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced technology meets expert medical care for comprehensive skin health management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-gray-600">
                Get AI-powered diagnosis in seconds using state-of-the-art deep learning models
              </p>
            </div>

            <div className="card text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Activity className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">9 Disease Types</h3>
              <p className="text-gray-600">
                Trained on ISIC dataset to detect melanoma, carcinomas, and other skin conditions
              </p>
            </div>

            <div className="card text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Consultation</h3>
              <p className="text-gray-600">
                Connect with certified dermatologists for professional medical advice
              </p>
            </div>

            <div className="card text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your health data is encrypted and protected with industry-standard security
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, fast, and accurate skin disease detection in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Image</h3>
              <p className="text-gray-600">
                Take a clear photo of the affected skin area and upload it to our secure platform
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our advanced CNN model analyzes the image and provides instant diagnosis with confidence scores
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Treatment</h3>
              <p className="text-gray-600">
                View detailed disease information, prevention tips, and consult with expert dermatologists
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Diseases Covered */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Diseases We Detect
            </h2>
            <p className="text-xl text-gray-600">
              Trained on the ISIC dataset to identify 9 common skin conditions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Melanoma',
              'Basal Cell Carcinoma',
              'Squamous Cell Carcinoma',
              'Actinic Keratosis',
              'Seborrheic Keratosis',
              'Nevus (Mole)',
              'Dermatofibroma',
              'Vascular Lesion',
              'Pigmented Benign Keratosis'
            ].map((disease, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-primary-50 transition">
                <CheckCircle className="h-6 w-6 text-primary-600 flex-shrink-0" />
                <span className="text-gray-800 font-medium">{disease}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/diseases" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-lg">
              Learn more about each disease
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Take Control of Your Skin Health?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of users who trust SkinCare AI for accurate skin disease detection
          </p>
          {!user && (
            <Link to="/register" className="inline-flex items-center bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition transform hover:scale-105 shadow-lg">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="h-6 w-6 text-primary-500" />
                <span className="text-xl font-bold text-white">SkinCare AI</span>
              </div>
              <p className="text-gray-400">
                Advanced AI-powered skin disease detection and expert consultation platform.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/diseases" className="hover:text-primary-400 transition">Diseases</Link></li>
                <li><Link to="/login" className="hover:text-primary-400 transition">Login</Link></li>
                <li><Link to="/register" className="hover:text-primary-400 transition">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Disclaimer</h3>
              <p className="text-gray-400 text-sm">
                This tool is for educational purposes. Always consult with a qualified healthcare professional for medical advice.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SkinCare AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
