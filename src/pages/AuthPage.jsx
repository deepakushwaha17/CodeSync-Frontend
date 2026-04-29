import React, { useState } from 'react';
import LoginForm  from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

const QUOTES = [
  {
    text:   "Code is like humor. When you have to explain it, it's bad.",
    author: 'Cory House',
  },
  {
    text:   'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
  },
  {
    text:   'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
  },
  {
    text:   'The best error message is the one that never shows up.',
    author: 'Thomas Fuchs',
  },
  {
    text:   'Simplicity is the soul of efficiency.',
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
    minHeight:  '100vh',
    background: '#0d1117',
    display:    'flex',
  },

  /* ── Left panel ─────────────────────────────────────── */
  left: {
    flex:            1,
    display:         'flex',
    flexDirection:   'column',
    justifyContent:  'space-between',
    padding:         '60px',
    borderRight:     '1px solid #21262d',
  },
  logo: {
    display:     'flex',
    alignItems:  'center',
    gap:         '12px',
  },
  logoIcon: {
    width:          '40px',
    height:         '40px',
    background:
      'linear-gradient(135deg, #58a6ff, #bc8cff)',
    borderRadius:   '10px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '20px',
  },
  logoName: {
    fontSize:      '22px',
    fontWeight:    '700',
    color:         '#e6edf3',
    letterSpacing: '-0.5px',
  },
  logoSub: {
    fontSize:  '12px',
    color:     '#8b949e',
    marginTop: '2px',
  },
  centerBlock: {
    flex:            1,
    display:         'flex',
    flexDirection:   'column',
    justifyContent:  'center',
  },
  tagline: {
    fontSize:      '48px',
    fontWeight:    '700',
    color:         '#e6edf3',
    lineHeight:    '1.15',
    letterSpacing: '-1.5px',
    marginBottom:  '20px',
  },
  taglineAccent: {
    background:
      'linear-gradient(135deg, #58a6ff, #bc8cff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor:  'transparent',
    backgroundClip:       'text',
  },
  taglineSub: {
    fontSize:    '16px',
    color:       '#8b949e',
    lineHeight:  '1.6',
    maxWidth:    '420px',
    marginBottom:'32px',
  },
  featureList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '14px',
  },
  featureItem: {
    display:    'flex',
    alignItems: 'center',
    gap:        '12px',
    color:      '#8b949e',
    fontSize:   '14px',
  },
  featureDot: {
    width:        '6px',
    height:       '6px',
    borderRadius: '50%',
    background:   '#58a6ff',
    flexShrink:   0,
  },
  quoteBlock: {
    borderLeft:  '3px solid #21262d',
    paddingLeft: '20px',
  },
  quoteText: {
    fontSize:     '14px',
    color:        '#8b949e',
    fontStyle:    'italic',
    lineHeight:   '1.6',
    marginBottom: '8px',
  },
  quoteAuthor: {
    fontSize: '12px',
    color:    '#484f58',
  },

  /* ── Right panel ────────────────────────────────────── */
  right: {
    width:           '480px',
    display:         'flex',
    flexDirection:   'column',
    justifyContent:  'center',
    padding:         '60px 48px',
  },
  tabs: {
    display:      'flex',
    marginBottom: '36px',
    background:   '#161b22',
    borderRadius: '10px',
    padding:      '4px',
    border:       '1px solid #21262d',
  },
  tab: {
    flex:         1,
    padding:      '10px',
    border:       'none',
    borderRadius: '7px',
    background:   'transparent',
    color:        '#8b949e',
    fontSize:     '14px',
    fontWeight:   '500',
    cursor:       'pointer',
    transition:   'all 0.2s',
  },
  tabActive: {
    background: '#21262d',
    color:      '#e6edf3',
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
            { key: 'login',  label: 'Sign In'  },
            { key: 'signup', label: 'Sign Up'  },
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