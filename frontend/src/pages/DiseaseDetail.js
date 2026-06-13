import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDisease } from '../api';
import { ArrowLeft, AlertTriangle, Shield, Activity, TrendingUp, Info } from 'lucide-react';

function DiseaseDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisease();
  }, [name]);

  const loadDisease = async () => {
    try {
      const response = await getDisease(name);
      setDisease(response.data);
    } catch (error) {
      console.error('Error loading disease:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (!disease) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Disease information not found</p>
          <Link to="/diseases" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to Diseases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/diseases')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to All Diseases
        </button>

        {/* Header */}
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">{disease.name}</h1>
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  disease.severity.includes('High') ? 'bg-red-100 text-red-800' :
                  disease.severity.includes('Moderate') ? 'bg-amber-100 text-amber-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {disease.severity}
                </span>
                {disease.requires_doctor && (
                  <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                    Medical Attention Required
                  </span>
                )}
              </div>
            </div>
            <Activity className="h-16 w-16 text-white opacity-50" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Info */}
            <div className="card bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                Quick Info
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Severity Level</p>
                  <p className="font-semibold text-gray-900">{disease.severity}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Medical Attention</p>
                  <p className="font-semibold text-gray-900">
                    {disease.requires_doctor ? 'Required' : 'Optional'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Urgency</p>
                  <p className="font-semibold text-gray-900">{disease.urgency}</p>
                </div>
              </div>
            </div>

            {/* Medical Alert */}
            {disease.requires_doctor && (
              <div className="card bg-amber-50 border-2 border-amber-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-amber-900 mb-2">Important</h3>
                    <p className="text-amber-800 text-sm">
                      This condition requires professional medical evaluation. 
                      Please consult with a dermatologist for proper diagnosis and treatment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <h3 className="font-bold mb-3">Get AI Analysis</h3>
              <p className="text-primary-100 text-sm mb-4">
                Upload an image to get instant AI-powered diagnosis
              </p>
              <Link to="/predict" className="block w-full bg-white text-primary-600 hover:bg-gray-100 text-center py-3 rounded-lg font-semibold transition">
                Analyze Now
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What is {disease.name}?</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{disease.description}</p>
            </div>

            {/* Symptoms */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="h-7 w-7 text-primary-600 mr-3" />
                Symptoms & Signs
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {disease.symptoms.map((symptom, index) => (
                  <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <span className="text-primary-600 mr-2 mt-1">•</span>
                    <span className="text-gray-700">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Causes */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-7 w-7 text-amber-600 mr-3" />
                Causes & Risk Factors
              </h2>
              <div className="space-y-3">
                {disease.causes.map((cause, index) => (
                  <div key={index} className="flex items-start p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <span className="text-amber-600 mr-2 mt-1">▸</span>
                    <span className="text-gray-700">{cause}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prevention */}
            <div className="card bg-green-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-7 w-7 text-green-600 mr-3" />
                Prevention & Protection
              </h2>
              <div className="space-y-3">
                {disease.prevention.map((tip, index) => (
                  <div key={index} className="flex items-start p-3 bg-white rounded-lg border border-green-200">
                    <span className="text-green-600 mr-2 mt-1 font-bold">✓</span>
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-7 w-7 text-blue-600 mr-3" />
                Treatment Options
              </h2>
              <div className="space-y-3">
                {disease.treatment.map((treatment, index) => (
                  <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-blue-600 mr-2 mt-1">→</span>
                    <span className="text-gray-700">{treatment}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Note:</strong> Treatment should always be determined by a qualified healthcare professional 
                  based on individual circumstances. Never self-medicate.
                </p>
              </div>
            </div>

            {/* Consult Doctor CTA */}
            <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Need Professional Advice?</h3>
                  <p className="text-primary-100">Connect with certified dermatologists for personalized care</p>
                </div>
                <Link
                  to="/consultations"
                  className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap"
                >
                  Consult Now
                </Link>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="card bg-gray-100 border border-gray-300">
              <h3 className="font-bold text-gray-900 mb-2">Medical Disclaimer</h3>
              <p className="text-sm text-gray-700">
                This information is provided for educational purposes only and is not intended to be a substitute 
                for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician 
                or other qualified health provider with any questions you may have regarding a medical condition. 
                Never disregard professional medical advice or delay in seeking it because of something you have 
                read on this website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiseaseDetail;
