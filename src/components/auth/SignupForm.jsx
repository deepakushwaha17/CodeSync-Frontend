import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { register, sendOtp } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import OtpForm from './OtpForm';

const s = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    width: '100%',
  },

  header: { marginBottom: '4px' },

  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '6px',
  },

  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },

  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    color: '#374151',
    marginBottom: '6px',
    fontWeight: '500',
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    background: '#ffffff',
    border: '1px solid #dbe3f0',
    borderRadius: '10px',
    color: '#111827',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },

  submitBtn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px',
    boxShadow: '0 10px 20px rgba(37,99,235,0.22)',
  },

  terms: {
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: '1.5',
  },

  switchText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px',
  },

  switchLink: {
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    fontSize: '13px',
  },

  stepRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },

  stepCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
  },

  stepLine: {
    width: '40px',
    height: '2px',
  },
};

export default function SignupForm({ onSwitch }) {
  const [step, setStep] = useState(1);
  const [maskedEmail, setMaskedEmail] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState('');

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  const inputStyle = (field) => ({
    ...s.input,
    borderColor:
      focusField === field ? '#2563eb' : '#dbe3f0',
    boxShadow:
      focusField === field
        ? '0 0 0 4px rgba(37, 99, 235, 0.12)'
        : 'none',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, username, email, password } = form;

    if (!fullName || !username || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const otpRes = await sendOtp(email, 'SIGNUP');

      if (!otpRes.data.success) {
        toast.error(otpRes.data.message);
        return;
      }

      setMaskedEmail(otpRes.data.data?.maskedEmail || email);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to send OTP.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = async () => {
    try {
      const res = await register(form);

      loginUser(res.data.data);

      toast.success('Account created! Welcome to CodeSync!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Registration failed.'
      );
      setStep(1);
    }
  };

  const StepIndicator = () => (
    <div style={s.stepRow}>
      {[1, 2].map((n) => (
        <React.Fragment key={n}>
          <div
            style={{
              ...s.stepCircle,
              background: step >= n ? '#2563eb' : '#e5e7eb',
              color: step >= n ? '#ffffff' : '#6b7280',
            }}
          >
            {step > n ? '✓' : n}
          </div>

          {n < 2 && (
            <div
              style={{
                ...s.stepLine,
                background: step > n ? '#2563eb' : '#d1d5db',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  if (step === 2) {
    return (
      <div>
        <StepIndicator />
        <div style={{ marginTop: '16px' }}>
          <OtpForm
            email={form.email}
            purpose="SIGNUP"
            maskedEmail={maskedEmail}
            onVerified={handleOtpVerified}
            onBack={() => setStep(1)}
          />
        </div>
      </div>
    );
  }

  return (
    <form style={s.form} onSubmit={handleSubmit}>
      <StepIndicator />

      <div style={s.header}>
        <div style={s.title}>Create account</div>
        <div style={s.subtitle}>
          Join thousands of developers on CodeSync
        </div>
      </div>

      <div style={s.row}>
        <div>
          <label style={s.label}>Full Name</label>
          <input
            name="fullName"
            placeholder="John Doe"
            value={form.fullName}
            onChange={handleChange}
            onFocus={() => setFocusField('fullName')}
            onBlur={() => setFocusField('')}
            style={inputStyle('fullName')}
          />
        </div>

        <div>
          <label style={s.label}>Username</label>
          <input
            name="username"
            placeholder="johndoe"
            value={form.username}
            onChange={handleChange}
            onFocus={() => setFocusField('username')}
            onBlur={() => setFocusField('')}
            style={inputStyle('username')}
          />
        </div>
      </div>

      <div>
        <label style={s.label}>Email address</label>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          onFocus={() => setFocusField('email')}
          onBlur={() => setFocusField('')}
          style={inputStyle('email')}
        />
      </div>

      <div>
        <label style={s.label}>
          Password
          <span
            style={{
              color: '#6b7280',
              fontWeight: '400',
              marginLeft: '6px',
              fontSize: '12px',
            }}
          >
            (min 6 characters)
          </span>
        </label>

        <input
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          onFocus={() => setFocusField('password')}
          onBlur={() => setFocusField('')}
          style={inputStyle('password')}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          ...s.submitBtn,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Sending OTP...' : 'Continue →'}
      </button>

      <p style={s.terms}>
        By creating an account you agree to our Terms of Service
        and Privacy Policy.
      </p>

      <div style={s.switchText}>
        Already have an account?{' '}
        <button
          type="button"
          style={s.switchLink}
          onClick={onSwitch}
        >
          Sign in
        </button>
      </div>
    </form>
  );
}