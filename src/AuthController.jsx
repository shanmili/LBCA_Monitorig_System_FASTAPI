import { useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OTPScreen from './screens/OTPScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPassword';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';
const DEMO_EMAILS = ['demo.admin@lbca.edu.ph', 'demo.teacher@lbca.edu.ph'];

const DEVICE_ID = (() => {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('device_id', id);
  }
  return id;
})();

function getDeviceId(email) {
  if (DEMO_EMAILS.includes(email)) {
    return 'DEMO-DEVICE-NO-OTP-2024';
  }
  return DEVICE_ID;
}

/**
 * AuthController manages all pre-login screens:
 * login → (2FA OTP) → app
 * login → forgot password → OTP → reset password → login
 * login → register → pending approval page
 *
 * Props:
 *   onAuthSuccess(accessToken, refreshToken, user) — called when fully authenticated
 */
const AuthController = ({ onAuthSuccess }) => {
  const [screen, setScreen] = useState('login');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Shared state across steps
  const [pendingUserId, setPendingUserId] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingOtpCode, setPendingOtpCode] = useState('');

  const clearError = () => setError('');

  // ─── Login ───────────────────────────────────────────────
  const handleLogin = async (email, password) => {
    setIsLoading(true);
    clearError();
    try {
      const res = await fetch(`${API_BASE}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          device_id: getDeviceId(email),
          device_name: navigator.userAgent.slice(0, 100),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.detail) || 'Login failed');

      if (data.requires_2fa) {
        setPendingUserId(data.user_id);
        setPendingEmail(email);
        setScreen('otp-login');
      } else {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        onAuthSuccess(data.access_token, data.refresh_token, data.user);
      }
    } catch (err) {
      setError(err.message || err.toString() || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── 2FA Verify (login) ───────────────────────────────────
  const handleVerifyLoginOtp = async (code) => {
    setIsLoading(true);
    clearError();
    try {
      const res = await fetch(`${API_BASE}/api/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: pendingUserId,
          code,
          device_id: DEVICE_ID,
          device_name: navigator.userAgent.slice(0, 100),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.detail) || 'Invalid OTP');

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      onAuthSuccess(data.access_token, data.refresh_token, data.user);
    } catch (err) {
      setError(err.message || err.toString() || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLoginOtp = async () => {
    // Re-trigger login to resend OTP — uses stored email
    // A real implementation would have a dedicated resend endpoint
    clearError();
  };

  // ─── Registration ─────────────────────────────────────────
  const handleRegister = async (formData) => {
    setIsLoading(true);
    clearError();
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.detail) || 'Registration failed');
      // RegisterScreen handles its own success state
    } catch (err) {
      setError(err.message || err.toString() || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Forgot Password ──────────────────────────────────────
  const handleForgotPassword = async (email, proceedToOtp = false) => {
    if (proceedToOtp) {
      setPendingEmail(email);
      setScreen('otp-reset');
      return;
    }
    setIsLoading(true);
    clearError();
    try {
      const res = await fetch(`${API_BASE}/api/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.detail) || 'Request failed');
      setPendingEmail(email);
      // ForgotPasswordScreen shows success + "Enter OTP" button
    } catch (err) {
      setError(err.message || err.toString() || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Verify Reset OTP ─────────────────────────────────────
  const handleVerifyResetOtp = async (code) => {
    // We just store the code and move to new password screen
    // The actual validation happens when submitting the new password
    setPendingOtpCode(code);
    clearError();
    setScreen('reset-password');
  };

  const handleResendResetOtp = async () => {
    await handleForgotPassword(pendingEmail);
  };

  // ─── Reset Password ───────────────────────────────────────
  const handleResetPassword = async ({ token, new_password, confirm_password }) => {
    setIsLoading(true);
    clearError();
    try {
      const res = await fetch(`${API_BASE}/api/password-reset`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password, confirm_password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.detail) || 'Reset failed');
      setScreen('login');
      // Optionally show a success toast here
    } catch (err) {
      setError(err.message || err.toString() || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────
  switch (screen) {
    case 'login':
      return (
        <LoginScreen
          onLogin={handleLogin}
          onForgotPassword={() => { clearError(); setScreen('forgot-password'); }}
          onRegister={() => { clearError(); setScreen('register'); }}
          error={error}
          isLoading={isLoading}
        />
      );

    case 'register':
      return (
        <RegisterScreen
          onRegister={handleRegister}
          onBack={() => { clearError(); setScreen('login'); }}
          error={error}
          isLoading={isLoading}
        />
      );

    case 'otp-login':
      return (
        <OTPScreen
          onVerify={handleVerifyLoginOtp}
          onResend={handleResendLoginOtp}
          onBack={() => { clearError(); setScreen('login'); }}
          error={error}
          isLoading={isLoading}
          email={pendingEmail}
          purpose="login"
        />
      );

    case 'forgot-password':
      return (
        <ForgotPasswordScreen
          onSubmit={handleForgotPassword}
          onBack={() => { clearError(); setScreen('login'); }}
          error={error}
          isLoading={isLoading}
        />
      );

    case 'otp-reset':
      return (
        <OTPScreen
          onVerify={handleVerifyResetOtp}
          onResend={handleResendResetOtp}
          onBack={() => { clearError(); setScreen('forgot-password'); }}
          error={error}
          isLoading={isLoading}
          email={pendingEmail}
          purpose="password-reset"
        />
      );

    case 'reset-password':
      return (
        <ResetPasswordScreen
          onSubmit={handleResetPassword}
          onBack={() => { clearError(); setScreen('otp-reset'); }}
          error={error}
          isLoading={isLoading}
          otpCode={pendingOtpCode}
        />
      );

    default:
      return null;
  }
};

export default AuthController;