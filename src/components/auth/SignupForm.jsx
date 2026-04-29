import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const LANGS = [
  'Java','Python','JavaScript','TypeScript',
  'C','C++','Go','Rust','Ruby',
];

const s = {
  form: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '14px',
  },
  header: { marginBottom: '4px' },
  title: {
    fontSize:     '24px',
    fontWeight:   '700',
    color:        '#e6edf3',
    marginBottom: '6px',
  },
  subtitle: { fontSize: '14px', color: '#8b949e' },
  row:   { display: 'flex', gap: '12px' },
  label: {
    display:      'block',
    fontSize:     '13px',
    color:        '#8b949e',
    marginBottom: '6px',
    fontWeight:   '500',
  },
  input: {
    width:        '100%',
    padding:      '10px 14px',
    background:   '#161b22',
    border:       '1px solid #30363d',
    borderRadius: '8px',
    color:        '#e6edf3',
    fontSize:     '14px',
    outline:      'none',
  },
  submitBtn: {
    width:        '100%',
    padding:      '11px',
    background:   '#238636',
    border:       '1px solid #2ea043',
    borderRadius: '8px',
    color:        '#fff',
    fontSize:     '14px',
    fontWeight:   '600',
    cursor:       'pointer',
    marginTop:    '4px',
  },
  terms: {
    fontSize:   '12px',
    color:      '#484f58',
    textAlign:  'center',
    lineHeight: '1.5',
  },
  switchText: {
    textAlign: 'center',
    fontSize:  '13px',
    color:     '#8b949e',
  },
  switchLink: {
    color:      '#58a6ff',
    cursor:     'pointer',
    fontWeight: '500',
    background: 'none',
    border:     'none',
    fontSize:   '13px',
  },
};

export default function SignupForm({ onSwitch }) {
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email:    '',
    password: '',
  });
  const [loading, setLoading]       = useState(false);
  const [focusField, setFocusField] = useState('');
  const { loginUser }               = useAuth();
  const navigate                    = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, username, email, password } = form;

    if (!fullName || !username || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      toast.error(
        'Password must be at least 6 characters.'
      );
      return;
    }
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data.data);
      toast.success('Account created! Welcome!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(
        err.response?.data?.message
        || 'Registration failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    ...s.input,
    borderColor:
      focusField === field ? '#58a6ff' : '#30363d',
  });

  return (
    <form style={s.form} onSubmit={handleSubmit}>

      <div style={s.header}>
        <div style={s.title}>Create account</div>
        <div style={s.subtitle}>
          Join thousands of developers on CodeSync
        </div>
      </div>

      <div style={s.row}>
        <div style={{ flex: 1 }}>
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
        <div style={{ flex: 1 }}>
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
          <span style={{
            color:       '#484f58',
            fontWeight:  '400',
            marginLeft:  '6px',
            fontSize:    '12px',
          }}>
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
        {loading
          ? 'Creating account...'
          : 'Create Account'}
      </button>

      <p style={s.terms}>
        By creating an account you agree to our
        Terms of Service and Privacy Policy.
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