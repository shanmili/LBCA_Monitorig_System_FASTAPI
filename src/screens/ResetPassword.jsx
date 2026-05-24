import { useState } from 'react';
import '../styles/Login.css';
import { Eye, EyeOff } from 'lucide-react';

const ResetPasswordScreen = ({ onSubmit, onBack, error, isLoading, otpCode }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState('');

  const passwordStrength = (pwd) => {
    if (!pwd) return { label: '', color: '' };
    if (pwd.length < 6) return { label: 'Too short', color: '#EF4444' };
    if (pwd.length < 8) return { label: 'Weak', color: '#F59E0B' };
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNum = /\d/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length;
    if (score === 3) return { label: 'Strong', color: '#10B981' };
    if (score >= 1) return { label: 'Good', color: '#3B82F6' };
    return { label: 'Weak', color: '#F59E0B' };
  };

  const strength = passwordStrength(newPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    onSubmit({ token: otpCode, new_password: newPassword, confirm_password: confirmPassword });
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">
            <span className="logo-text">L</span>
          </div>
          <h1 className="title">New Password</h1>
          <p className="subtitle">Create a strong new password for your account.</p>
        </div>

        {(error || localError) && (
          <div className="error-message">{error || localError}</div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="password-wrapper">
              <input
                type={showNew ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newPassword && (
              <div className="password-strength">
                <div
                  className="strength-bar"
                  style={{
                    width: strength.label === 'Too short' ? '20%'
                      : strength.label === 'Weak' ? '35%'
                      : strength.label === 'Good' ? '65%'
                      : '100%',
                    backgroundColor: strength.color,
                  }}
                />
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <span className="field-error">Passwords do not match</span>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <span className="field-success">Passwords match</span>
            )}
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={isLoading || !newPassword || !confirmPassword}
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="login-footer">
          <button type="button" className="back-link" onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;