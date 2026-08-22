import React, { useState } from 'react';
import { 
  Activity, ShieldCheck, Stethoscope, User, Lock, Mail, Eye, 
  EyeOff, Sparkles, ArrowRight, Building2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { loginUser, registerUser } from '../api';

export default function LoginPage({ onLoginSuccess, onContinueAsGuest }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('Clinician'); // 'Clinician' | 'Patient'
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const data = await loginUser(email, password, role);
        onLoginSuccess(data.user, data.token);
      } else {
        if (!name.trim()) throw new Error('Please enter your full name');
        const data = await registerUser(name, email, password, role, institution);
        onLoginSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole) => {
    setError(null);
    setLoading(true);
    try {
      const demoEmail = demoRole === 'Clinician' ? 'doctor@aegismed.ai' : 'patient@aegismed.ai';
      const data = await loginUser(demoEmail, 'password123', demoRole);
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'radial-gradient(ellipse at top, #0f172a 0%, #090d16 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Decorative Glow Orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '15%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '15%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '1040px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        borderRadius: '24px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(6, 182, 212, 0.15)',
        overflow: 'hidden'
      }}>
        
        {/* Left Hero & Features Panel */}
        <div style={{
          padding: '44px 36px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(12, 36, 68, 0.95) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '32px'
        }}>
          <div>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(6, 182, 212, 0.4)'
              }}>
                <Activity size={26} color="#ffffff" strokeWidth={2.5} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  Aegis<span style={{ color: '#06b6d4' }}>Med</span> AI
                </h1>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Clinical Intelligence Portal
                </span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3, marginBottom: '12px' }}>
              AI-Assisted Multi-Disease & Dermatological Diagnostics
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.6' }}>
              Secure access for medical practitioners, clinical researchers, and individuals to predictive health screening models and care networks.
            </p>

            {/* Feature Highlights */}
            <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'Random Forest Disease Classifier', desc: '132 symptoms mapped across 41 conditions with 100% benchmark accuracy.' },
                { title: 'CNN Skin Photo Diagnostics', desc: 'Multi-class visual analysis for Acne, Hyperpigmentation, Puffiness, and Wrinkles.' },
                { title: 'Tamil Nadu Healthcare Network', desc: '38 districts directory with live hours, ratings, and branch lookup.' }
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px'
                  }}>
                    <CheckCircle2 size={14} color="#06b6d4" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>{f.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance & Security Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '10px 14px', borderRadius: '10px'
          }}>
            <ShieldCheck size={20} color="#10b981" />
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              Encrypted Session • Clinical Decision Support Ready
            </span>
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Sign In / Sign Up Tab Switcher */}
          <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <button
              onClick={() => { setMode('login'); setError(null); }}
              style={{
                flex: 1, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 700,
                background: mode === 'login' ? 'linear-gradient(135deg, #06b6d4, #2563eb)' : 'transparent',
                color: mode === 'login' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              style={{
                flex: 1, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 700,
                background: mode === 'register' ? 'linear-gradient(135deg, #06b6d4, #2563eb)' : 'transparent',
                color: mode === 'register' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s ease'
              }}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Access Bar */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#06b6d4" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Instant 1-Click Demo Login
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Clinician')}
                disabled={loading}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: '#e2e8f0', padding: '8px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#06b6d4'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'}
              >
                <Stethoscope size={13} color="#06b6d4" />
                <span>Dr. Sarah Mitchell</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Patient')}
                disabled={loading}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#e2e8f0', padding: '8px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
              >
                <User size={13} color="#3b82f6" />
                <span>Alex (Patient)</span>
              </button>
            </div>
          </div>

          {/* Role Selector */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              Select Access Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div
                onClick={() => setRole('Clinician')}
                style={{
                  padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                  border: role === 'Clinician' ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: role === 'Clinician' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                  display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
                }}
              >
                <Stethoscope size={16} color={role === 'Clinician' ? '#22d3ee' : '#94a3b8'} />
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: role === 'Clinician' ? '#ffffff' : '#cbd5e1' }}>Clinician</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Doctor / Specialist</div>
                </div>
              </div>

              <div
                onClick={() => setRole('Patient')}
                style={{
                  padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                  border: role === 'Patient' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: role === 'Patient' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                  display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
                }}
              >
                <User size={16} color={role === 'Patient' ? '#60a5fa' : '#94a3b8'} />
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: role === 'Patient' ? '#ffffff' : '#cbd5e1' }}>Patient</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Individual User</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder={role === 'Clinician' ? "e.g. Dr. Sarah Mitchell" : "e.g. Alex Johnson"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-control"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@hospital.com or user@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
                  Password
                </label>
                {mode === 'login' && (
                  <span
                    onClick={() => alert("For instant login, you can use password123 or any test password.")}
                    style={{ fontSize: '0.75rem', color: '#06b6d4', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Forgot password?
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '38px', paddingRight: '38px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && role === 'Clinician' && (
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Hospital / Institution Affiliation
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="e.g. Apollo Hospitals, CMC Vellore, KMCH"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="input-control"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', fontSize: '0.8rem'
              }}>
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#06b6d4', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '0.78rem', color: '#94a3b8', cursor: 'pointer' }}>
                Keep me authenticated on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '0.925rem', marginTop: '6px' }}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? `Sign In as ${role}` : 'Create Clinical Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Continue as Guest Button */}
          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={onContinueAsGuest}
              style={{
                background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.825rem',
                cursor: 'pointer', textDecoration: 'underline', transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#06b6d4'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              Skip login and continue as Guest Researcher
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
