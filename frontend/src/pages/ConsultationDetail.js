import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultation, updateConsultation } from '../api';
import { ArrowLeft, User, Calendar, FileText, Stethoscope, Clock } from 'lucide-react';

function ConsultationDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    doctor_notes: '',
    prescription: '',
    appointment_date: ''
  });

  useEffect(() => {
    loadConsultation();
  }, [id]);

  const loadConsultation = async () => {
    try {
      const response = await getConsultation(id);
      setConsultation(response.data);
      setFormData({
        status: response.data.status,
        doctor_notes: response.data.doctor_notes || '',
        prescription: response.data.prescription || '',
        appointment_date: response.data.appointment_date ? response.data.appointment_date.split('T')[0] : ''
      });
    } catch (error) {
      console.error('Error loading consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateConsultation(id, formData);
      setEditing(false);
      loadConsultation();
    } catch (error) {
      console.error('Error updating consultation:', error);
      alert('Failed to update consultation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Consultation not found</p>
          <button onClick={() => navigate('/consultations')} className="text-primary-600 hover:text-primary-700 font-medium">
            Back to Consultations
          </button>
        </div>
      </div>
    );
  }

  const isDoctor = user.is_doctor && consultation.doctor?.id === user.id;
  const isPatient = !user.is_doctor && consultation.patient.id === user.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/consultations')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Consultations
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Status</h2>
              <div className="space-y-3">
                <div className={`px-4 py-3 rounded-lg text-center font-semibold ${
                  consultation.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  consultation.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {consultation.status.toUpperCase()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Created: {new Date(consultation.created_at).toLocaleDateString()}
                </div>
                {consultation.appointment_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Appointment: {new Date(consultation.appointment_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Patient Info */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                Patient
              </h2>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">{consultation.patient.name}</p>
                <p className="text-sm text-gray-600">{consultation.patient.email}</p>
              </div>
            </div>

            {/* Doctor Info */}
            {consultation.doctor && (
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2 text-primary-600" />
                  Doctor
                </h2>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">{consultation.doctor.name}</p>
                  <p className="text-sm text-gray-600">{consultation.doctor.specialization}</p>
                </div>
              </div>
            )}

            {/* Related Prediction */}
            {consultation.prediction && (
              <div className="card bg-primary-50">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Related Analysis</h2>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900 capitalize">
                    {consultation.prediction.predicted_class.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Confidence: {(consultation.prediction.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Symptoms */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-primary-600" />
                Patient Symptoms
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{consultation.symptoms}</p>
            </div>

            {/* Doctor's Section */}
            {isDoctor ? (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Doctor's Assessment</h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-primary text-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="input-field"
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Date
                      </label>
                      <input
                        type="date"
                        value={formData.appointment_date}
                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Doctor's Notes
                      </label>
                      <textarea
                        value={formData.doctor_notes}
                        onChange={(e) => setFormData({ ...formData, doctor_notes: e.target.value })}
                        rows="6"
                        className="input-field"
                        placeholder="Enter your medical assessment and recommendations..."
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prescription
                      </label>
                      <textarea
                        value={formData.prescription}
                        onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                        rows="6"
                        className="input-field"
                        placeholder="Enter prescription details..."
                      ></textarea>
                    </div>

                    <div className="flex space-x-4">
                      <button type="submit" className="flex-1 btn-primary">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            status: consultation.status,
                            doctor_notes: consultation.doctor_notes || '',
                            prescription: consultation.prescription || '',
                            appointment_date: consultation.appointment_date ? consultation.appointment_date.split('T')[0] : ''
                          });
                        }}
                        className="flex-1 btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {consultation.doctor_notes ? (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Medical Assessment</h3>
                        <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                          {consultation.doctor_notes}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No assessment provided yet</p>
                    )}

                    {consultation.prescription && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Prescription</h3>
                        <p className="text-gray-700 whitespace-pre-wrap bg-green-50 p-4 rounded-lg border border-green-200">
                          {consultation.prescription}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Patient View of Doctor's Assessment */
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Doctor's Assessment</h2>
                
                {consultation.doctor_notes ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Medical Assessment</h3>
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {consultation.doctor_notes}
                      </p>
                    </div>

                    {consultation.prescription && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Prescription</h3>
                        <p className="text-gray-700 whitespace-pre-wrap bg-green-50 p-4 rounded-lg border border-green-200">
                          {consultation.prescription}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Waiting for doctor's assessment</p>
                  </div>
                )}
              </div>
            )}

            {/* Medical Disclaimer */}
            <div className="card bg-gray-100 border border-gray-300">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Important:</strong> This consultation is for informational purposes. 
                In case of emergency, please contact your local emergency services immediately. 
                Always follow your doctor's advice and prescribed treatment plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsultationDetail;
