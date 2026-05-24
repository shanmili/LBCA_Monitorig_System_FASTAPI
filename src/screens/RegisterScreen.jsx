import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/Login.css';

const RegisterScreen = ({ onRegister, onBack, error, isLoading }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    contact_number: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const passwordStrength = (pwd) => {
    if (!pwd) return { label: '', color: '', width: '0%' };
    if (pwd.length < 6) return { label: 'Too short', color: '#EF4444', width: '20%' };
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score === 4) return { label: 'Good', color: '#10B981', width: '100%' };
    if (score >= 2) return { label: 'Weak', color: '#F59E0B', width: '35%' };
    return { label: 'Weak', color: '#F59E0B', width: '35%' };
  };

  const strength = passwordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (form.password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (!/[a-z]/.test(form.password)) {
      setLocalError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setLocalError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/\d/.test(form.password)) {
      setLocalError('Password must contain at least one number.');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) {
      setLocalError('Password must contain at least one special character.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setLocalError('Passwords do not match.');
      return;
    }
    try {
      await onRegister({
        first_name: form.first_name,
        last_name: form.last_name,
        middle_name: form.middle_name || undefined,
        email: form.email,
        contact_number: form.contact_number,
        password: form.password,
      });
      setSuccess(true);
    } catch (_) {}
  };

  if (success && !error) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-circle success-icon">
              <span className="logo-text">✓</span>
            </div>
            <h1 className="title">Registration Submitted</h1>
            <p className="subtitle">
              Your account is pending admin approval. You'll be notified once your account is approved.
            </p>
          </div>
          <div className="pending-info">
            <div className="pending-step">
              <span className="step-dot done">1</span>
              <span>Registration submitted</span>
            </div>
            <div className="pending-step">
              <span className="step-dot pending">2</span>
              <span>Waiting for admin approval</span>
            </div>
            <div className="pending-step">
              <span className="step-dot">3</span>
              <span>Account activated — you can log in</span>
            </div>
          </div>
          <button type="button" className="btn-submit" onClick={onBack}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="login-card register-card">
        <div className="login-header">
          <div className="logo-circle">
            <span className="logo-text">L</span>
          </div>
          <h1 className="title">Create Account</h1>
          <p className="subtitle">Register as a teacher — requires admin approval.</p>
        </div>

        {(error || localError) && (
          <div className="error-message">{error || localError}</div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="Juan"
                value={form.first_name}
                onChange={set('first_name')}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="Dela Cruz"
                value={form.last_name}
                onChange={set('last_name')}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Middle Name <span className="optional">(optional)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Santos"
              value={form.middle_name}
              onChange={set('middle_name')}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <input
              type="email"
              className="form-input"
              placeholder="teacher@lbca.edu.ph"
              value={form.email}
              onChange={set('email')}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number <span className="required">*</span></label>
            <input
              type="tel"
              className="form-input"
              placeholder="+639123456789"
              value={form.contact_number}
              onChange={set('contact_number')}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password <span className="required">*</span></label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set('password')}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
              {form.password && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
            {form.password && (
              <div className="password-strength">
                <div className="strength-bar" style={{ width: strength.width, backgroundColor: strength.color }} />
                <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password <span className="required">*</span></label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter password"
                value={form.confirm_password}
                onChange={set('confirm_password')}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
              {form.confirm_password && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
            {form.confirm_password && form.password !== form.confirm_password && (
              <span className="field-error">Passwords do not match</span>
            )}
            {form.confirm_password && form.password === form.confirm_password && (
              <span className="field-success">Passwords match</span>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Registering...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="register-prompt">
            Already have an account?{' '}
            <button type="button" className="register-link" onClick={onBack}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;