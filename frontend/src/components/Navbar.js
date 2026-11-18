import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Activity,
  FileText,
  ChevronDown,
  Brain,
  Cpu,
  Shield,
  Eye,
  FlaskConical,
  Bone,
  Layers,
  LogIn,
  UserPlus,
  LogOut
} from 'lucide-react';

function Navbar({ user, logout }) {
  const [brainDropdownOpen, setBrainDropdownOpen] = useState(false);
  const [eyeDropdownOpen, setEyeDropdownOpen] = useState(false);
  const [boneDropdownOpen, setBoneDropdownOpen] = useState(false);

  const brainDropdownRef = useRef(null);
  const eyeDropdownRef = useRef(null);
  const boneDropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (brainDropdownRef.current && !brainDropdownRef.current.contains(event.target)) {
        setBrainDropdownOpen(false);
      }
      if (eyeDropdownRef.current && !eyeDropdownRef.current.contains(event.target)) {
        setEyeDropdownOpen(false);
      }
      if (boneDropdownRef.current && !boneDropdownRef.current.contains(event.target)) {
        setBoneDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setBrainDropdownOpen(false);
    setEyeDropdownOpen(false);
    setBoneDropdownOpen(false);
  }, [location.pathname, location.search]);

  const brainNavItems = [
    { name: 'Brain Tumor Detection', path: '/brain-disease', icon: Brain },
    { name: 'Model Specifications', path: '/brain-disease?tab=specs', icon: Cpu },
    { name: 'Safety & Methodology', path: '/brain-disease?tab=safety', icon: Shield },
    { name: 'Clinical Report', path: '/brain-disease?tab=report', icon: FileText },
  ];

  const eyeNavItems = [
    { name: 'Eye Disease Detection', path: '/eye-disease', icon: Eye },
    { name: 'About Eye Diseases', path: '/eye-disease?tab=info', icon: BookOpen },
    { name: 'How AI Model Works', path: '/eye-disease?tab=how-it-works', icon: FlaskConical },
    { name: 'Clinical Report', path: '/eye-disease?tab=report', icon: FileText },
  ];

  const boneNavItems = [
    { name: 'Bone Fracture Detection', path: '/bone-fracture', icon: Bone },
    { name: 'Overview & Architecture', path: '/bone-fracture?tab=overview', icon: Layers },
    { name: 'Models & Methodology', path: '/bone-fracture?tab=models', icon: Cpu },
    { name: 'Clinical Radiology Report', path: '/bone-fracture?tab=report', icon: FileText },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand Name: Health Diagnosis */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0D7F82] to-teal-500 text-white flex items-center justify-center shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                Health <span className="text-[#0D7F82]">Diagnosis</span>
              </span>
            </Link>
          </div>

          {/* Header Action Tabs: Brain Disease, Eye Disease & Bone Fracture + Login Options */}
          <div className="flex items-center space-x-2.5">
            {/* ── 1. Brain Disease Dropdown Tab ── */}
            <div className="relative" ref={brainDropdownRef}>
              <button
                onClick={() => {
                  if (!user) {
                    navigate('/login', { state: { from: '/brain-disease' } });
                    return;
                  }
                  setBrainDropdownOpen((prev) => !prev);
                  setEyeDropdownOpen(false);
                  setBoneDropdownOpen(false);
                }}
                aria-expanded={brainDropdownOpen}
                className="flex items-center space-x-1.5 sm:space-x-2 bg-[#0D7F82] hover:bg-[#0c7a7d] active:bg-[#075558] text-white px-3 py-2 rounded-lg font-medium shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#0D7F82] focus:ring-offset-2"
              >
                <Brain className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-semibold">Brain Disease</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    brainDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Brain Dropdown Card */}
              {brainDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100 bg-[#EAF5F5]/60 rounded-t-lg mb-1">
                    <p className="text-xs text-[#0D7F82] uppercase tracking-wider font-bold">NeuroScan AI</p>
                    <p className="text-xs text-gray-500">Brain Tumor & Cancer Classification</p>
                  </div>

                  <div className="py-1">
                    {brainNavItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive =
                        location.pathname === item.path.split('?')[0] &&
                        location.search === (item.path.split('?')[1] ? `?${item.path.split('?')[1]}` : '');

                      return (
                        <Link
                          key={item.name + index}
                          to={user ? item.path : "/login"}
                          state={!user ? { from: item.path } : undefined}
                          onClick={() => setBrainDropdownOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-[#EAF5F5] text-[#0D7F82] font-semibold'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-[#0D7F82]'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${isActive ? 'text-[#0D7F82]' : 'text-gray-500'}`} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── 2. Eye Disease Dropdown Tab ── */}
            <div className="relative" ref={eyeDropdownRef}>
              <button
                onClick={() => {
                  if (!user) {
                    navigate('/login', { state: { from: '/eye-disease' } });
                    return;
                  }
                  setEyeDropdownOpen((prev) => !prev);
                  setBrainDropdownOpen(false);
                  setBoneDropdownOpen(false);
                }}
                aria-expanded={eyeDropdownOpen}
                className="flex items-center space-x-1.5 sm:space-x-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-2 rounded-lg font-medium shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Eye className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-semibold">Eye Disease</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    eyeDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Eye Dropdown Card */}
              {eyeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100 bg-indigo-50/70 rounded-t-lg mb-1">
                    <p className="text-xs text-indigo-700 uppercase tracking-wider font-bold">OphthaScan AI</p>
                    <p className="text-xs text-gray-500">Retinal Disease &amp; VGG16 Classification</p>
                  </div>

                  <div className="py-1">
                    {eyeNavItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive =
                        location.pathname === item.path.split('?')[0] &&
                        location.search === (item.path.split('?')[1] ? `?${item.path.split('?')[1]}` : '');

                      return (
                        <Link
                          key={item.name + index}
                          to={user ? item.path : "/login"}
                          state={!user ? { from: item.path } : undefined}
                          onClick={() => setEyeDropdownOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-700 font-semibold'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── 3. Bone Fracture Dropdown Tab ── */}
            <div className="relative" ref={boneDropdownRef}>
              <button
                onClick={() => {
                  if (!user) {
                    navigate('/login', { state: { from: '/bone-fracture' } });
                    return;
                  }
                  setBoneDropdownOpen((prev) => !prev);
                  setBrainDropdownOpen(false);
                  setEyeDropdownOpen(false);
                }}
                aria-expanded={boneDropdownOpen}
                className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white px-3 py-2 rounded-lg font-medium shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
              >
                <Bone className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-semibold">Bone Fracture</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    boneDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Bone Dropdown Card */}
              {boneDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100 bg-slate-100/80 rounded-t-lg mb-1">
                    <p className="text-xs text-slate-800 uppercase tracking-wider font-bold">OsteoVision AI</p>
                    <p className="text-xs text-gray-500">Bone Fracture Detection & Localization</p>
                  </div>

                  <div className="py-1">
                    {boneNavItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive =
                        location.pathname === item.path.split('?')[0] &&
                        location.search === (item.path.split('?')[1] ? `?${item.path.split('?')[1]}` : '');

                      return (
                        <Link
                          key={item.name + index}
                          to={user ? item.path : "/login"}
                          state={!user ? { from: item.path } : undefined}
                          onClick={() => setBoneDropdownOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-slate-100 text-slate-900 font-semibold'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-slate-900'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${isActive ? 'text-slate-900' : 'text-gray-500'}`} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── 4. Login / Sign In & User Account Options ── */}
            <div className="pl-1 sm:pl-2 border-l border-gray-200 flex items-center gap-1.5 sm:gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden md:block">
                    <p className="text-xs font-bold text-gray-900 truncate max-w-[120px]">
                      {user.full_name || user.username}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-1"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    to="/login"
                    className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs font-bold text-gray-700 hover:text-[#0D7F82] hover:bg-gray-100 transition flex items-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#0D7F82]" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:flex px-3.5 py-2 rounded-lg text-xs font-bold bg-[#0D7F82] text-white hover:bg-[#0c7a7d] shadow-xs transition items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
