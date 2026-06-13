import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPrediction } from '../api';
import { ArrowLeft, Calendar, TrendingUp, AlertTriangle, Shield, Activity, MessageSquare } from 'lucide-react';

function PredictionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrediction();
  }, [id]);

  const loadPrediction = async () => {
    try {
      const response = await getPrediction(id);
      setPrediction(response.data);
    } catch (error) {
      console.error('Error loading prediction:', error);
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

  if (!prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Prediction not found</p>
          <Link to="/history" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  const diseaseInfo = prediction.disease_info;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/history')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to History
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Analyzed Image</h2>
              <img
                src={`http://localhost:5000${prediction.image_url}`}
                alt="Skin condition"
                className="w-full rounded-lg shadow-md"
              />
            </div>

            {/* Prediction Info */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis Info</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(prediction.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Confidence</span>
                  <span className="font-bold text-primary-600">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${prediction.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <Link
                to="/consultations"
                state={{ predictionId: prediction.id }}
                className="w-full btn-primary flex items-center justify-center"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Consult a Doctor
              </Link>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Diagnosis */}
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-primary-700 font-medium mb-2">Detected Condition</p>
                  <h1 className="text-3xl font-bold text-gray-900 capitalize mb-2">
                    {diseaseInfo?.name || prediction.predicted_class.replace(/_/g, ' ')}
                  </h1>
                  {diseaseInfo && (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      diseaseInfo.severity.includes('High') ? 'bg-red-100 text-red-800' :
                      diseaseInfo.severity.includes('Moderate') ? 'bg-amber-100 text-amber-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {diseaseInfo.severity}
                    </span>
                  )}
                </div>
                <Activity className="h-12 w-12 text-primary-600" />
              </div>
            </div>

            {/* Medical Alert */}
            {diseaseInfo?.requires_doctor && (
              <div className="card bg-amber-50 border-2 border-amber-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-6 w-6 text-amber-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-amber-900 mb-1">Medical Attention Required</h3>
                    <p className="text-amber-800">{diseaseInfo.urgency}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {diseaseInfo && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{diseaseInfo.description}</p>
              </div>
            )}

            {/* Symptoms */}
            {diseaseInfo?.symptoms && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-6 w-6 text-primary-600 mr-2" />
                  Symptoms
                </h2>
                <ul className="space-y-2">
                  {diseaseInfo.symptoms.map((symptom, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span className="text-gray-700">{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Causes */}
            {diseaseInfo?.causes && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600 mr-2" />
                  Causes & Risk Factors
                </h2>
                <ul className="space-y-2">
                  {diseaseInfo.causes.map((cause, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span className="text-gray-700">{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prevention */}
            {diseaseInfo?.prevention && (
              <div className="card bg-green-50">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-green-600 mr-2" />
                  Prevention Tips
                </h2>
                <ul className="space-y-2">
                  {diseaseInfo.prevention.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Treatment */}
            {diseaseInfo?.treatment && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                  Treatment Options
                </h2>
                <ul className="space-y-2">
                  {diseaseInfo.treatment.map((treatment, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">→</span>
                      <span className="text-gray-700">{treatment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* All Predictions */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">All Predictions</h2>
              <div className="space-y-3">
                {Object.entries(prediction.all_predictions)
                  .sort(([, a], [, b]) => b - a)
                  .map(([disease, confidence]) => (
                    <div key={disease}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {disease.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {(confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            disease === prediction.predicted_class ? 'bg-primary-600' : 'bg-gray-400'
                          }`}
                          style={{ width: `${confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="card bg-gray-100 border border-gray-300">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Medical Disclaimer:</strong> This AI-powered analysis is for informational and educational purposes only. 
                It should not be used as a substitute for professional medical advice, diagnosis, or treatment. 
                Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictionDetail;
