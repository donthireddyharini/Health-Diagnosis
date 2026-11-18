import React, { useState, useEffect, useRef, useCallback } from 'react';
import { googleAuth } from '../api';

const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  ['403671615206', '40qb7ndhllu53dp80pu8koh6ibc9ko3i.apps.googleusercontent.com'].join('-');

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
    return null;
  }
};

export default function GoogleAuthButton({ mode = 'signin', onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const googleBtnContainerRef = useRef(null);

  // Execute authentication against the Flask backend
  const executeBackendLogin = useCallback(
    async ({ email, name, picture, sub, credential }) => {
      setLoading(true);
      try {
        const response = await googleAuth({
          email,
          name: name || email.split('@')[0],
          picture: picture || '',
          sub: sub || 'google_' + Math.random().toString(36).substring(2, 10),
          credential: credential || undefined,
        });
        if (onSuccess) {
          onSuccess(response.data.access_token, response.data.user);
        }
      } catch (err) {
        console.error('Google backend auth error:', err);
        const msg = err.response?.data?.error || 'Authentication failed. Please try again.';
        if (onError) onError(msg);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  // Handle Google ID Token response (from official Google button click)
  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) return;
      const payload = parseJwt(response.credential);
      if (payload && payload.email) {
        await executeBackendLogin({
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
    [executeBackendLogin, onError]
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

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Official Google Identity Services Button Container */}
      <div
        ref={googleBtnContainerRef}
        className="w-full flex justify-center items-center min-h-[44px]"
      />
      {loading && (
        <div className="text-xs text-teal-600 font-medium mt-2 animate-pulse">
          Authenticating with Google...
        </div>
      )}
    </div>
  );
}
