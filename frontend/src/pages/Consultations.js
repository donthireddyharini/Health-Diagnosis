import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getConsultations, createConsultation, getDoctors, getPredictions } from '../api';
import { MessageSquare, Plus, Clock, CheckCircle, XCircle, User } from 'lucide-react';

function Consultations({ user }) {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const location = useLocation();

  const [formData, setFormData] = useState({
    prediction_id: location.state?.predictionId || '',
    doctor_id: '',
    symptoms: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (location.state?.predictionId) {
      setShowModal(true);
      setFormData(prev => ({ ...prev, prediction_id: location.state.predictionId }));
    }
  }, [location.state]);

  const loadData = async () => {
    try {
      const [consultRes, doctorsRes, predsRes] = await Promise.all([
        getConsultations(),
        getDoctors(),
        getPredictions()
      ]);
      setConsultations(consultRes.data);
      setDoctors(doctorsRes.data);
      setPredictions(predsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createConsultation(formData);
      setShowModal(false);
      setFormData({ prediction_id: '', doctor_id: '', symptoms: '' });
      loadData();
    } catch (error) {
      console.error('Error creating consultation:', error);
      alert('Failed to create consultation');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-amber-100 text-amber-800', icon: Clock, text: 'Pending' },
      accepted: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Accepted' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Cancelled' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.text}
      </span>
    );
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.is_doctor ? 'Patient Consultations' : 'My Consultations'}
            </h1>
            <p className="text-gray-600 mt-2">
              {user.is_doctor ? 'Manage your patient consultations' : 'Connect with expert dermatologists'}
            </p>
          </div>
          {!user.is_doctor && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Consultation
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <p className="text-primary-100 text-sm font-medium">Total</p>
            <p className="text-3xl font-bold mt-2">{consultations.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <p className="text-amber-100 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold mt-2">
              {consultations.filter(c => c.status === 'pending').length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-blue-100 text-sm font-medium">Accepted</p>
            <p className="text-3xl font-bold mt-2">
              {consultations.filter(c => c.status === 'accepted').length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-green-100 text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold mt-2">
              {consultations.filter(c => c.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Consultations List */}
        {consultations.length > 0 ? (
          <div className="space-y-4">
            {consultations.map((consultation) => (
              <Link
                key={consultation.id}
                to={`/consultations/${consultation.id}`}
                className="card hover:shadow-xl transition block"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <MessageSquare className="h-5 w-5 text-primary-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.is_doctor ? `Patient: ${consultation.patient_name}` : `Doctor: ${consultation.doctor_name}`}
                      </h3>
                      {getStatusBadge(consultation.status)}
                    </div>
                    {consultation.symptoms && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{consultation.symptoms}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {new Date(consultation.created_at).toLocaleDateString()}</span>
                      {consultation.appointment_date && (
                        <span>Appointment: {new Date(consultation.appointment_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No consultations yet</p>
            {!user.is_doctor && (
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Request Consultation
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Consultation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Consultation</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Analysis (Optional)
                  </label>
                  <select
                    value={formData.prediction_id}
                    onChange={(e) => setFormData({ ...formData, prediction_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">No specific analysis</option>
                    {predictions.map((pred) => (
                      <option key={pred.id} value={pred.id}>
                        {pred.predicted_class.replace(/_/g, ' ')} - {new Date(pred.created_at).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Doctor (Optional)
                  </label>
                  <select
                    value={formData.doctor_id}
                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Any available doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe Your Symptoms *
                  </label>
                  <textarea
                    required
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    rows="6"
                    className="input-field"
                    placeholder="Please describe your symptoms, concerns, and any relevant medical history..."
                  ></textarea>
                </div>

                <div className="flex space-x-4">
                  <button type="submit" className="flex-1 btn-primary">
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ prediction_id: '', doctor_id: '', symptoms: '' });
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Consultations;
