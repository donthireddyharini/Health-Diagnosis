import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Brain,
  Eye,
  Bone,
  Shield,
  ArrowRight,
  FileText,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

function Home({ user }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* ── 1. Hero Section ── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0D7F82]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-teal-300 border border-white/15 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Next-Gen Multi-Modality Medical AI Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Health <span className="text-teal-400">Diagnosis</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Advanced clinical decision-support platform integrating state-of-the-art deep learning and computer vision architectures across <strong>Cranial Oncology (Brain MRI)</strong>, <strong>Retinal Pathology (Eye Fundus)</strong>, and <strong>Skeletal Radiography (Bone Fractures)</strong>.
            </p>

            {/* Fast Launch CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/brain-disease"
                className="px-6 py-3.5 rounded-xl bg-[#0D7F82] hover:bg-[#0c7a7d] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-lg transition transform hover:scale-[1.02]"
              >
                <Brain className="w-4 h-4 text-teal-200" />
                <span>Brain Oncology</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/eye-disease"
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-lg transition transform hover:scale-[1.02]"
              >
                <Eye className="w-4 h-4 text-indigo-200" />
                <span>Retinal Diagnostics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/bone-fracture"
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 border border-slate-700 shadow-lg transition transform hover:scale-[1.02]"
              >
                <Bone className="w-4 h-4 text-amber-300" />
                <span>Bone Fracture CV</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Three Pillar Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 max-w-3xl mx-auto text-left">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-teal-300 text-xs font-bold mb-1">
                  <Brain className="w-4 h-4" />
                  <span>NeuroScan AI</span>
                </div>
                <div className="text-xl font-extrabold text-white">EfficientNet-B0</div>
                <p className="text-[11px] text-slate-300 mt-0.5">Glioma, Meningioma, Pituitary, Normal</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
                  <Eye className="w-4 h-4" />
                  <span>OphthaScan AI</span>
                </div>
                <div className="text-xl font-extrabold text-white">Deep CNN / VGG</div>
                <p className="text-[11px] text-slate-300 mt-0.5">Cataract, Glaucoma, Retinopathy</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
                  <Bone className="w-4 h-4" />
                  <span>OsteoVision AI</span>
                </div>
                <div className="text-xl font-extrabold text-white">YOLOv8 + ResNet</div>
                <p className="text-[11px] text-slate-300 mt-0.5">7 Anatomical Fracture Regions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. The 3 Core Diagnostic Suites ── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D7F82] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Deep Learning Clinical Engines
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Medical Computer Vision Suites
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Engineered for high sensitivity, specificity, and rapid second-reader assistance across cranial, ophthalmic, and orthopedic radiological disciplines.
          </p>
        </div>

        {/* 3 Suites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ── Suite 1: NeuroScan AI (Brain Disease) ── */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D7F82] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Brain className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  EfficientNet-B0 (PyTorch)
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  NeuroScan AI — Brain Tumor Detection
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Deep multi-scale convolutional feature maps for cranial MRI slice ingestion across 4 distinct oncology classifications with 75% confidence safety gating.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Target Pathology:</span>
                  <span className="font-bold">Glioma, Meningioma, Pituitary</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Validation Metric:</span>
                  <span className="font-bold text-teal-700">95.6% Top-1 Accuracy</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Supported Modality:</span>
                  <span className="font-bold">Axial / Coronal / Sagittal MRI</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/brain-disease"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-[#0D7F82] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Launch Brain Oncology</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* ── Suite 2: OphthaScan AI (Eye Disease) ── */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Eye className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  VGG-16 Deep CNN (TensorFlow)
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  OphthaScan AI — Retinal Diagnostics
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Automated digital fundus ophthalmoscopy evaluation analyzing the optic disc, cup-to-disc ratio, vascular topography, and exudative patterns.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Target Pathology:</span>
                  <span className="font-bold">Cataract, DR, Glaucoma, Normal</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Out-of-Distribution:</span>
                  <span className="font-bold text-indigo-700">Automated Unknown Flag</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Supported Modality:</span>
                  <span className="font-bold">Digital Fundus Photography</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/eye-disease"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Launch Retinal Diagnostics</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* ── Suite 3: OsteoVision AI (Bone Fracture) ── */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Bone className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  YOLOv8 • Faster R-CNN • SSD
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  OsteoVision AI — Bone Fracture CV
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Real-time skeletal radiograph fracture detection with live bounding box localization, multi-architecture selection, and calibrated confidence thresholds.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Target Anatomy:</span>
                  <span className="font-bold">Forearm, Wrist, Elbow, Shoulder</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Localization:</span>
                  <span className="font-bold text-amber-700">Live Bounding Box Overlay</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Threshold Control:</span>
                  <span className="font-bold">Interactive 0.00 – 1.00 Slider</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/bone-fracture"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Launch Bone Fracture CV</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Clinical Workflow & Standards ── */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Rigorous Standards for AI Decision-Support
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Built to assist clinical workflows, minimize diagnostic turnaround time, and improve second-reader diagnostic certainty.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0D7F82] flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Safety Gating Protocols</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Predictions that do not meet strict confidence gates are systematically flagged as inconclusive to avoid false positives.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Clinical PDF Reports</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Export comprehensive diagnostic summaries with patient identifiers, modality notes, certainty scores, and recommendations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">1-Click Benchmark Cases</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Standardized golden-standard clinical benchmark cases allow instant system testing and validation on live scans.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Sub-Second Inference</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Optimized lightweight convolutional backbones deliver rapid inference across CPU and hardware accelerators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Footer ── */}
      <footer className="bg-slate-950 text-slate-400 py-12 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0D7F82] text-white flex items-center justify-center">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Health <span className="text-[#0D7F82]">Diagnosis</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-300">
              <Link to="/brain-disease" className="hover:text-white transition">Brain Disease</Link>
              <Link to="/eye-disease" className="hover:text-white transition">Eye Disease</Link>
              <Link to="/bone-fracture" className="hover:text-white transition">Bone Fracture</Link>
              <Link to="/login" className="hover:text-white transition">Sign In</Link>
              <Link to="/register" className="hover:text-white transition">Register</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Health Diagnosis AI. All rights reserved.</p>
            <p className="text-center sm:text-right max-w-xl text-[11px] leading-relaxed">
              Medical Disclaimer: This system is intended for educational and computer-aided decision support. It is not an autonomous diagnostic device. Always consult certified healthcare specialists.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
