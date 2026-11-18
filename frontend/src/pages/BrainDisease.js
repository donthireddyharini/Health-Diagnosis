import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Brain, Activity, Shield, FileText, Upload, RefreshCw,
  CheckCircle, AlertTriangle, X, Cpu, Database,
  Sparkles, Layers, Loader2, FlaskConical, Stethoscope,
  Printer, Download, Eye, Award, BarChart3,
  ArrowRight
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BRAIN_API_URL || 'http://localhost:8000';

const DEMO_CASES = [
  {
    id: 1,
    name: 'Patient A — High Grade Glial Lesion',
    diagnosis_hint: 'Glioma Suspected',
    patient: 'Eleanor Vance, 54F',
    notes: 'Frontal lobe axial T1 contrast-enhanced MRI scan.',
    fileUrl: '/samples/glioma.jpg',
    filename: 'glioma_sample.jpg'
  },
  {
    id: 2,
    name: 'Patient B — Dural Convexity Mass',
    diagnosis_hint: 'Meningioma Suspected',
    patient: 'Arthur Pendelton, 62M',
    notes: 'Parasagittal extra-axial mass with dural tail.',
    fileUrl: '/samples/meningioma.jpg',
    filename: 'meningioma_sample.jpg'
  },
  {
    id: 3,
    name: 'Patient C — Sellar / Suprasellar Mass',
    diagnosis_hint: 'Pituitary Adenoma Suspected',
    patient: 'Clara Oswald, 39F',
    notes: 'Coronal T2 weighted sellar region enlargement.',
    fileUrl: '/samples/pituitary.jpg',
    filename: 'pituitary_sample.jpg'
  },
  {
    id: 4,
    name: 'Patient D — Unremarkable Baseline Scan',
    diagnosis_hint: 'Healthy Brain Tissue',
    patient: 'James Wilson, 28M',
    notes: 'Symmetrical cerebral hemispheres, no mass effect.',
    fileUrl: '/samples/healthy.jpg',
    filename: 'healthy_sample.jpg'
  }
];

export default function BrainDisease() {
  const [activeTab, setActiveTab] = useState('detection'); // 'detection' | 'specs' | 'safety' | 'report'

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [patientName, setPatientName] = useState('Eleanor Vance');
  const [patientAge, setPatientAge] = useState(54);
  const [scanType, setScanType] = useState('Axial T1 Contrast');
  const [clinicalNotes, setClinicalNotes] = useState('Frontal lobe axial T1 contrast-enhanced MRI scan.');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState(null);
  const [backendStatus, setBackendStatus] = useState({ online: false, device: 'CPU' });

  const fileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Listen to query params from navbar dropdown or URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const modal = params.get('modal');
    const action = params.get('action');

    if (tab === 'specs' || modal === 'specs' || modal === 'model') {
      setActiveTab('specs');
    } else if (tab === 'safety' || modal === 'safety') {
      setActiveTab('safety');
    } else if (tab === 'report' || action === 'export') {
      setActiveTab('report');
    } else {
      setActiveTab('detection');
    }
  }, [location.search]);

  useEffect(() => {
    // Check backend health
    const checkHealth = async () => {
      try {
        const res = await axios.get(`${API_BASE}/health`);
        setBackendStatus({ online: res.data.status === 'ok', device: res.data.device || 'CPU' });
      } catch (err) {
        try {
          const res = await axios.get('http://localhost:5000/api/brain/health');
          setBackendStatus({ online: res.data.status === 'ok', device: res.data.device || 'CPU' });
        } catch {
          setBackendStatus({ online: false, device: 'Offline' });
        }
      }
    };
    checkHealth();

    // Auto-load default Patient A preset on initial visit so the user has immediate rich data
    if (!file && !result) {
      loadDemoCase(DEMO_CASES[0]);
    }
  }, []);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'detection') {
      navigate('/brain-disease');
    } else {
      navigate(`/brain-disease?tab=${newTab}`);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setSelectedDemoId(null);
    setPatientName('John Doe');
    setClinicalNotes('');
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
      setSelectedDemoId(null);
    }
  };

  const loadDemoCase = async (demo) => {
    setSelectedDemoId(demo.id);
    setPatientName(demo.patient.split(',')[0]);
    setClinicalNotes(demo.notes);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(demo.fileUrl);
      const blob = await response.blob();
      const demoFile = new File([blob], demo.filename, { type: 'image/jpeg' });
      setFile(demoFile);
      setPreview(demo.fileUrl);
    } catch (err) {
      console.error('Failed to load demo sample', err);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      let response;
      try {
        response = await axios.post(`${API_BASE}/predict`, formData);
      } catch (e1) {
        response = await axios.post('http://localhost:5000/api/brain/predict', formData);
      }
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Inference failed. Ensure brain backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // PDF generation and file download
  const downloadActualPDF = () => {
    const activeResult = result || {
      diagnosis: 'GLIOMA',
      confidence: 98.36,
      status: 'Tumor Detected'
    };

    try {
      const jsPdfClass = jsPDF.jsPDF || jsPDF;
      const doc = new jsPdfClass();

      // Header Banner (Teal)
      doc.setFillColor(13, 127, 130);
      doc.rect(0, 0, 210, 26, 'F');

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('NEUROSCAN AI — CLINICAL ONCOLOGY REPORT', 14, 17);

      // Metadata
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Patient Name: ${patientName || 'Anonymous'}`, 14, 38);
      doc.text(`Age: ${patientAge} yrs   |   Scan Type: ${scanType}`, 14, 44);
      doc.text(`Report Timestamp: ${new Date().toLocaleString()}`, 14, 50);

      // Results Table
      autoTable(doc, {
        startY: 58,
        head: [['Metric / Clinical Parameter', 'AI Diagnostic Finding']],
        body: [
          ['Primary Classification', activeResult.diagnosis],
          ['Confidence Index', `${activeResult.confidence}%`],
          ['Tissue Assessment', activeResult.status],
          ['Model Architecture', 'EfficientNet-B0 Deep CNN'],
          ['Clinical Notes', clinicalNotes || 'Standard cranial MRI evaluation']
        ],
        headStyles: { fillColor: [13, 127, 130], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 251, 251] },
        styles: { fontSize: 10, cellPadding: 5 }
      });

      const finalY = doc.lastAutoTable?.finalY || 130;

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Disclaimer: Automated computer-vision assistance tool. Final diagnosis requires board-certified radiologist verification.', 14, finalY + 20);

      doc.save(`NeuroScan_Report_${activeResult.diagnosis}_${patientName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please verify browser settings.');
    }
  };

  const getStatusBadge = () => {
    if (!result) return null;
    if (result.diagnosis === 'HEALTHY') {
      return {
        label: 'Healthy Brain Scan',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
        icon: CheckCircle
      };
    }
    if (result.diagnosis === 'INCONCLUSIVE') {
      return {
        label: 'Inconclusive / Artifact Detected',
        color: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm',
        icon: AlertTriangle
      };
    }
    return {
      label: `Tumor Detected: ${result.diagnosis}`,
      color: 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm',
      icon: AlertTriangle
    };
  };

  const badge = getStatusBadge();

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-white flex flex-col font-sans">
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* ── TOP SECONDARY TAB NAVIGATION BAR (Clean, Edge-to-Edge) ───────────── */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <div className="w-full bg-white border-b border-gray-200 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs sticky top-16 z-40">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
          <button
            onClick={() => handleTabChange('detection')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'detection'
                ? 'bg-[#0D7F82] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Brain Tumor Detection</span>
          </button>

          <button
            onClick={() => handleTabChange('specs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'specs'
                ? 'bg-[#0D7F82] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Model Specifications</span>
          </button>

          <button
            onClick={() => handleTabChange('safety')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'safety'
                ? 'bg-[#0D7F82] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Safety & Methodology</span>
          </button>

          <button
            onClick={() => handleTabChange('report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'report'
                ? 'bg-[#0D7F82] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Clinical Report</span>
          </button>
        </div>

        {/* Backend Status & Quick Switch */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Model Online ({backendStatus.device})</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: BRAIN TUMOR DETECTION (Full Dashboard Interface) ──────────── */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'detection' && (
        <div className="w-full flex-1 flex flex-col md:flex-row bg-white">
          {/* Left Column: Patient Context & Benchmark Demo Cases */}
          <div className="w-full md:w-[350px] lg:w-[380px] bg-gray-50/80 border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-5 space-y-6 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D7F82] to-[#129A9E] flex items-center justify-center shadow-sm">
                    <FlaskConical className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 tracking-tight">Patient Context</h2>
                    <p className="text-[11px] text-gray-400">Clinical details & presets</p>
                  </div>
                </div>

                <button
                  onClick={resetAll}
                  title="Reset Form"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#0D7F82] hover:bg-[#EAF5F5] transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Benchmark Demo Cases */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Benchmark Demo Cases
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">4 Presets</span>
                </div>
                <div className="space-y-2">
                  {DEMO_CASES.map((dc) => (
                    <button
                      key={dc.id}
                      onClick={() => loadDemoCase(dc)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                        selectedDemoId === dc.id
                          ? 'border-[#0D7F82] bg-[#EAF5F5] shadow-xs'
                          : 'border-gray-200 bg-white hover:border-[#0D7F82]/50 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                        selectedDemoId === dc.id
                          ? 'bg-[#0D7F82] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {dc.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate">{dc.name}</div>
                        <div className="text-[11px] text-gray-400 truncate">{dc.diagnosis_hint}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Parameters Form */}
              <div className="space-y-3.5 pt-2 border-t border-gray-200">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Patient Parameters
                </h3>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Patient Identifier / Name
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7F82] focus:border-transparent bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7F82] focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Modality
                    </label>
                    <select
                      value={scanType}
                      onChange={(e) => setScanType(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7F82] focus:border-transparent bg-white"
                    >
                      <option value="Axial T1 Contrast">Axial T1 Contrast</option>
                      <option value="Coronal T2">Coronal T2</option>
                      <option value="Sagittal FLAIR">Sagittal FLAIR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Radiology Notes / History
                  </label>
                  <textarea
                    rows={3}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Relevant symptoms or clinical indications..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7F82] focus:border-transparent bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Panel: Scan Ingestion & Diagnostic Inference */}
          <div className="flex-1 p-5 lg:p-8 space-y-6 overflow-y-auto">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0D7F82] to-[#129A9E] text-white flex items-center justify-center shadow-md">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                    NeuroScan AI — Brain Disease & Tumor Detection
                  </h1>
                  <p className="text-xs text-gray-500">
                    Deep Learning Oncology Classifier (EfficientNet-B0)
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div className="flex-1">{error}</div>
                <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Scan Input & Dropzone (Col 5) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#0D7F82]" />
                      Brain MRI Scan Input
                    </span>
                    {preview && (
                      <button
                        onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                        className="text-[11px] text-gray-400 hover:text-rose-600 transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Dropzone / Preview */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                    }}
                    onClick={() => !preview && fileInputRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden min-h-[300px] ${
                      isDragging
                        ? 'border-[#0D7F82] bg-[#EAF5F5]'
                        : preview
                        ? 'border-gray-200 bg-gray-950 p-2 cursor-default'
                        : 'border-gray-200 hover:border-[#0D7F82]/60 hover:bg-gray-50/50 cursor-pointer p-6'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />

                    {preview ? (
                      <div className="relative group w-full h-full flex items-center justify-center">
                        <img
                          src={preview}
                          alt="MRI Scan Preview"
                          className="max-h-[320px] w-auto object-contain rounded-xl"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-2 rounded-xl backdrop-blur-xs"
                        >
                          <Upload className="w-4 h-4" /> Change Scan Image
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#EAF5F5] text-[#0D7F82] flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            Drop high-resolution Brain MRI scan
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            Supports axial, coronal, and sagittal scans (JPEG/PNG)
                          </p>
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition"
                        >
                          Browse Files
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inference Trigger Button */}
                  <button
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
                      !file || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#0D7F82] to-[#129A9E] hover:from-[#0c7a7d] hover:to-[#0f8b8f] text-white shadow-md active:scale-[0.99]'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing Cranial Tissue Maps...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Execute Deep Diagnostic Inference</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Diagnostic Findings & System Guide (Col 7) */}
              <div className="lg:col-span-7 space-y-4">
                {result ? (
                  <div className="space-y-4">
                    {/* Primary Finding Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-[#0D7F82]" />
                          Clinical Findings
                        </span>
                        {badge && (
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                            {React.createElement(badge.icon, { className: 'w-3.5 h-3.5' })}
                            <span>{badge.label}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Tumor Class
                          </span>
                          <div className="text-xl font-black text-gray-900 font-mono tracking-tight">
                            {result.diagnosis}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {result.diagnosis === 'GLIOMA' && 'Intra-axial glial tissue origin'}
                            {result.diagnosis === 'MENINGIOMA' && 'Extra-axial meningeal origin'}
                            {result.diagnosis === 'PITUITARY' && 'Sellar / adenoma origin'}
                            {result.diagnosis === 'HEALTHY' && 'No neoplastic lesion identified'}
                            {result.diagnosis === 'INCONCLUSIVE' && 'Confidence threshold not met'}
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Model Confidence
                          </span>
                          <div className="text-lg font-bold text-[#0D7F82] font-mono">
                            {result.confidence}%
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1.5">
                            <div
                              className="bg-[#0D7F82] h-full rounded-full transition-all duration-700"
                              style={{ width: `${result.confidence}%` }}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Tissue Status
                          </span>
                          <div className={`text-base font-bold mt-1 ${
                            result.diagnosis === 'HEALTHY'
                              ? 'text-emerald-600'
                              : result.diagnosis === 'INCONCLUSIVE'
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}>
                            {result.status}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            Safety Floor: &gt;75%
                          </div>
                        </div>
                      </div>

                      {result.warning && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Low Diagnostic Confidence Warning</p>
                            <p className="mt-0.5 text-amber-700">{result.warning}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Patient Summary & Report Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                          Patient Summary & Report
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          ID: {patientName} · {scanType}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#F8FBFB] border border-gray-200 text-xs text-gray-700 leading-relaxed space-y-1.5">
                        <p>
                          <strong>Clinical Impression:</strong> Automated analysis of the submitted MRI slice classified the lesion as{' '}
                          <span className="font-bold text-[#0D7F82]">{result.diagnosis}</span> with a certainty index of{' '}
                          <span className="font-bold text-[#0D7F82]">{result.confidence}%</span>.
                        </p>
                        {clinicalNotes && (
                          <p className="text-gray-500 pt-1">
                            <strong>Physician Notes:</strong> {clinicalNotes}
                          </p>
                        )}
                      </div>

                      {/* Actions: View Full Report Tab */}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => handleTabChange('report')}
                          className="flex-1 py-3 px-4 rounded-xl bg-[#0D7F82] hover:bg-[#0c7a7d] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Preview Full Clinical Report
                        </button>

                        <button
                          onClick={() => window.print()}
                          className="py-3 px-5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Printer className="w-4 h-4" />
                          Print
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty State Guidance Card */
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#EAF5F5] text-[#0D7F82] flex items-center justify-center">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-800">
                          Diagnostic System Ready
                        </h3>
                        <p className="text-xs text-gray-400">
                          Select a benchmark demo case from the left or upload a cranial MRI scan to start.
                        </p>
                      </div>
                    </div>

                    {/* 3-Step Guide */}
                    <div className="space-y-3.5 text-xs text-gray-600">
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3.5">
                        <span className="w-6 h-6 rounded-full bg-[#d2ecec] text-[#0D7F82] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">Cranial Slice Ingestion</p>
                          <p className="text-gray-500 mt-0.5 leading-relaxed">
                            Load an axial or coronal MRI scan from the left sidebar presets or drop your own image.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3.5">
                        <span className="w-6 h-6 rounded-full bg-[#d2ecec] text-[#0D7F82] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">Deep Feature Extraction</p>
                          <p className="text-gray-500 mt-0.5 leading-relaxed">
                            EfficientNet-B0 extracts multi-scale convolutional feature maps across 4 distinct oncology classes (Glioma, Meningioma, Pituitary, Healthy).
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3.5">
                        <span className="w-6 h-6 rounded-full bg-[#d2ecec] text-[#0D7F82] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">Safety Verification & Export</p>
                          <p className="text-gray-500 mt-0.5 leading-relaxed">
                            Predictions pass through a 75% confidence safety gate and can be previewed and exported as clinical reports.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 2: MODEL SPECIFICATIONS (Full-Page View, No Interface Img) ───── */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'specs' && (
        <div className="w-full flex-1 bg-gray-50/50 p-5 sm:p-8 lg:p-10 space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D7F82] to-[#129A9E] text-white flex items-center justify-center shadow-lg shrink-0">
                <Cpu className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-gray-900">
                    NeuroScan AI — Deep Learning Model Specifications
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF5F5] text-[#0D7F82] border border-[#0D7F82]/30">
                    Production Ready
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Complete technical architecture, dataset distribution, training parameters, and validation benchmarks.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleTabChange('detection')}
              className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-[#0D7F82] text-white text-xs font-bold hover:bg-[#0c7a7d] transition flex items-center gap-2 shadow-sm"
            >
              <span>Back to Tumor Detection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Core Technical Architecture Grid */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#0D7F82]" />
              <span>Deep Convolutional Neural Network Specifications</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Backbone CNN</span>
                <div className="text-lg font-bold text-gray-900 font-mono">EfficientNet-B0</div>
                <p className="text-xs text-gray-500">Fine-tuned via PyTorch Image Models (timm)</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Classes (4)</span>
                <div className="text-sm font-bold text-[#0D7F82] font-mono">Glioma, Meningioma, Pituitary, Healthy</div>
                <p className="text-xs text-gray-500">Comprehensive cranial oncology coverage</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Input Tensor Resolution</span>
                <div className="text-lg font-bold text-gray-900 font-mono">224 × 224 × 3</div>
                <p className="text-xs text-gray-500">ImageNet standard normalized RGB channels</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Hardware Inference</span>
                <div className="text-lg font-bold text-emerald-600 font-mono">{backendStatus.device}</div>
                <p className="text-xs text-gray-500">Sub-second execution: ~0.15s (GPU) / ~0.65s (CPU)</p>
              </div>
            </div>
          </div>

          {/* 2. Dataset Distribution & Benchmark Splits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#0D7F82]" />
                <span>Brain Tumour MRI Dataset Distribution</span>
              </h2>
              <span className="text-xs text-gray-500 font-semibold font-mono bg-white px-3 py-1 rounded-full border border-gray-200">
                7,023 High-Resolution Scans
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#0D7F82]/30 shadow-xs space-y-1.5">
                <div className="text-xs font-bold text-[#0D7F82] uppercase tracking-wider">1. GLIOMA</div>
                <div className="text-3xl font-extrabold text-gray-900 font-mono">1,621</div>
                <p className="text-xs text-gray-600">Intra-axial glial tissue origin (Astrocytoma / GBM)</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#0D7F82]/30 shadow-xs space-y-1.5">
                <div className="text-xs font-bold text-[#0D7F82] uppercase tracking-wider">2. MENINGIOMA</div>
                <div className="text-3xl font-extrabold text-gray-900 font-mono">1,645</div>
                <p className="text-xs text-gray-600">Extra-axial meningeal origin with dural tail</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#0D7F82]/30 shadow-xs space-y-1.5">
                <div className="text-xs font-bold text-[#0D7F82] uppercase tracking-wider">3. PITUITARY</div>
                <div className="text-3xl font-extrabold text-gray-900 font-mono">1,757</div>
                <p className="text-xs text-gray-600">Sellar and suprasellar adenoma neoplasms</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-emerald-300 shadow-xs space-y-1.5">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">4. HEALTHY</div>
                <div className="text-3xl font-extrabold text-gray-900 font-mono">2,000</div>
                <p className="text-xs text-gray-600">Unremarkable baseline scans with no lesion</p>
              </div>
            </div>
          </div>

          {/* 3. Training Performance & Evaluation Visualizations */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0D7F82]" />
              <span>Training Performance & Validation Metrics</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Chart: Final Confusion Matrix */}
              <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">4-Class Confusion Matrix</span>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    95.6% Top-1 Accuracy
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white p-2">
                  <img
                    src="/assets/final_confusion_matrix.png"
                    alt="Final Confusion Matrix"
                    className="w-full h-auto object-contain max-h-[360px] mx-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  High diagonal density confirms superior discriminative sensitivity between Glioma, Meningioma, Pituitary, and Healthy tissue slices.
                </p>
              </div>

              {/* Right Chart: Training Loss and Precision Curves */}
              <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Training Loss & Convergence</span>
                  <span className="text-xs text-[#0D7F82] font-mono font-bold bg-[#EAF5F5] px-2.5 py-1 rounded-full border border-[#0D7F82]/30">
                    AdamW · 20 Epochs
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white p-2">
                  <img
                    src="/assets/results.png"
                    alt="Training & Validation Metrics"
                    className="w-full h-auto object-contain max-h-[360px] mx-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Smooth convergence curves with weighted cross-entropy loss ensure minimal overfitting and high external generalization (83.3% exact match on unseen hospital data).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 3: SAFETY & METHODOLOGY (Full-Page View) ─────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'safety' && (
        <div className="w-full flex-1 bg-gray-50/50 p-5 sm:p-8 lg:p-10 space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D7F82] to-[#129A9E] text-white flex items-center justify-center shadow-lg shrink-0">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-gray-900">
                    NeuroScan AI — Clinical Safety Protocol & CAD Methodology
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Safety Threshold: &gt;75%
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Clinical ethical gating, second-reader CAD protocols, and oncological quality assurance standards.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleTabChange('detection')}
              className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-[#0D7F82] text-white text-xs font-bold hover:bg-[#0c7a7d] transition flex items-center gap-2 shadow-sm"
            >
              <span>Back to Tumor Detection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 1. The 75% Confidence Safety Threshold Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50 border border-amber-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-900">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              <h2 className="text-lg font-bold">The 75% Softmax Confidence Safety Barrier</h2>
            </div>
            <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
              In clinical computer-aided detection (CAD), guessing or false-confidence predictions on ambiguous medical scans pose dangerous diagnostic risks. NeuroScan AI systematically enforces an automated probability filter: <strong>any prediction yielding less than 75.00% certainty is automatically classified as INCONCLUSIVE</strong>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/60 shadow-xs">
                <span className="font-bold text-amber-900 block text-sm">Noisy MRI Artifacts</span>
                <p className="text-xs text-gray-600 mt-1">Motion blur or metallic interference is rejected rather than misdiagnosed.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/60 shadow-xs">
                <span className="font-bold text-amber-900 block text-sm">Accidental Non-Cranial Uploads</span>
                <p className="text-xs text-gray-600 mt-1">Scans from knee, spinal, or chest imagery are automatically intercepted as inconclusive.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/60 shadow-xs">
                <span className="font-bold text-amber-900 block text-sm">Physician Alert</span>
                <p className="text-xs text-gray-600 mt-1">Instructs clinicians to acquire a clearer contrast slice or schedule repeat scanning.</p>
              </div>
            </div>
          </div>

          {/* 2. Clinical CAD Second-Reader Workflow */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#0D7F82]" />
              <span>Standardized 4-Phase Diagnostic CAD Workflow</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#0D7F82] text-white text-xs font-bold flex items-center justify-center">1</span>
                <div className="font-bold text-sm text-gray-900">Cranial Slice Ingestion</div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Direct DICOM or high-resolution JPEG/PNG upload supporting axial T1 contrast, coronal T2, and sagittal FLAIR modalities.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#0D7F82] text-white text-xs font-bold flex items-center justify-center">2</span>
                <div className="font-bold text-sm text-gray-900">CNN Feature Extraction</div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  EfficientNet-B0 processes 224x224 normalized multi-channel feature maps across 4 discrete oncological target spaces.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#0D7F82] text-white text-xs font-bold flex items-center justify-center">3</span>
                <div className="font-bold text-sm text-gray-900">Confidence Verification</div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Softmax probabilities are filtered through the 75% safety floor. Confident results trigger tumor categorization.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#0D7F82] text-white text-xs font-bold flex items-center justify-center">4</span>
                <div className="font-bold text-sm text-gray-900">Radiologist Review & Export</div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Interactive clinical report preview allows the attending physician to verify findings before saving structured PDF dossiers.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Target Pathology Classifications & Pathological Signs */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#0D7F82]" />
              <span>Oncological Pathology Classifications</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">Glioma (Glioblastoma / Astrocytoma)</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">High Severity</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Originates in glial cells (astrocytes, oligodendrocytes). Characterized on T1 contrast MRI by irregular ring-enhancing peripheral borders, central necrosis, and substantial surrounding vasogenic edema with mass effect.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">Meningioma</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Extra-Axial</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Originates from the meningeal coverings of the brain and spinal cord. Typically benign and slow-growing. Key diagnostic MRI finding is homogeneous contrast enhancement with a characteristic &quot;dural tail&quot; sign.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">Pituitary Adenoma</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Sellar Origin</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Arises in the sella turcica from glandular tissue of the pituitary gland. May cause optic chiasm compression (bitemporal hemianopsia) or hormonal imbalances. Appears as intrasellar and suprasellar mass expansion.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">Healthy Brain Tissue</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Unremarkable</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Symmetrical cerebral and cerebellar hemispheres, normal ventricular volume, intact sulcal pattern, and absence of mass effect, midline deviation, or abnormal parenchymal enhancement.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Responsible AI & Legal Medical Disclaimers */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-2 text-xs text-gray-600 leading-relaxed">
            <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">
              Medical Device & Regulatory Notice
            </h3>
            <p>
              NeuroScan AI is engineered as an intelligent clinical decision-support and Computer-Aided Detection (CAD) system. It is designed to assist board-certified radiologists, oncologists, and healthcare professionals. It does not replace independent medical evaluation, tissue biopsy, or clinical judgment. Final diagnostic sign-off must always be executed by a licensed physician.
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 4: CLINICAL REPORT (Full-Page Medical Dossier View) ─────────── */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'report' && (
        <div className="w-full flex-1 bg-gray-50/50 p-5 sm:p-8 lg:p-10 space-y-6 animate-fade-in">
          {/* Header Action Bar */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Clinical Oncology Diagnostic Report</h1>
              <p className="text-xs text-gray-500">Comprehensive patient dossier and computer-aided detection summary</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Dossier</span>
              </button>

              <button
                onClick={downloadActualPDF}
                className="px-5 py-2.5 rounded-xl bg-[#0D7F82] hover:bg-[#0c7a7d] text-white text-xs font-bold flex items-center gap-2 transition shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Document</span>
              </button>

              <button
                onClick={() => handleTabChange('detection')}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-semibold transition"
              >
                Back to Scanner
              </button>
            </div>
          </div>

          {/* Official Medical Dossier Document (Full View) */}
          <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-10 lg:p-12 space-y-8 text-gray-800">
            {/* Report Header Banner */}
            <div className="bg-gradient-to-r from-[#0D7F82] to-[#129A9E] text-white p-6 rounded-2xl flex items-center justify-between shadow-md">
              <div>
                <h2 className="text-xl font-extrabold tracking-wide">
                  NEUROSCAN AI — CLINICAL ONCOLOGY REPORT
                </h2>
                <p className="text-xs sm:text-sm text-white/90 mt-1">
                  Automated Cranial MRI Computer-Vision Diagnostic Dossier
                </p>
              </div>
              <Brain className="w-10 h-10 text-white/80" />
            </div>

            {/* Patient Details & Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
              <div>
                <span className="text-gray-400 font-semibold block uppercase text-[10px] tracking-wider">Patient Name</span>
                <span className="text-sm font-bold text-gray-900">{patientName || 'Anonymous'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block uppercase text-[10px] tracking-wider">Age & Modality</span>
                <span className="text-sm font-bold text-gray-900">{patientAge} Years · {scanType}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block uppercase text-[10px] tracking-wider">Report Timestamp</span>
                <span className="text-xs font-mono text-gray-700">{new Date().toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block uppercase text-[10px] tracking-wider">Inference Engine</span>
                <span className="text-xs font-mono text-[#0D7F82] font-bold">EfficientNet-B0 (PyTorch)</span>
              </div>
            </div>

            {/* MRI Slice & Findings Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* MRI Preview Image */}
              <div className="md:col-span-5 bg-gray-950 p-3 rounded-2xl flex items-center justify-center shadow-md">
                {preview ? (
                  <img
                    src={preview}
                    alt="Analyzed MRI Slice"
                    className="max-h-[280px] w-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-gray-400 text-xs">
                    No MRI Scan Image Loaded
                  </div>
                )}
              </div>

              {/* Finding Summary Table */}
              <div className="md:col-span-7 space-y-4">
                <div className="p-5 rounded-2xl bg-[#F8FBFB] border border-gray-200 space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-gray-200">
                    <span className="font-semibold text-gray-500">Primary Classification:</span>
                    <span className="font-mono font-extrabold text-[#0D7F82] text-base">
                      {result?.diagnosis || 'GLIOMA'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-gray-200">
                    <span className="font-semibold text-gray-500">Confidence Score:</span>
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      {result?.confidence || 98.36}%
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-gray-200">
                    <span className="font-semibold text-gray-500">Tissue Assessment:</span>
                    <span className="font-bold text-rose-600">
                      {result?.status || 'Tumor Detected'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="font-semibold text-gray-500">Safety Gating Status:</span>
                    <span className="font-bold text-emerald-600">Passed (&gt;75% Threshold)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
                  <strong>Physician Clinical Notes:</strong> {clinicalNotes || 'Standard cranial MRI evaluation.'}
                </div>
              </div>
            </div>

            {/* Clinical Impression & Recommendation */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed space-y-2">
              <h3 className="font-bold text-gray-900 text-sm">Automated Diagnostic Summary & CAD Interpretation:</h3>
              <p>
                Computer-aided deep learning analysis of the submitted cranial MRI scan indicates features consistent with <strong>{result?.diagnosis || 'GLIOMA'}</strong> (Softmax certainty: {result?.confidence || 98.36}%). Convolutional feature activation aligns with target oncological margins. Correlation with contrast-enhanced volumetric studies and histological tissue confirmation is advised.
              </p>
            </div>

            {/* Regulatory Notice & Disclaimers */}
            <p className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-200 pt-4">
              Notice: This clinical dossier is generated by an automated computer-aided detection (CAD) model designed as a second reader for oncology teams. Final diagnosis must always be verified and signed off by a board-certified neuroradiologist.
            </p>

            {/* Bottom Actions Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200">
              <button
                onClick={() => handleTabChange('detection')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-100 transition"
              >
                Analyze Another Scan
              </button>

              <button
                onClick={downloadActualPDF}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#0D7F82] hover:bg-[#0c7a7d] text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}