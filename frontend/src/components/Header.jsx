import React from 'react';
import { 
  Activity, ShieldAlert, Sparkles, Building2, Stethoscope, 
  Camera, User, LogOut, LogIn, ChevronDown 
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  backendStatus, 
  currentUser, 
  onLogout, 
  onOpenLogin 
}) {
  return (
    <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '12px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)'
          }}>
            <Activity size={24} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Aegis<span style={{ color: '#0EA5E9' }}>Med</span> AI
              </h1>
              <span style={{
                background: 'rgba(14, 165, 233, 0.15)', color: '#22d3ee',
                border: '1px solid rgba(14, 165, 233, 0.3)', padding: '2px 8px',
                borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase'
              }}>
                Diagnostic v2.0
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Random Forest Ensemble • CNN Dermatology • Tamil Nadu Healthcare Directory
            </p>
          </div>
        </div>

        {/* Navigation Mode Switcher */}
        <div style={{
          display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)',
          padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => setActiveTab('symptoms')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              background: activeTab === 'symptoms' ? 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)' : 'transparent',
              color: activeTab === 'symptoms' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'symptoms' ? '0 4px 12px rgba(14, 165, 233, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Stethoscope size={16} />
            <span>Symptom Diagnostic</span>
          </button>

          <button
            onClick={() => setActiveTab('skin')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              background: activeTab === 'skin' ? 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)' : 'transparent',
              color: activeTab === 'skin' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'skin' ? '0 4px 12px rgba(14, 165, 233, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Camera size={16} />
            <span>Skin Photo AI</span>
          </button>

          <button
            onClick={() => setActiveTab('hospitals')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              background: activeTab === 'hospitals' ? 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)' : 'transparent',
              color: activeTab === 'hospitals' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'hospitals' ? '0 4px 12px rgba(14, 165, 233, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Building2 size={16} />
            <span>Hospital Finder</span>
          </button>
        </div>

        {/* User Profile / Auth Control & Backend Pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Backend Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
            borderRadius: '9999px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div className="pulse-dot" style={{ backgroundColor: backendStatus ? '#10b981' : '#f43f5e' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: backendStatus ? '#6ee7b7' : '#fda4af' }}>
              {backendStatus ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* User Profile Badge or Login Button */}
          {currentUser ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '4px 8px 4px 12px', borderRadius: '12px'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                  {currentUser.name}
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  color: currentUser.role === 'Clinician' ? '#22d3ee' : '#93c5fd',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {currentUser.role}
                </div>
              </div>

              <div style={{
                width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden',
                border: '1px solid rgba(14, 165, 233, 0.4)', background: '#1e293b'
              }}>
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80"}
                  alt={currentUser.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <button
                onClick={onLogout}
                title="Sign Out"
                style={{
                  background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)',
                  color: '#fda4af', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              <LogIn size={14} />
              <span>Sign In / Portal</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
