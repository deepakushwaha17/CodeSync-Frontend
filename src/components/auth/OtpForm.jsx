import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { sendOtp, verifyOtp } from '../../api/authApi';

console.log("OtpForm rendered");

const s = {
  wrapper: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '20px',
  },
  header: { marginBottom: '4px' },
  title: {
    fontSize:     '24px',
    fontWeight:   '700',
    color:        '#e6edf3',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize:   '14px',
    color:      '#8b949e',
    lineHeight: '1.6',
  },
  maskedEmail: {
    color:      '#58a6ff',
    fontWeight: '600',
  },
  otpRow: {
    display:        'flex',
    gap:            '10px',
    justifyContent: 'center',
    margin:         '8px 0',
  },
  otpInput: {
    width:        '48px',
    height:       '56px',
    textAlign:    'center',
    fontSize:     '22px',
    fontWeight:   '700',
    fontFamily:   'JetBrains Mono, monospace',
    background:   '#161b22',
    border:       '2px solid #30363d',
    borderRadius: '10px',
    color:        '#e6edf3',
    outline:      'none',
    transition:   'border-color 0.2s',
  },
  otpInputActive: {
    borderColor: '#58a6ff',
  },
  timer: {
    textAlign:  'center',
    fontSize:   '13px',
    color:      '#8b949e',
  },
  timerCount: {
    color:      '#58a6ff',
    fontWeight: '600',
  },
  expiredText: {
    color: '#f85149',
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
  },
  resendBtn: {
    width:      '100%',
    padding:    '10px',
    background: 'none',
    border:     '1px solid #30363d',
    borderRadius:'8px',
    color:      '#8b949e',
    fontSize:   '13px',
    cursor:     'pointer',
  },
  backBtn: {
    background: 'none',
    border:     'none',
    color:      '#8b949e',
    fontSize:   '13px',
    cursor:     'pointer',
    display:    'flex',
    alignItems: 'center',
    gap:        '4px',
  },
  attemptsWarn: {
    textAlign:    'center',
    fontSize:     '12px',
    color:        '#f85149',
    background:   '#f8514920',
    padding:      '8px',
    borderRadius: '6px',
    border:       '1px solid #f8514940',
  },
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function OtpForm({
  email,
  purpose,
  maskedEmail,
  onVerified,
  onBack,
}) {
  const [otp, setOtp]           = useState(
    Array(OTP_LENGTH).fill('')
  );
  const [loading, setLoading]   = useState(false);
  const [timer, setTimer]       = useState(
    RESEND_COOLDOWN
  );
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const t = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace'
        && !otp[index]
        && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Auto submit when last digit entered
    if (e.key >= '0'
        && e.key <= '9'
        && index === OTP_LENGTH - 1) {
      const newOtp = [...otp];
      newOtp[index] = e.key;
      if (newOtp.every((d) => d !== '')) {
        setTimeout(() =>
          handleVerify(newOtp.join('')), 100
        );
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, OTP_LENGTH);

    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(''));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      // Auto verify on paste
      setTimeout(() => handleVerify(pasted), 100);
    }
  };

  const handleVerify = async (otpString) => {
    const code = otpString || otp.join('');

    if (code.length !== OTP_LENGTH) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, code, purpose);
      toast.success('Email verified!');
      onVerified();
    } catch (err) {
      const msg =
        err.response?.data?.message
        || 'Invalid OTP.';
      toast.error(msg);
      setAttempts((a) => a + 1);
      // Clear OTP inputs on wrong attempt
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await sendOtp(email, purpose);
      toast.success('New OTP sent!');
      setTimer(RESEND_COOLDOWN);
      setCanResend(false);
      setAttempts(0);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error('Failed to resend OTP.');
    }
  };

  return (
    <div style={s.wrapper}>

      <div style={s.header}>
        <div style={s.title}>
          Check your email
        </div>
        <div style={s.subtitle}>
          We sent a 6-digit code to{' '}
          <span style={s.maskedEmail}>
            {maskedEmail || email}
          </span>
          <br />
          Enter it below to continue.
        </div>
      </div>

      {/* OTP inputs */}
      <div
        style={s.otpRow}
        onPaste={handlePaste}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) =>
              (inputRefs.current[index] = el)
            }
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) =>
              handleOtpChange(index, e.target.value)
            }
            onKeyDown={(e) =>
              handleKeyDown(index, e)
            }
            style={{
              ...s.otpInput,
              borderColor: digit
                ? '#58a6ff' : '#30363d',
            }}
            autoFocus={index === 0}
          />
        ))}
      </div>

      {/* Wrong attempts warning */}
      {attempts >= 2 && (
        <div style={s.attemptsWarn}>
          ⚠️ {3 - attempts} attempt
          {3 - attempts === 1 ? '' : 's'} remaining
          before OTP is invalidated.
        </div>
      )}

      {/* Timer */}
      <div style={s.timer}>
        {canResend ? (
          <span style={s.expiredText}>
            OTP expired.
          </span>
        ) : (
          <>
            Code expires in{' '}
            <span style={s.timerCount}>
              {Math.floor(timer / 60)}:
              {String(timer % 60).padStart(2, '0')}
            </span>
          </>
        )}
      </div>

      {/* Verify button */}
      <button
        style={{
          ...s.submitBtn,
          opacity:
            loading ||
            otp.some((d) => !d) ? 0.7 : 1,
        }}
        disabled={
          loading || otp.some((d) => !d)
        }
        onClick={() => handleVerify()}
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>

      {/* Resend button */}
      <button
        style={{
          ...s.resendBtn,
          cursor: canResend ? 'pointer' : 'default',
          opacity: canResend ? 1 : 0.5,
        }}
        onClick={handleResend}
        disabled={!canResend}
      >
        {canResend
          ? '📧 Resend OTP'
          : `Resend available in ${timer}s`}
      </button>

      {/* Back button */}
      <button style={s.backBtn} onClick={onBack}>
        ← Back
      </button>
    </div>
  );
}