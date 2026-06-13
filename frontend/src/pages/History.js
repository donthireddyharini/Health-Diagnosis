import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPredictions, deletePrediction } from '../api';
import { FileText, Trash2, Eye, Calendar, TrendingUp } from 'lucide-react';

function History() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const response = await getPredictions();
      setPredictions(response.data);
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prediction?')) {
      try {
        await deletePrediction(id);
        setPredictions(predictions.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting prediction:', error);
        alert('Failed to delete prediction');
      }
    }
  };

  const filteredPredictions = predictions.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'consulted') return p.has_consultation;
    if (filter === 'not_consulted') return !p.has_consultation;
    return true;
  });

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
          <p className="text-gray-600 mt-2">View all your past skin disease analyses</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm font-medium">Total Analyses</p>
                <p className="text-3xl font-bold mt-2">{predictions.length}</p>
              </div>
              <FileText className="h-12 w-12 text-primary-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">With Consultation</p>
                <p className="text-3xl font-bold mt-2">
                  {predictions.filter(p => p.has_consultation).length}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold mt-2">
                  {predictions.filter(p => {
                    const date = new Date(p.created_at);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="card mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('consulted')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'consulted'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Consulted
              </button>
              <button
                onClick={() => setFilter('not_consulted')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'not_consulted'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Not Consulted
              </button>
            </div>
          </div>
        </div>

        {/* Predictions List */}
        {filteredPredictions.length > 0 ? (
          <div className="space-y-4">
            {filteredPredictions.map((prediction) => (
              <div key={prediction.id} className="card hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {prediction.predicted_class.replace(/_/g, ' ')}
                      </h3>
                      {prediction.has_consultation && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          Consulted
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(prediction.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span>
                        Confidence: <span className="font-semibold text-primary-600">
                          {(prediction.confidence * 100).toFixed(1)}%
                        </span>
                      </span>
                    </div>
                    {prediction.notes && (
                      <p className="text-sm text-gray-600 mt-2">{prediction.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/predictions/${prediction.id}`}
                      className="p-2 bg-primary-100 text-primary-600 hover:bg-primary-200 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(prediction.id)}
                      className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${prediction.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {filter === 'all' ? 'No analyses yet' : 'No analyses match this filter'}
            </p>
            <Link to="/predict" className="text-primary-600 hover:text-primary-700 font-medium">
              Start your first analysis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
