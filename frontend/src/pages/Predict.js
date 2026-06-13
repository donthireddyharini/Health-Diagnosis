import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predict } from '../api';
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle, Loader } from 'lucide-react';

function Predict() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 16 * 1024 * 1024) {
        setError('File size must be less than 16MB');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      console.log('Sending prediction request...');
      console.log('File:', selectedFile.name, selectedFile.type, selectedFile.size);
      
      const response = await predict(formData);
      console.log('Prediction response:', response.data);
      setResult(response.data);
    } catch (err) {
      console.error('Prediction error:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.error || err.response?.data?.msg || 'Prediction failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity.includes('High') || severity.includes('Life-Threatening')) {
      return 'text-red-600 bg-red-100';
    } else if (severity.includes('Moderate')) {
      return 'text-amber-600 bg-amber-100';
    } else {
      return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Skin Disease Analysis</h1>
          <p className="text-gray-600 mt-2">Upload an image for AI-powered diagnosis</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Image</h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block w-full">
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                    preview ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                  }`}>
                    {preview ? (
                      <div>
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg shadow-md mb-4"
                        />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-700 font-medium mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, JPEG up to 16MB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-amber-900 mb-2">⚠️ Important Limitation:</h3>
                <p className="text-sm text-amber-800 mb-2">
                  This model was trained ONLY on diseased skin. It cannot identify "normal/healthy" skin.
                </p>
                <p className="text-sm text-amber-800 font-semibold">
                  Low confidence (&lt;50%) often means normal skin or unclear image.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Tips for best results:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure good lighting</li>
                  <li>• Keep the camera steady</li>
                  <li>• Focus on the affected area</li>
                  <li>• Avoid shadows and reflections</li>
                  <li>• Take photo from a close distance</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={!selectedFile || loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Analyze Image
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis Results</h2>

            {!result ? (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Upload an image to see results</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Uncertainty Warning */}
                {result.is_uncertain && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-blue-900 mb-2">⚕️ Possible Normal Skin Detected</p>
                        <p className="text-blue-800 text-sm mb-2">{result.warning}</p>
                        <p className="text-blue-700 text-sm italic">{result.suggestion}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confidence Interpretation */}
                {result.confidence < 0.50 && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-900 mb-1">✅ Low Confidence - Likely Normal Skin</p>
                        <p className="text-green-800 text-sm">
                          The model's confidence is below 50%, which typically indicates normal, healthy skin or an unclear image. 
                          The prediction shown is just the "closest match" from the diseases it was trained on.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Prediction */}
                <div className={`rounded-lg p-6 ${
                  result.confidence < 0.50 ? 'bg-gray-50 border-2 border-gray-300' :
                  result.confidence < 0.70 ? 'bg-yellow-50 border-2 border-yellow-300' :
                  'bg-gradient-to-br from-primary-50 to-primary-100'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium mb-1" style={{
                        color: result.confidence < 0.50 ? '#666' : 
                               result.confidence < 0.70 ? '#b45309' : '#1e40af'
                      }}>
                        {result.confidence < 0.50 ? 'Low Confidence (Likely Normal)' :
                         result.confidence < 0.70 ? 'Moderate Confidence' :
                         'High Confidence Detection'}
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 capitalize">
                        {result.predicted_class.replace(/_/g, ' ')}
                      </h3>
                      {result.confidence < 0.50 && (
                        <p className="text-sm text-gray-600 mt-1">
                          (Closest match from training data)
                        </p>
                      )}
                    </div>
                    <CheckCircle className={`h-8 w-8 ${
                      result.confidence < 0.50 ? 'text-gray-400' :
                      result.confidence < 0.70 ? 'text-yellow-500' :
                      'text-primary-600'
                    }`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Confidence Level</span>
                    <span className={`text-lg font-bold ${
                      result.confidence < 0.50 ? 'text-gray-600' :
                      result.confidence < 0.70 ? 'text-yellow-700' :
                      'text-primary-700'
                    }`}>
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        result.confidence < 0.50 ? 'bg-gray-400' :
                        result.confidence < 0.70 ? 'bg-yellow-500' :
                        'bg-primary-600'
                      }`}
                      style={{ width: `${result.confidence * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Confidence Guide */}
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-xs text-gray-600 font-semibold mb-2">Confidence Guide:</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>• <strong>&gt;70%:</strong> Strong match - consult a doctor</p>
                      <p>• <strong>50-70%:</strong> Moderate match - monitor and seek advice if concerned</p>
                      <p>• <strong>&lt;50%:</strong> Weak match - likely normal skin or unclear image</p>
                    </div>
                  </div>
                </div>

                {/* Disease Info */}
                {result.disease_info && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Disease Information</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(result.disease_info.severity)}`}>
                        {result.disease_info.severity}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">{result.disease_info.description}</p>

                    {result.disease_info.requires_doctor && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-amber-900 font-semibold mb-1">⚠️ Medical Attention Required</p>
                        <p className="text-amber-800 text-sm">{result.disease_info.urgency}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <button
                        onClick={() => navigate(`/predictions/${result.prediction_id}`)}
                        className="w-full btn-primary"
                      >
                        View Full Details
                      </button>
                      <button
                        onClick={() => navigate('/consultations', { state: { predictionId: result.prediction_id } })}
                        className="w-full btn-secondary"
                      >
                        Consult a Doctor
                      </button>
                    </div>
                  </div>
                )}

                {/* All Predictions */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Other Possibilities</h4>
                  <div className="space-y-2">
                    {Object.entries(result.all_predictions)
                      .sort(([, a], [, b]) => b - a)
                      .slice(1, 4)
                      .map(([disease, confidence]) => (
                        <div key={disease} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700 capitalize">
                            {disease.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {(confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600">
                    <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. 
                    Always consult with a qualified healthcare provider for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Predict;
