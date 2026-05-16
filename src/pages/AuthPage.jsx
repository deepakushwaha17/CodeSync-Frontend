import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

const QUOTES = [
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: 'Cory House',
  },
  {
    text: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
  },
  {
    text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
  },
  {
    text: 'The best error message is the one that never shows up.',
    author: 'Thomas Fuchs',
  },
  {
    text: 'Simplicity is the soul of efficiency.',
    author: 'Austin Freeman',
  },
];

const QUOTE =
  QUOTES[Math.floor(Math.random() * QUOTES.length)];

const FEATURES = [
  'Live collaborative code editing',
  'Sandboxed multi-language execution',
  'Git-inspired snapshot versioning',
  'Inline code review and comments',
  'Real-time cursor presence',
];

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fbff, #eef4ff)',
    display: 'grid',
    gridTemplateColumns: '1fr 480px',
    alignItems: 'center',
    padding: '40px',
    gap: '40px',
  },

  left: {
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '48px',
    background: '#ffffffcc',
    borderRadius: '28px',
    border: '1px solid #e5eaf5',
    boxShadow: '0 20px 50px rgba(37, 99, 235, 0.08)',
  },

  right: {
    width: '100%',
    maxWidth: '480px',
    padding: '36px',
    background: 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(14px)',
    borderRadius: '28px',
    border: '1px solid #e5eaf5',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.10)',
  },

  logoName: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
  },

  logoSub: {
    fontSize: '12px',
    color: '#6b7280',
  },

  tagline: {
    fontSize: 'clamp(42px, 5vw, 74px)',
    fontWeight: '800',
    color: '#111827',
    lineHeight: '1.12',
    letterSpacing: '-1.5px',
    marginBottom: '22px',
  },

  taglineSub: {
    fontSize: '17px',
    color: '#4b5563',
    lineHeight: '1.7',
    maxWidth: '520px',
    marginBottom: '32px',
  },

  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#374151',
    fontSize: '15px',
  },

  quoteText: {
    fontSize: '14px',
    color: '#4b5563',
    fontStyle: 'italic',
    lineHeight: '1.6',
    marginBottom: '8px',
  },

  quoteAuthor: {
    fontSize: '12px',
    color: '#6b7280',
  },

  tabs: {
    display: 'flex',
    marginBottom: '36px',
    background: '#eef2ff',
    borderRadius: '14px',
    padding: '5px',
    border: '1px solid #dbe3f0',
  },

  tabActive: {
    background: '#ffffff',
    color: '#2563eb',
    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.12)',
  },
  tab: {
    flex: 1,
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    background: 'transparent',
    color: '#64748b',
    fontSize: '15px',
    fontWeight: '600',
    transition: '0.2s ease',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },

  logoIcon: {
    width: '54px',
    height: '54px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: '#fff',
    boxShadow: '0 10px 25px rgba(37,99,235,0.25)',
  },

  centerBlock: {
    maxWidth: '620px',
  },

  taglineAccent: {
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  featureDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#2563eb',
    flexShrink: 0,
  },

  quoteBlock: {
    borderLeft: '3px solid #dbeafe',
    paddingLeft: '18px',
  },
};

export default function AuthPage() {
  const [tab, setTab] = useState('login');

  return (
    <div style={s.page}>

      {/* ── Left ─────────────────────────────────────── */}
      <div style={s.left}>

        {/* Logo */}
        <div style={s.logo}>
          <div style={s.logoIcon}>⚡</div>
          <div>
            <div style={s.logoName}>CodeSync</div>
            <div style={s.logoSub}>
              Online Code Collaboration
            </div>
          </div>
        </div>

        {/* Tagline + features */}
        <div style={s.centerBlock}>
          <div style={s.tagline}>
            Code Together.<br />
            <span style={s.taglineAccent}>
              Build Faster.
            </span>
            <br />
            Ship Smarter.
          </div>

          <p style={s.taglineSub}>
            A real-time collaborative coding platform
            where teams write, execute, review, and
            version-control code — all from the browser.
          </p>

          <div style={s.featureList}>
            {FEATURES.map((f) => (
              <div key={f} style={s.featureItem}>
                <div style={s.featureDot} />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div style={s.quoteBlock}>
          <p style={s.quoteText}>"{QUOTE.text}"</p>
          <p style={s.quoteAuthor}>— {QUOTE.author}</p>
        </div>
      </div>

      {/* ── Right ────────────────────────────────────── */}
      <div style={s.right}>

        {/* Tabs */}
        <div style={s.tabs}>
          {[
            { key: 'login', label: 'Sign In' },
            { key: 'signup', label: 'Sign Up' },
          ].map((t) => (
            <button
              key={t.key}
              style={{
                ...s.tab,
                ...(tab === t.key ? s.tabActive : {}),
              }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        {tab === 'login'
          ? <LoginForm
            onSwitch={() => setTab('signup')}
          />
          : <SignupForm
            onSwitch={() => setTab('login')}
          />
        }
      </div>
    </div>
  );
}