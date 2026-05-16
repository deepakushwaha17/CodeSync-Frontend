import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const s = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },

  header: {
    marginBottom: '4px',
  },

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

  oauthRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    width: '100%',
    marginBottom: '4px',
  },

  oauthBtn: {
    width: '100%',
    padding: '12px 14px',
    background: '#ffffff',
    border: '1px solid #dbe3f0',
    borderRadius: '10px',
    color: '#111827',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },

  divider: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '13px',
    margin: '6px 0',
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
    boxShadow: '0 10px 20px rgba(37, 99, 235, 0.22)',
    transition: 'all 0.2s ease',
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
};

export default function LoginForm({ onSwitch }) {
  const [form, setForm] = useState({
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(form);

      loginUser(res.data.data);

      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Login failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href =
      `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  const handleHoverIn = (e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow =
      '0 10px 20px rgba(15,23,42,0.08)';
  };

  const handleHoverOut = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <form style={s.form} onSubmit={handleSubmit}>
      <div style={s.header}>
        <div style={s.title}>Welcome back</div>
        <div style={s.subtitle}>
          Sign in to your CodeSync account
        </div>
      </div>

      <div style={s.oauthRow}>
        <button
          type="button"
          style={s.oauthBtn}
          onClick={() => handleOAuth('github')}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="#111827"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31
              3.435 9.795 8.205 11.385.6.105.825-.255
              .825-.57 0-.285-.015-1.23-.015-2.235-3.015
              .555-3.795-.735-4.035-1.41-.135-.345-.72
              -1.41-1.23-1.695-.42-.225-1.02-.78-.015
              -.795.945-.015 1.62.87 1.845 1.23 1.08
              1.815 2.805 1.305 3.495.99.105-.78.42
              -1.305.765-1.605-2.67-.3-5.46-1.335-5.46
              -5.925 0-1.305.465-2.385 1.23-3.225-.12
              -.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3
              1.23.96-.27 1.98-.405 3-.405s2.04.135 3
              .405c2.295-1.56 3.3-1.23 3.3-1.23.66
              1.65.24 2.88.12 3.18.765.84 1.23 1.905
              1.23 3.225 0 4.605-2.805 5.625-5.475
              5.925.435.375.81 1.095.81 2.22 0 1.605
              -.015 2.895-.015 3.3 0 .315.225.69.825
              .57A12.02 12.02 0 0 0 24 12c0-6.63-5.37
              -12-12-12z" />
          </svg>
          GitHub
        </button>

        <button
          type="button"
          style={s.oauthBtn}
          onClick={() => handleOAuth('google')}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
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
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
      </div>

      <div style={s.divider}>or continue with email</div>

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
          style={{
            ...s.input,
            borderColor:
              focusField === 'email' ? '#2563eb' : '#dbe3f0',
            boxShadow:
              focusField === 'email'
                ? '0 0 0 4px rgba(37, 99, 235, 0.12)'
                : 'none',
          }}
        />
      </div>

      <div>
        <label style={s.label}>Password</label>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          onFocus={() => setFocusField('password')}
          onBlur={() => setFocusField('')}
          style={{
            ...s.input,
            borderColor:
              focusField === 'password'
                ? '#2563eb'
                : '#dbe3f0',
            boxShadow:
              focusField === 'password'
                ? '0 0 0 4px rgba(37, 99, 235, 0.12)'
                : 'none',
          }}
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
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div style={s.switchText}>
        Don't have an account?{' '}
        <button
          type="button"
          style={s.switchLink}
          onClick={onSwitch}
        >
          Sign up
        </button>
      </div>
    </form>
  );
}