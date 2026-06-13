import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDiseases } from '../api';
import { BookOpen, Search, AlertTriangle, Shield, Activity } from 'lucide-react';

function Diseases() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDiseases();
  }, []);

  const loadDiseases = async () => {
    try {
      const response = await getDiseases();
      setDiseases(response.data);
    } catch (error) {
      console.error('Error loading diseases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiseases = diseases.filter(disease =>
    disease.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityIcon = (severity) => {
    if (severity.includes('High') || severity.includes('Life-Threatening')) {
      return <AlertTriangle className="h-6 w-6 text-red-600" />;
    } else if (severity.includes('Moderate')) {
      return <Activity className="h-6 w-6 text-amber-600" />;
    } else {
      return <Shield className="h-6 w-6 text-green-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    if (severity.includes('High') || severity.includes('Life-Threatening')) {
      return 'border-red-200 hover:border-red-400 bg-gradient-to-br from-red-50 to-white';
    } else if (severity.includes('Moderate')) {
      return 'border-amber-200 hover:border-amber-400 bg-gradient-to-br from-amber-50 to-white';
    } else {
      return 'border-green-200 hover:border-green-400 bg-gradient-to-br from-green-50 to-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Skin Disease Encyclopedia</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn about different skin conditions, their symptoms, causes, prevention methods, and treatment options
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a disease..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Info Banner */}
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white mb-8">
          <div className="flex items-start">
            <Activity className="h-8 w-8 mr-4 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Detection</h3>
              <p className="text-primary-100">
                Our system is trained on the ISIC (International Skin Imaging Collaboration) dataset 
                to accurately detect and classify these 9 skin conditions. Upload an image to get instant AI analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Diseases Grid */}
        {filteredDiseases.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiseases.map((disease) => (
              <Link
                key={disease.key}
                to={`/diseases/${disease.key}`}
                className={`card border-2 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 ${getSeverityColor(disease.severity)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{disease.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      disease.severity.includes('High') ? 'bg-red-100 text-red-800' :
                      disease.severity.includes('Moderate') ? 'bg-amber-100 text-amber-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {disease.severity}
                    </span>
                  </div>
                  {getSeverityIcon(disease.severity)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    {disease.requires_doctor ? (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                        <span>Medical attention recommended</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2 text-green-600" />
                        <span>Usually benign</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-primary-600 font-medium text-sm flex items-center">
                    Learn more
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No diseases found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-12 card bg-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Severity Levels</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">High Risk</p>
                <p className="text-sm text-gray-600">Requires immediate medical attention</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Moderate Risk</p>
                <p className="text-sm text-gray-600">Should be evaluated by a doctor</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Low Risk</p>
                <p className="text-sm text-gray-600">Usually benign, monitoring advised</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 card bg-amber-50 border border-amber-200">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Medical Disclaimer</h3>
              <p className="text-amber-800 text-sm">
                This information is for educational purposes only and should not be used for self-diagnosis. 
                Always consult with a qualified healthcare professional for proper medical advice, diagnosis, and treatment. 
                If you notice any changes in your skin, schedule an appointment with a dermatologist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Diseases;
