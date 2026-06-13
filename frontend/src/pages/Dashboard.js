import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPredictions, getConsultations } from '../api';
import { Activity, FileText, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalPredictions: 0,
    recentPredictions: [],
    consultations: 0,
    pendingConsultations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [predictionsRes, consultationsRes] = await Promise.all([
        getPredictions(),
        getConsultations()
      ]);

      const predictions = predictionsRes.data;
      const consultations = consultationsRes.data;

      setStats({
        totalPredictions: predictions.length,
        recentPredictions: predictions.slice(0, 5),
        consultations: consultations.length,
        pendingConsultations: consultations.filter(c => c.status === 'pending').length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.full_name || user.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            {user.is_doctor ? 'Manage your consultations and patients' : 'Track your skin health journey'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm font-medium">Total Analyses</p>
                <p className="text-3xl font-bold mt-2">{stats.totalPredictions}</p>
              </div>
              <Activity className="h-12 w-12 text-primary-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Consultations</p>
                <p className="text-3xl font-bold mt-2">{stats.consultations}</p>
              </div>
              <MessageSquare className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold mt-2">{stats.pendingConsultations}</p>
              </div>
              <AlertCircle className="h-12 w-12 text-amber-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Health Score</p>
                <p className="text-3xl font-bold mt-2">Good</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-200" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              to="/predict"
              className="flex items-center space-x-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition"
            >
              <Activity className="h-8 w-8 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900">New Analysis</p>
                <p className="text-sm text-gray-600">Upload skin image</p>
              </div>
            </Link>

            <Link
              to="/history"
              className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">View History</p>
                <p className="text-sm text-gray-600">Past analyses</p>
              </div>
            </Link>

            <Link
              to="/consultations"
              className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
            >
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">Consultations</p>
                <p className="text-sm text-gray-600">Talk to doctors</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Analyses</h2>
            <Link to="/history" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View All
            </Link>
          </div>

          {stats.recentPredictions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPredictions.map((prediction) => (
                <Link
                  key={prediction.id}
                  to={`/predictions/${prediction.id}`}
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">
                        {prediction.predicted_class.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Confidence: {(prediction.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(prediction.created_at).toLocaleDateString()}
                      </p>
                      {prediction.has_consultation && (
                        <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Consulted
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No analyses yet</p>
              <Link to="/predict" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                Start your first analysis
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
