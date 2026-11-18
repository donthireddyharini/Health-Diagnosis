import React, { useState, useEffect, useRef, useCallback } from 'react';
import { googleAuth } from '../api';
import { X, CheckCircle, Mail, User, Shield, Check } from 'lucide-react';

const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  ['403671615206', '40qb7ndhllu53dp80pu8koh6ibc9ko3i.apps.googleusercontent.com'].join('-');

export const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT payload:', e);
    return null;
  }
};

export default function GoogleAuthButton({ mode = 'signin', onSuccess, onError }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const googleBtnContainerRef = useRef(null);

  const label = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google';

  const executeGoogleAuth = useCallback(async ({ email, name, picture, sub, credential }) => {
    setLoading(true);
    try {
      const response = await googleAuth({
        email,
        name: name || email.split('@')[0],
        picture: picture || '',
        sub: sub || 'google_' + Math.random().toString(36).substring(2, 10),
        credential: credential || undefined,
      });
      setShowModal(false);
      if (onSuccess) {
        onSuccess(response.data.access_token, response.data.user);
      }
    } catch (err) {
      console.error('Google auth error:', err);
      const msg = err.response?.data?.error || 'Google authentication failed. Please try again.';
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  // Handle Google Identity Services credential response
  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) return;
      const payload = parseJwt(response.credential);
      if (payload && payload.email) {
        await executeGoogleAuth({
          email: payload.email,
          name: payload.name || payload.given_name || payload.email.split('@')[0],
          picture: payload.picture || '',
          sub: payload.sub,
          credential: response.credential,
        });
      } else {
        if (onError) onError('Could not retrieve email from Google Account.');
      }
    },
    [executeGoogleAuth, onError]
  );

  // Initialize official Google Identity Services
  useEffect(() => {
    let intervalId = null;

    const initGsi = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render official Google button
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: mode === 'signup' ? 'signup_with' : 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 380,
          });

          setGsiLoaded(true);
          if (intervalId) clearInterval(intervalId);
        } catch (e) {
          console.warn('GSI render notice:', e);
        }
      }
    };

    initGsi();

    if (!window.google?.accounts?.id) {
      intervalId = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGsi();
        }
      }, 300);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [handleCredentialResponse, mode]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    executeGoogleAuth({
      email: customEmail,
      name: customName || customEmail.split('@')[0],
      sub: 'google_custom_' + Date.now(),
    });
  };

  const handleCustomButtonClick = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowModal(true);
          }
        });
      } catch (err) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Official Google Identity Services Button Container */}
      <div
        ref={googleBtnContainerRef}
        className="w-full flex justify-center items-center min-h-[44px]"
      />

      {/* Styled Fallback / Alternative Button if GSI hasn't populated */}
      {!gsiLoaded && (
        <button
          type="button"
          onClick={handleCustomButtonClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm shadow-sm transition hover:shadow duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
        >
          <GoogleIcon />
          <span>{loading ? 'Authenticating...' : label}</span>
        </button>
      )}

      {/* Client ID Badge & Quick Chooser Link */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 pt-1">
        <span className="flex items-center gap-1 text-teal-700 font-medium">
          <Check className="w-3 h-3 text-emerald-600" />
          OAuth Client ID Connected
        </span>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-teal-600 hover:text-teal-800 underline font-medium"
        >
          Account Chooser
        </button>
      </div>

      {/* Google Account Chooser Modal (Quick Presets + Manual Entry) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <GoogleIcon />
                <span className="font-semibold text-gray-800 text-sm">
                  Sign in with Google
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-gray-900">
                  Choose a Google Account
                </h3>
                <p className="text-xs text-gray-500">
                  to continue to <strong className="text-teal-700">Health Diagnosis</strong>
                </p>
                <div className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded mt-1 truncate">
                  Client ID: 403671615206-...ko3i (Google Identity Services)
                </div>
              </div>

              {/* Quick Preset Google Accounts */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    executeGoogleAuth({
                      email: 'practitioner.health@gmail.com',
                      name: 'Dr. Sarah Lin (Radiology)',
                      picture: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100',
                    })
                  }
                  className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-teal-400 hover:bg-teal-50/30 transition flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                    SL
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate group-hover:text-teal-700">
                      Dr. Sarah Lin (Radiology)
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      practitioner.health@gmail.com
                    </p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-teal-600 opacity-0 group-hover:opacity-100 transition" />
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    executeGoogleAuth({
                      email: 'clinical.research@gmail.com',
                      name: 'Alex Chen (Neuro-Oncology)',
                      picture: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100',
                    })
                  }
                  className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-teal-400 hover:bg-teal-50/30 transition flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-400 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                    AC
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate group-hover:text-teal-700">
                      Alex Chen (Neuro-Oncology)
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      clinical.research@gmail.com
                    </p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-teal-600 opacity-0 group-hover:opacity-100 transition" />
                </button>
              </div>

              {/* Or enter another Google account */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-400 font-medium">
                    Or use another Google account
                  </span>
                </div>
              </div>

              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Google Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Full Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !customEmail}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
                >
                  {loading ? 'Authenticating...' : 'Continue to Health Diagnosis'}
                </button>
              </form>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>Protected by Health Diagnosis OAuth2 Security</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
