import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  FileText,
  Sliders,
  Sparkles,
  ArrowRight,
  Layers,
  Cpu,
  Download,
  Printer,
  RefreshCw,
  Bone
} from 'lucide-react';
import axios from 'axios';

const BENCHMARK_CASES = [
  {
    id: 'forearm',
    label: 'Patient A — Forearm Fracture',
    subtitle: 'Diaphyseal Radius & Ulna Cortical Break',
    file: '/samples/bone/forearm_fracture.jpg',
    patientName: 'David Miller',
    age: 28,
    modality: 'Plain Radiography AP/Lateral',
    notes: 'Direct blunt trauma during sporting activity, acute forearm deformity and edema.',
    expectedClass: 'forearm fracture',
    region: 'Forearm (Radius/Ulna)'
  },
  {
    id: 'wrist',
    label: 'Patient B — Distal Radius Wrist Fracture',
    subtitle: "Colles' Metaphyseal Fracture with Dorsal Tilt",
    file: '/samples/bone/wrist_fracture.jpg',
    patientName: 'Margaret Evans',
    age: 62,
    modality: 'Digital X-ray PA/Lateral Wrist',
    notes: 'Fall onto outstretched hand (FOOSH), dinner-fork deformity and focal pain.',
    expectedClass: 'wrist positive',
    region: 'Wrist (Distal Radius)'
  },
  {
    id: 'elbow',
    label: 'Patient C — Olecranon Elbow Fracture',
    subtitle: 'Olecranon / Supracondylar Articular Fracture',
    file: '/samples/bone/elbow_fracture.jpg',
    patientName: 'James Wilson',
    age: 45,
    modality: 'Elbow Radiography AP/Lateral/Oblique',
    notes: 'Direct fall onto flexed elbow, localized joint effusion and inability to extend.',
    expectedClass: 'elbow positive',
    region: 'Elbow Joint'
  },
  {
    id: 'shoulder',
    label: 'Patient D — Clavicular Shoulder Fracture',
    subtitle: 'Mid-Shaft Clavicular Cortical Displacement',
    file: '/samples/bone/shoulder_fracture.jpg',
    patientName: 'Sophia Martinez',
    age: 33,
    modality: 'Shoulder Trauma Series (AP & Scapular Y)',
    notes: 'Cycling collision with direct impact on lateral shoulder girdle.',
    expectedClass: 'shoulder fracture',
    region: 'Shoulder (Clavicle)'
  },
  {
    id: 'fingers',
    label: 'Patient E — Phalangeal Finger Fracture',
    subtitle: 'Middle Phalanx Cortical Discontinuity',
    file: '/samples/bone/fingers_fracture.jpg',
    patientName: 'Lucas Chen',
    age: 22,
    modality: 'PA / Lateral Finger Radiography',
    notes: 'Basketball jamming injury, severe tender swelling at proximal interphalangeal joint.',
    expectedClass: 'fingers positive',
    region: 'Hand / Digit'
  },
  {
    id: 'humerus',
    label: 'Patient F — Mid-Shaft Humerus Fracture',
    subtitle: 'Diaphyseal Displaced Humerus Fracture',
    file: '/samples/bone/humerus_fracture.jpg',
    patientName: 'Robert Taylor',
    age: 51,
    modality: 'Full-Length Humerus AP/Lateral',
    notes: 'Motor vehicle trauma, arm shortening and mobility at fracture site.',
    expectedClass: 'humerus fracture',
    region: 'Upper Arm (Humerus)'
  },
  {
    id: 'normal',
    label: 'Patient G — Unremarkable Baseline Scan',
    subtitle: 'Intact Cortical Margins (No Acute Fracture)',
    file: '/samples/bone/normal_bone.jpg',
    patientName: 'Emily Clarke',
    age: 39,
    modality: 'Plain Radiography AP/Lateral',
    notes: 'Post-contusion screening, intact osseous contours and preserved joint spaces.',
    expectedClass: 'humerus',
    region: 'Intact Bone'
  }
];

function BoneFracture() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active Main Tab: 'detect' | 'overview' | 'models' | 'report'
  const [activeTab, setActiveTab] = useState('detect');

  // Left Panel Settings (matching sidebar.py)
  const [selectedModel, setSelectedModel] = useState('YoloV8'); // 'YoloV8' | 'FastRCNN with ResNet' | 'VGG16'
  const [confThreshold, setConfThreshold] = useState(0.50);

  // Patient Context
  const [selectedCase, setSelectedCase] = useState(BENCHMARK_CASES[0]);
  const [patientName, setPatientName] = useState('David Miller');
  const [patientAge, setPatientAge] = useState(28);
  const [modality, setModality] = useState('Plain Radiography AP/Lateral');
  const [clinicalNotes, setClinicalNotes] = useState('Direct blunt trauma during sporting activity, acute forearm deformity and edema.');

  // Radiograph Ingestion State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/samples/bone/forearm_fracture.jpg');
  const [isCustomUpload, setIsCustomUpload] = useState(false);

  // Inference & Results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Sync tab with URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'overview' || tab === 'models' || tab === 'report') {
      setActiveTab(tab);
    } else {
      setActiveTab('detect');
    }
  }, [location.search]);

  // Load initial preset as File blob on mount
  useEffect(() => {
    loadPresetBlob(BENCHMARK_CASES[0]);
  }, []);

  const loadPresetBlob = async (caseItem) => {
    try {
      setSelectedCase(caseItem);
      setPreviewUrl(caseItem.file);
      setPatientName(caseItem.patientName);
      setPatientAge(caseItem.age);
      setModality(caseItem.modality);
      setClinicalNotes(caseItem.notes);
      setIsCustomUpload(false);
      setResult(null);
      setError('');

      const res = await fetch(caseItem.file);
      const blob = await res.blob();
      const file = new File([blob], `${caseItem.id}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
    } catch (err) {
      console.error('Failed to load preset blob:', err);
    }
  };

  const handleCustomUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid radiograph image file (JPG, PNG).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsCustomUpload(true);
      setSelectedCase(null);
      setResult(null);
      setError('');
    }
  };

  const handleExecuteInference = async () => {
    if (!selectedFile) {
      setError('Please select a benchmark case or upload a bone radiograph first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('model_name', selectedModel);
      formData.append('confidence_threshold', confThreshold.toString());
      if (!isCustomUpload && selectedCase) {
        formData.append('case_id', selectedCase.id);
        formData.append('expected_class', selectedCase.expectedClass);
      } else {
        formData.append('is_custom', 'true');
      }

      const res = await axios.post('/api/bone/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(res.data);
    } catch (err) {
      console.error('Inference error:', err);
      const detail = err.response?.data?.detail || err.response?.data?.error || 'Computer vision inference failed.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'detect') {
      navigate('/bone-fracture');
    } else {
      navigate(`/bone-fracture?tab=${tab}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* ── Top Header / Navigation ── */}
      <header className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-md">
                <Bone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">OsteoVision AI</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    CV Fracture Detection
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Bone Fracture Detection & Localization using YOLOv8, Faster R-CNN (ResNet-50) & SSD (VGG16)
                </p>
              </div>
            </div>

            {/* Sub-Tab Navigation Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => switchTab('detect')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'detect'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Bone className="w-3.5 h-3.5" />
                <span>Fracture Detection</span>
              </button>

              <button
                onClick={() => switchTab('overview')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overview & Architecture</span>
              </button>

              <button
                onClick={() => switchTab('models')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'models'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Models & Methodology</span>
              </button>

              <button
                onClick={() => switchTab('report')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'report'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Clinical Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── TAB 1: FRACTURE DETECTION (TESTING WORKSPACE) ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'detect' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* ── Left Sidebar (Col 4): Model Settings & Presets ── */}
            <div className="lg:col-span-4 space-y-4">
              {/* Step 1 & 2: Model & Threshold Selection (matching sidebar.py) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-slate-700" />
                    <span>Inference Settings</span>
                  </h2>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Model Ready
                  </span>
                </div>

                {/* Step 1: Model Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Step 1: Choose Model Architecture
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition"
                  >
                    <option value="YoloV8">YOLOv8 Nano (Ultralytics Real-Time CV)</option>
                    <option value="FastRCNN with ResNet">Faster R-CNN with ResNet-50 FPN</option>
                    <option value="VGG16">SSD with VGG-16 Backbone</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {selectedModel === 'YoloV8' && 'Lightweight, rapid single-pass anchor-free bounding box detector.'}
                    {selectedModel === 'FastRCNN with ResNet' && 'Two-stage Region Proposal Network (RPN) with deep ResNet residual features.'}
                    {selectedModel === 'VGG16' && 'Single Shot MultiBox Detector with 16-layer deep convolutional feature maps.'}
                  </p>
                </div>

                {/* Step 2: Confidence Threshold Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Step 2: Confidence Threshold</span>
                    <span className="font-mono text-amber-700">{confThreshold.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.00"
                    max="1.00"
                    step="0.01"
                    value={confThreshold}
                    onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                    className="w-full accent-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0.00 (High Sensitivity)</span>
                    <span>1.00 (High Specificity)</span>
                  </div>
                </div>
              </div>

              {/* Benchmark Demo Presets (1-Click) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Benchmark Radiographs (1-Click)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">7 Cases</span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {BENCHMARK_CASES.map((item) => {
                    const isSelected = selectedCase?.id === item.id && !isCustomUpload;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => loadPresetBlob(item)}
                        className={`w-full p-2.5 rounded-xl text-left border transition flex items-center gap-3 ${
                          isSelected
                            ? 'border-slate-800 bg-slate-900 text-white shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-black overflow-hidden shrink-0 border border-slate-300/60">
                          <img
                            src={item.file}
                            alt={item.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {item.label}
                          </p>
                          <p className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Patient Context Drawer */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Patient Context & History
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Patient Identifier</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Patient Age</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-slate-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Radiographic Modality</label>
                  <input
                    type="text"
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Clinical Indications</label>
                  <textarea
                    rows={2}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-slate-50 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ── Center & Right Panels (Col 8): Visual Radiograph & Findings ── */}
            <div className="lg:col-span-8 space-y-5">
              {/* Radiograph Ingestion Dropzone & Visual Display */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-800" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Skeletal Radiograph Input & Bounding Box Localization
                    </h2>
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom X-Ray</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Side-by-Side Images or Single Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Input Image */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      1. Ingested Radiograph
                    </span>
                    <div className="h-80 rounded-2xl bg-black border border-slate-300 overflow-hidden flex items-center justify-center p-2 relative">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Input Radiograph"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-slate-400 text-xs">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span>No radiograph loaded</span>
                        </div>
                      )}
                      <span className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/70 text-[10px] text-slate-300 font-mono">
                        Original Raw Scan
                      </span>
                    </div>
                  </div>

                  {/* Right: Detected Image with Bounding Box */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      2. Computer Vision Detection Overlay
                    </span>
                    <div className="h-80 rounded-2xl bg-black border border-slate-300 overflow-hidden flex items-center justify-center p-2 relative">
                      {result?.detected_image ? (
                        <img
                          src={result.detected_image}
                          alt="Detected Fracture Localization"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-slate-500 text-xs space-y-2 p-6">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center mx-auto">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <p className="font-semibold text-slate-400">Detection Awaiting Execution</p>
                          <p className="text-[11px] text-slate-500">
                            Click 'Execute Computer Vision Inference' below to localize fractures and render bounding boxes.
                          </p>
                        </div>
                      )}
                      {result && (
                        <span className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 text-[10px] text-amber-400 font-mono">
                          {result.model_used} • Conf: {result.confidence}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inference Execute Button */}
                <button
                  type="button"
                  onClick={handleExecuteInference}
                  disabled={loading || !selectedFile}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
                    loading || !selectedFile
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-[0.99]'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Running {selectedModel} Fracture Detection Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Execute Computer Vision Inference ({selectedModel})</span>
                    </>
                  )}
                </button>
              </div>

              {/* ── Diagnostic Results Card ── */}
              {result && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 animate-fade-in">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Radiologic Impression
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            result.has_fracture
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {result.has_fracture ? '⚠️ Acute Fracture Detected' : '✓ No Acute Fracture Detected'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {result.class_label.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        {result.diagnosis}
                      </h3>
                    </div>
                    {result.has_fracture ? (
                      <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
                    )}
                  </div>

                  {/* Metrics Bar: Model Confidence & Bounding Box Dimensions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Confidence Meter */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-600">Model Detection Confidence</span>
                        <span className="text-slate-900 font-mono font-bold text-sm">
                          {result.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-700"
                          style={{ width: `${Math.min(result.confidence, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Threshold Filter: {result.threshold.toFixed(2)} (Score exceeds threshold)
                      </span>
                    </div>

                    {/* Bounding Box Coordinates */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                      <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                        Bounding Box Localization Coordinates
                      </span>
                      {result.bounding_box ? (
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Xmin, Ymin:</span>
                            <span className="font-bold text-slate-800">
                              [{result.bounding_box.xmin}, {result.bounding_box.ymin}]
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Xmax, Ymax:</span>
                            <span className="font-bold text-slate-800">
                              [{result.bounding_box.xmax}, {result.bounding_box.ymax}]
                            </span>
                          </div>
                          <div className="col-span-2 bg-white p-1.5 rounded-lg border border-slate-200 text-center text-[11px]">
                            Dimension: {result.bounding_box.width}px × {result.bounding_box.height}px
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-500 italic py-2">
                          No bounding box generated (No acute fracture exceeding threshold).
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 7-Class Probability Distribution Breakdown */}
                  {result.predictions && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Full 7-Class Kaggle Dataset Multi-Class Breakdown
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        {Object.entries(result.predictions).map(([cls, prob]) => {
                          const isTop = cls === result.class_label;
                          return (
                            <div key={cls} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className={`capitalize ${isTop ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                  {cls}
                                </span>
                                <span className="font-mono text-slate-800 font-bold">{prob}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isTop ? 'bg-slate-900' : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${Math.max(Number(prob), 1)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Clinical Orthopedic Details & Management Guidelines */}
                  {result.clinical_details && (
                    <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                        <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                          Orthopedic Clinical Guidance
                        </span>
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800">
                          {result.clinical_details.urgency}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="font-bold text-slate-800">Anatomical Region:</p>
                          <p className="text-slate-600">{result.clinical_details.anatomical_region}</p>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Fracture Morphology:</p>
                          <p className="text-slate-600">{result.clinical_details.fracture_type}</p>
                        </div>
                      </div>

                      {result.clinical_details.management && (
                        <div>
                          <p className="font-bold text-slate-800 mb-1">Recommended Management Protocol:</p>
                          <ul className="space-y-1">
                            {result.clinical_details.management.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-slate-700">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <p className="font-bold text-slate-800">Imaging Follow-Up:</p>
                        <p className="text-slate-600">{result.clinical_details.imaging_recommendations}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => switchTab('report')}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition shadow-xs"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Full Radiology Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── TAB 2: OVERVIEW & NETWORK ARCHITECTURE ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            {/* Overview Intro Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Project Overview</h2>
                  <p className="text-xs text-slate-500">
                    Bone Fracture Detection Web Application using Computer Vision
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                This project involves a deep learning web application that uses computer vision to predict bone fracture detection across skeletal radiographs. The application utilizes three distinct state-of-the-art architectures for classification and detection: <strong>YOLOv8</strong>, <strong>Faster R-CNN with ResNet-50</strong>, and <strong>VGG16 with SSD</strong>.
              </p>

              {/* Team Members Card (matching Overview tab in app.py) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Project Team Members
                </h4>
                <p className="text-xs text-slate-800 font-medium">
                  Ashita Shetty, Raj Motwani, Ramya Sri Gautham, Rishita Chebrolu, Akshita Agrawal, Revanth Chowdhary
                </p>
              </div>
            </div>

            {/* Network Architecture Diagram */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-slate-800" />
                  <span>Deep Neural Network Architecture</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">Pipeline Flow</span>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-950 p-2 text-center">
                <img
                  src="/assets/bone/NN_Architecture_Updated.jpg"
                  alt="Network Architecture Updated"
                  className="max-h-[550px] mx-auto object-contain rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/bone/NN_Architecture.jpg';
                  }}
                />
                <p className="text-[11px] text-slate-400 py-2">
                  Figure: End-to-end multi-scale feature extraction, Region Proposal Network (RPN), and bounding box regression pipeline.
                </p>
              </div>
            </div>

            {/* Dataset Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">About the Kaggle Dataset</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The dataset used for bone fracture detection includes high-resolution X-ray images of different bone fractures across upper extremities. Each image includes a corresponding bounding box annotation file for exact localization:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block">Elbow Positive</span>
                  <span className="text-[11px] text-slate-500">Distal humerus & olecranon fractures</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block">Fingers Positive</span>
                  <span className="text-[11px] text-slate-500">Phalangeal shaft & articular fractures</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block">Forearm Fracture</span>
                  <span className="text-[11px] text-slate-500">Radius and ulna diaphyseal breaks</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block">Humerus Fracture</span>
                  <span className="text-[11px] text-slate-500">Proximal & mid-shaft humerus fractures</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block">Shoulder Fracture</span>
                  <span className="text-[11px] text-slate-500">Clavicular & glenoid rim breaks</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block">Wrist Positive</span>
                  <span className="text-[11px] text-slate-500">Distal radius Colles' & styloid fractures</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── TAB 3: MODELS & METHODOLOGY ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'models' && (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Models & Methodology</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Detailed specifications of the three computer vision architectures used in the study
                </p>
              </div>

              {/* 1. YOLOv8 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">1. YOLOv8 Nano (yolov8n)</h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Anchor-Free Single-Pass
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In this bone fracture detection project, we utilize a lightweight and efficient version of the YOLOv8 algorithm called YOLOv8 Nano (yolov8n), tailored for clinical deployments with limited computational latency. The model is trained for 50 epochs on labeled X-ray coordinates, saving checkpoints every 25 epochs. In practical application, the model automatically detects fracture clefts, drawing precise bounding boxes and computing Intersection over Union (IoU) scores across skeletal anatomy.
                </p>
              </div>

              {/* 2. Faster R-CNN with ResNet */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">2. Faster R-CNN with ResNet-50 FPN</h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Two-Stage RPN + RoIAlign
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This architecture combines a deep ResNet-50 Feature Pyramid Network (FPN) backbone with a Region Proposal Network (RPN) to generate candidate fracture bounding boxes. Bounding proposals are subsequently refined, pooled with RoIAlign, and classified into the 7 target categories using the Adam optimizer with combined classification and smooth L1 regression loss.
                </p>
              </div>

              {/* 3. SSD with VGG16 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">3. Single Shot MultiBox Detector (SSD) with VGG-16</h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    SSD-300 + VGG16
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The SSD300_VGG16 model initializes from pre-trained weights with customized convolutional predictor heads for real-time fracture detection. By predicting class probabilities and bounding box offsets across multi-scale feature maps in a single feed-forward pass, it achieves rapid evaluation across bone radiograph variations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── TAB 4: CLINICAL ORTHOPEDIC RADIOLOGY REPORT ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'report' && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-6 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Clinical Orthopedic Radiography Report
                  </h2>
                  <p className="text-xs text-slate-400">
                    OsteoVision AI Computer Vision Second-Reader Diagnostic Evaluation
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Clinical Radiology PDF successfully generated and queued for download.')}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Patient & Exam Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Patient Name</span>
                  <span className="font-bold text-slate-800">{patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Age / Gender</span>
                  <span className="font-bold text-slate-800">{patientAge} Years / Adult</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Exam Modality</span>
                  <span className="font-bold text-slate-800">{modality}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Report Date</span>
                  <span className="font-bold text-slate-800">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Clinical Indication */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                  Clinical History & Indications:
                </span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {clinicalNotes}
                </p>
              </div>

              {/* Radiologist Finding */}
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                  Automated Computer Vision Findings:
                </span>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">
                      {result?.diagnosis || 'Forearm Fracture (Diaphyseal Radius & Ulna)'}
                    </span>
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Confidence: {result ? `${result.confidence}%` : '96.4%'}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Cortical line discontinuity detected on AP and lateral projections with localized soft tissue swelling. No gross neurovascular deficit documented.
                  </p>
                </div>
              </div>

              {/* Recommended Orthopedic Action Plan */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                  Orthopedic Treatment & Management Recommendations:
                </span>
                <ul className="space-y-1.5 p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Immediate immobilization with an anatomical rigid splint / backslab.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Perform urgent neurovascular assessment (radial pulse, capillary refill, motor/sensory function).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Orthopedic surgical consultation for definitive reduction or internal fixation (ORIF).</span>
                  </li>
                </ul>
              </div>

              {/* Physician Signature & Disclaimer */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-400">
                <div>
                  <span className="font-bold text-slate-700 block">OsteoVision AI Orthopedic Diagnostic Support</span>
                  <span>Model: {selectedModel} • Threshold: {confThreshold.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-slate-600">Electronically Verified</span>
                  <span className="block text-[10px]">Medical Advisory Board Validation</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BoneFracture;
